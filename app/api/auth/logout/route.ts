// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/mongoose';
import Admin from '@/models/Admin';
import ActivityLog from '@/models/ActivityLog';
import { verifyRefreshToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const refreshToken = request.cookies.get('refresh_token')?.value;

    if (refreshToken) {
      const payload = await verifyRefreshToken(refreshToken);
      if (payload) {
        const admin = await Admin.findById(payload.adminId);
        if (admin) {
          // Revoke this specific refresh token (not all sessions)
          for (const token of admin.refreshTokens) {
            const matches = await bcrypt.compare(refreshToken, token.token);
            if (matches) {
              token.isRevoked = true;
              break;
            }
          }
          await admin.save();

          await ActivityLog.create({
            action: 'logout',
            targetType: 'admin',
            targetTitle: admin.username,
            ipAddress: ip,
          });
        }
      }
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    return response;

  } catch (error) {
    console.error('[Auth/Logout] Error:', error);
    // Even on error, clear cookies
    const response = NextResponse.json({ success: true, message: 'Logged out' });
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    return response;
  }
}
