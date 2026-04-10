// app/api/auth/refresh/route.ts
// Refresh access token using the stored refresh token

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/mongoose';
import Admin from '@/models/Admin';
import { verifyRefreshToken, generateAccessToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get refresh token from HTTP-only cookie
    const refreshToken = request.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'No refresh token provided' },
        { status: 401 }
      );
    }

    // Verify the JWT signature and expiry
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      const response = NextResponse.json(
        { success: false, error: 'Refresh token invalid or expired' },
        { status: 401 }
      );
      response.cookies.delete('refresh_token');
      response.cookies.delete('access_token');
      return response;
    }

    // Find admin and check if this token is in our DB (not revoked)
    const admin = await Admin.findById(payload.adminId);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Admin not found' }, { status: 401 });
    }

    // Find matching, non-revoked, non-expired token
    const now = new Date();
    const storedToken = admin.refreshTokens.find(
      (t) => !t.isRevoked && t.expiresAt > now
    );

    if (!storedToken) {
      return NextResponse.json(
        { success: false, error: 'Session expired. Please log in again.' },
        { status: 401 }
      );
    }

    // Verify the actual token value matches (compare with stored hash)
    const tokenMatches = await bcrypt.compare(refreshToken, storedToken.token);
    if (!tokenMatches) {
      return NextResponse.json(
        { success: false, error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Generate new access token
    const newAccessToken = await generateAccessToken(admin._id.toString(), admin.username);

    const response = NextResponse.json({
      success: true,
      data: { accessToken: newAccessToken },
    });

    // Set new access token cookie
    response.cookies.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[Auth/Refresh] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
