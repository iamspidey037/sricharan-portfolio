// lib/auth/jwt.ts
// JWT utilities for access tokens and refresh tokens
// Uses the 'jose' library for edge-compatible JWT (works in Next.js middleware)

import { SignJWT, jwtVerify } from 'jose';
import type { AccessTokenPayload, RefreshTokenPayload } from '@/types/admin';

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || 'CHANGE-THIS-SECRET-IN-PRODUCTION'
);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'CHANGE-THIS-REFRESH-SECRET-IN-PRODUCTION'
);

// Access token: short-lived (15 minutes)
export const ACCESS_TOKEN_EXPIRY = '15m';

// Refresh token: 7 days standard, 30 days with "Remember Me"
export const REFRESH_TOKEN_EXPIRY_DEFAULT = '7d';
export const REFRESH_TOKEN_EXPIRY_REMEMBER = '30d';

// ── Generate access token ──────────────────────────────────
export async function generateAccessToken(
  adminId: string,
  username: string
): Promise<string> {
  return new SignJWT({ adminId, username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .setIssuer('portfolio-admin')
    .setAudience('portfolio-client')
    .sign(ACCESS_SECRET);
}

// ── Generate refresh token ─────────────────────────────────
export async function generateRefreshToken(
  adminId: string,
  tokenId: string,    // Unique ID stored in DB to allow selective revocation
  rememberMe = false
): Promise<string> {
  const expiry = rememberMe ? REFRESH_TOKEN_EXPIRY_REMEMBER : REFRESH_TOKEN_EXPIRY_DEFAULT;
  return new SignJWT({ adminId, tokenId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiry)
    .setIssuer('portfolio-admin')
    .setAudience('portfolio-refresh')
    .sign(REFRESH_SECRET);
}

// ── Verify access token ────────────────────────────────────
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET, {
      issuer: 'portfolio-admin',
      audience: 'portfolio-client',
    });
    return payload as unknown as AccessTokenPayload;
  } catch {
    return null;  // Token invalid or expired
  }
}

// ── Verify refresh token ───────────────────────────────────
export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET, {
      issuer: 'portfolio-admin',
      audience: 'portfolio-refresh',
    });
    return payload as unknown as RefreshTokenPayload;
  } catch {
    return null;
  }
}

// ── Extract token from Authorization header ────────────────
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

// ── Calculate expiry date from duration string ─────────────
export function getExpiryDate(duration: string): Date {
  const now = Date.now();
  const match = duration.match(/^(\d+)([mhd])$/);
  if (!match) return new Date(now + 7 * 24 * 60 * 60 * 1000); // Default 7 days

  const value = parseInt(match[1]);
  const unit = match[2];

  let ms: number;
  switch (unit) {
    case 'm': ms = value * 60 * 1000; break;
    case 'h': ms = value * 60 * 60 * 1000; break;
    case 'd': ms = value * 24 * 60 * 60 * 1000; break;
    default: ms = 7 * 24 * 60 * 60 * 1000;
  }

  return new Date(now + ms);
}
