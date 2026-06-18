import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession, PORTAL_COOKIE } from '@/lib/portal-auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (
      pathname.startsWith('/admin/login') ||
      pathname.startsWith('/admin/forgot-password') ||
      pathname.startsWith('/admin/reset-password')
    ) {
      return NextResponse.next();
    }

    if (req.cookies.get('cpr_admin_session')?.value) return NextResponse.next();

    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

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

    const parts = pathname.split('/');
    const urlType = parts[2];
    const urlSlug = parts[3];

    if (session.type !== urlType || session.slug !== urlSlug) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/portal/login';
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin', '/portal/athlete/:path*', '/portal/parent/:path*'],
};
