// middleware.ts
// Next.js edge middleware — runs before every request.
// Protects /admin/* routes (except /admin/login and /admin/setup)
// Uses edge-compatible JWT verification (jose library)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';

// Routes that are publicly accessible (no auth needed)
const PUBLIC_ROUTES = [
  '/admin/login',
  '/admin/setup',
];

// Admin API routes that are also protected
const PROTECTED_API_PREFIX = '/api/admin';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Protect /admin/* pages ──────────────────────────────
  if (pathname.startsWith('/admin')) {
    // Allow login and setup pages through
    if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
      // If already authenticated and trying to visit login, redirect to dashboard
      const accessToken = request.cookies.get('access_token')?.value;
      if (accessToken) {
        const payload = await verifyAccessToken(accessToken);
        if (payload) {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
      }
      return NextResponse.next();
    }

    // Check for access token in cookie or Authorization header
    const accessToken =
      request.cookies.get('access_token')?.value ||
      extractBearerToken(request.headers.get('Authorization'));

    if (!accessToken) {
      // No token — redirect to login with return URL
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify the token
    const payload = await verifyAccessToken(accessToken);
    if (!payload) {
      // Token invalid or expired — redirect to login
      // The client will try to refresh the token first (handled in useAuth hook)
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('expired', '1');
      loginUrl.searchParams.set('returnTo', pathname);

      // Clear the invalid token cookie
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('access_token');
      return response;
    }

    // Token valid — pass the admin ID in request headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-admin-id', payload.adminId);
    requestHeaders.set('x-admin-username', payload.username);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // ── Protect /api/admin/* routes ─────────────────────────
  if (pathname.startsWith(PROTECTED_API_PREFIX)) {
    const accessToken =
      request.cookies.get('access_token')?.value ||
      extractBearerToken(request.headers.get('Authorization'));

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized — no token provided' },
        { status: 401 }
      );
    }

    const payload = await verifyAccessToken(accessToken);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized — token invalid or expired' },
        { status: 401 }
      );
    }

    // Inject admin ID into headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-admin-id', payload.adminId);
    requestHeaders.set('x-admin-username', payload.username);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

// ── Helper ──────────────────────────────────────────────────
function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

// ── Matcher: which routes the middleware runs on ────────────
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
