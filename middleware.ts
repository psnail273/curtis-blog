import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSessionFromHeader } from '@/lib/admin-auth';

/**
 * Middleware to protect admin routes.
 *
 * - /admin page: allows through (the page itself handles showing login vs content)
 * - /api/admin/auth: always allowed (login/logout/check endpoints)
 * - /api/admin/*: requires valid session cookie, returns 401 if missing/invalid
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow auth endpoints through without verification
  if (pathname === '/api/admin/auth') {
    return NextResponse.next();
  }

  // Protect admin API routes
  if (pathname.startsWith('/api/admin')) {
    const cookieHeader = request.headers.get('cookie');
    const authenticated = await verifyAdminSessionFromHeader(cookieHeader);

    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/admin/:path*'],
};
