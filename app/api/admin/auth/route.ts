import { NextRequest, NextResponse } from 'next/server';
import {
  verifyPassword,
  createSessionToken,
  COOKIE_NAME,
  SESSION_MAX_AGE,
} from '@/lib/admin-auth';

/**
 * POST /api/admin/auth
 *
 * Login endpoint. Validates password against ADMIN_PASSWORD env var.
 * On success, sets an HTTP-only session cookie.
 * Body: { password: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required.' },
        { status: 400 }
      );
    }

    if (!verifyPassword(password)) {
      return NextResponse.json(
        { error: 'Invalid password.' },
        { status: 401 }
      );
    }

    const token = await createSessionToken();
    const isProduction = process.env.NODE_ENV === 'production';

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/auth
 *
 * Logout endpoint. Clears the session cookie.
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
  return response;
}

/**
 * GET /api/admin/auth
 *
 * Session check endpoint. Returns whether the current session is valid.
 * This is an open endpoint (not protected by middleware) so the client
 * can check auth status before showing the login form.
 */
export async function GET(request: NextRequest) {
  try {
    const { verifyAdminSessionFromHeader } = await import('@/lib/admin-auth');
    const cookieHeader = request.headers.get('cookie');
    const authenticated = await verifyAdminSessionFromHeader(cookieHeader);
    return NextResponse.json({ authenticated });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
