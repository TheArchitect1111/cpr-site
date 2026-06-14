import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession, PORTAL_COOKIE } from '@/lib/portal-auth';

// Protects /admin with HTTP Basic Auth.
// Protects /portal/athlete/:slug and /portal/parent/:slug with signed session cookie.
// Set ADMIN_PASSWORD (and optional ADMIN_USER, default "cpr") in Vercel env vars.

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin: HTTP Basic Auth (unchanged) ─────────────────────────────────────
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const password = process.env.ADMIN_PASSWORD;
    const user = process.env.ADMIN_USER || 'cpr';

    if (!password) {
      return new NextResponse(
        'Admin portal not configured. Set ADMIN_PASSWORD in Vercel environment variables.',
        { status: 503 },
      );
    }

    const header = req.headers.get('authorization') || '';
    const [scheme, encoded] = header.split(' ');
    if (scheme === 'Basic' && encoded) {
      const [u, p] = Buffer.from(encoded, 'base64').toString().split(':');
      if (u === user && p === password) return NextResponse.next();
    }
    return new NextResponse('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="CPR Admin"' },
    });
  }

  // ── Portal: signed session cookie ──────────────────────────────────────────
  if (
    pathname.startsWith('/portal/athlete/') ||
    pathname.startsWith('/portal/parent/')
  ) {
    const cookieVal = req.cookies.get(PORTAL_COOKIE)?.value ?? '';
    const session = cookieVal ? await verifySession(cookieVal) : null;

    if (!session) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/portal/login';
      return NextResponse.redirect(loginUrl);
    }

    // Validate that the session type and slug match the URL
    // e.g. /portal/athlete/jayden-thompson → parts[2]='athlete', parts[3]='jayden-thompson'
    const parts = pathname.split('/'); // ['', 'portal', 'athlete|parent', 'slug', ...]
    const urlType = parts[2];
    const urlSlug = parts[3];

    if (session.type !== urlType || session.slug !== urlSlug) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/portal/login';
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin', '/portal/athlete/:path*', '/portal/parent/:path*'],
};
