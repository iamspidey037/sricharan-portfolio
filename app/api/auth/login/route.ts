// app/api/auth/login/route.ts
// Admin login endpoint
// Features: bcrypt verification, JWT generation, rate limiting, activity logging

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { connectDB } from '@/lib/db/mongoose';
import Admin from '@/models/Admin';
import ActivityLog from '@/models/ActivityLog';
import {
  generateAccessToken,
  generateRefreshToken,
  getExpiryDate,
  REFRESH_TOKEN_EXPIRY_DEFAULT,
  REFRESH_TOKEN_EXPIRY_REMEMBER,
} from '@/lib/auth/jwt';

// In-memory rate limiter (use Redis in production for multi-instance)
// Maps: IP -> { attempts: number, resetAt: Date }
const loginAttempts = new Map<string, { attempts: number; resetAt: Date }>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const WINDOW_MINUTES = 15;

function checkRateLimit(ip: string): { allowed: boolean; remainingAttempts: number; resetAt?: Date } {
  const now = new Date();
  const entry = loginAttempts.get(ip);

  // No previous attempts or window expired
  if (!entry || entry.resetAt < now) {
    loginAttempts.set(ip, { attempts: 1, resetAt: new Date(now.getTime() + WINDOW_MINUTES * 60000) });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    return { allowed: false, remainingAttempts: 0, resetAt: entry.resetAt };
  }

  entry.attempts += 1;
  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - entry.attempts };
}

function resetRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get client IP for rate limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    // ── Rate limit check ────────────────────────────────────
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      const minutesLeft = Math.ceil((rateCheck.resetAt!.getTime() - Date.now()) / 60000);
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed login attempts. Please wait ${minutesLeft} minute(s) before trying again.`,
          lockedUntil: rateCheck.resetAt,
        },
        { status: 429 }
      );
    }

    // ── Parse and validate request body ────────────────────
    let body: { username?: string; password?: string; rememberMe?: boolean };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { username, password, rememberMe = false } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const cleanUsername = username.trim().toLowerCase().slice(0, 30);

    // ── Find admin user ─────────────────────────────────────
    // Must explicitly select passwordHash since it has select: false in schema
    const admin = await Admin.findOne({ username: cleanUsername }).select('+passwordHash');

    if (!admin) {
      // Don't reveal whether username exists (timing attack prevention)
      // Simulate bcrypt delay
      await bcrypt.hash('dummy', 12);
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // ── Check account lockout ───────────────────────────────
    if (admin.isLocked) {
      const minutesLeft = Math.ceil(
        (admin.lockedUntil!.getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        {
          success: false,
          error: `Account is locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`,
        },
        { status: 423 }
      );
    }

    // ── Verify password ─────────────────────────────────────
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

    if (!isPasswordValid) {
      // Increment failed attempts
      await admin.incrementFailedLogin();
      const attemptsLeft = MAX_ATTEMPTS - admin.failedLoginAttempts;

      return NextResponse.json(
        {
          success: false,
          error: `Invalid username or password. ${attemptsLeft > 0 ? `${attemptsLeft} attempt(s) remaining.` : 'Account locked.'}`,
        },
        { status: 401 }
      );
    }

    // ── Login successful ────────────────────────────────────
    // Reset failed attempts
    await admin.resetFailedLogin();
    resetRateLimit(ip);

    // Update last login info
    admin.lastLoginAt = new Date();
    admin.lastLoginIP = ip;
    await admin.cleanRefreshTokens();  // Clean up expired tokens

    // Generate token pair
    const tokenId = nanoid(32);  // Unique ID for this refresh token
    const accessToken = await generateAccessToken(admin._id.toString(), admin.username);
    const refreshExpiry = rememberMe ? REFRESH_TOKEN_EXPIRY_REMEMBER : REFRESH_TOKEN_EXPIRY_DEFAULT;
    const refreshToken = await generateRefreshToken(admin._id.toString(), tokenId, rememberMe);

    // Store hashed refresh token in DB
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    admin.refreshTokens.push({
      token: hashedRefreshToken,
      createdAt: new Date(),
      expiresAt: getExpiryDate(refreshExpiry),
      deviceInfo: request.headers.get('user-agent') || undefined,
      ipAddress: ip,
      isRevoked: false,
    });

    await admin.save();

    // Log the activity
    await ActivityLog.create({
      action: 'login',
      targetType: 'admin',
      targetTitle: admin.username,
      details: `Successful login from ${ip}`,
      ipAddress: ip,
    });

    // ── Set cookies ─────────────────────────────────────────
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        admin: {
          id: admin._id,
          username: admin.username,
          displayName: admin.displayName,
          email: admin.email,
          profilePhotoUrl: admin.profilePhotoUrl,
        },
        accessToken,  // Also returned for localStorage if needed
      },
    });

    // Set access token cookie (short-lived, HTTP-only)
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,  // 15 minutes
      path: '/',
    });

    // Set refresh token cookie (long-lived, HTTP-only)
    const refreshMaxAge = rememberMe
      ? 30 * 24 * 60 * 60   // 30 days
      : 7 * 24 * 60 * 60;   // 7 days

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: refreshMaxAge,
      path: '/api/auth',  // Restrict refresh token to auth endpoint only
    });

    return response;

  } catch (error) {
    console.error('[Auth/Login] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
