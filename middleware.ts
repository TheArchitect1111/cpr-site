import { NextRequest, NextResponse } from 'next/server';
import { verifyHmacSession } from '@ea/portal-chassis/hmac';
import {
  CPR_ADMIN_COOKIE,
  CPR_PORTAL_COOKIE,
  CPR_PORTAL_SESSION,
} from '@/lib/chassis/cpr-portal';
import { looksLikeAdminSessionToken, verifyAdminSessionEdge } from '@/lib/edge-admin-session';
import type { PortalSession } from '@/lib/portal-auth';
import { isOpenStaging } from '@/lib/staging';

const ADMIN_PREFIX = '/admin';
const ADMIN_LOGIN = '/admin/login';
const ADMIN_PUBLIC = new Set([
  '/admin/login',
  '/admin/forgot-password',
  '/admin/reset-password',
]);

const PORTAL_LOGIN = '/portal/login';
const PORTAL_PUBLIC = new Set([
  '/portal/login',
  '/portal/forgot-password',
  '/portal/reset-password',
]);

const ROLE_ROUTES = [
  { pathPrefix: '/portal/athlete/', roleValue: 'athlete' },
  { pathPrefix: '/portal/parent/', roleValue: 'parent' },
] as const;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isOpenStaging()) return NextResponse.next();

  if (pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`)) {
    const isPublic = [...ADMIN_PUBLIC].some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );
    if (isPublic) return NextResponse.next();

    const token = req.cookies.get(CPR_ADMIN_COOKIE)?.value ?? '';
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = ADMIN_LOGIN;
      url.searchParams.set('next', pathname + req.nextUrl.search);
      return NextResponse.redirect(url);
    }

    const admin = await verifyAdminSessionEdge(token);
    if (admin) return NextResponse.next();

    // Pre-hardening middleware only checked cookie presence; admin pages verify on Node.
    // Fallback avoids login loops when edge env/secret verification drifts from server signing.
    if (looksLikeAdminSessionToken(token)) return NextResponse.next();

    const url = req.nextUrl.clone();
    url.pathname = ADMIN_LOGIN;
    url.searchParams.set('next', pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  if (PORTAL_PUBLIC.has(pathname)) {
    return NextResponse.next();
  }

  for (const route of ROLE_ROUTES) {
    if (!pathname.startsWith(route.pathPrefix)) continue;

    const cookieVal = req.cookies.get(CPR_PORTAL_COOKIE)?.value ?? '';
    const session = cookieVal
      ? await verifyHmacSession<PortalSession>(cookieVal, CPR_PORTAL_SESSION)
      : null;
    if (!session) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = PORTAL_LOGIN;
      return NextResponse.redirect(loginUrl);
    }

    const parts = pathname.split('/');
    const prefixParts = route.pathPrefix.split('/').filter(Boolean);
    const urlRole = parts[prefixParts.length] ?? '';
    const urlSlug = parts[prefixParts.length + 1] ?? '';
    const sessionRole = String(session.type ?? '');
    const sessionSlug = String(session.slug ?? '');

    if (sessionRole !== route.roleValue || sessionRole !== urlRole || sessionSlug !== urlSlug) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = PORTAL_LOGIN;
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/portal/login',
    '/portal/forgot-password',
    '/portal/reset-password',
    '/portal/athlete/:path*',
    '/portal/parent/:path*',
  ],
};
