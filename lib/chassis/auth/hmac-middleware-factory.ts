import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyHmacSession, type HmacSessionConfig } from '@/lib/chassis/auth/hmac-session';

export type SlugRoleRoute = {
  pathPrefix: string;
  roleField?: string;
  roleValue: string;
};

export type HmacPortalMiddlewareConfig = {
  cookieName: string;
  loginPath: string;
  session: HmacSessionConfig;
  roleRoutes: SlugRoleRoute[];
  adminCookieName?: string;
  adminLoginPath?: string;
  adminPathPrefix?: string;
  adminPublicPaths?: string[];
};

export function createHmacPortalMiddleware(cfg: HmacPortalMiddlewareConfig) {
  const adminPrefix = cfg.adminPathPrefix ?? '/admin';
  const adminLogin = cfg.adminLoginPath ?? `${adminPrefix}/login`;
  const adminPublic = new Set(cfg.adminPublicPaths ?? [
    `${adminPrefix}/login`,
    `${adminPrefix}/forgot-password`,
    `${adminPrefix}/reset-password`,
  ]);

  async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (cfg.adminCookieName && (pathname === adminPrefix || pathname.startsWith(`${adminPrefix}/`))) {
      const isPublic = [...adminPublic].some((p) => pathname === p || pathname.startsWith(`${p}/`));
      if (isPublic) return NextResponse.next();
      if (req.cookies.get(cfg.adminCookieName)?.value) return NextResponse.next();
      const url = req.nextUrl.clone();
      url.pathname = adminLogin;
      url.searchParams.set('next', pathname + req.nextUrl.search);
      return NextResponse.redirect(url);
    }

    for (const route of cfg.roleRoutes) {
      if (!pathname.startsWith(route.pathPrefix)) continue;

      const cookieVal = req.cookies.get(cfg.cookieName)?.value ?? '';
      const session = cookieVal
        ? await verifyHmacSession<{ exp: number; slug?: string; type?: string }>(cookieVal, cfg.session)
        : null;

      if (!session) {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = cfg.loginPath;
        return NextResponse.redirect(loginUrl);
      }

      const parts = pathname.split('/');
      const prefixParts = route.pathPrefix.split('/').filter(Boolean);
      const urlRole = parts[prefixParts.length] ?? '';
      const urlSlug = parts[prefixParts.length + 1] ?? '';
      const roleField = route.roleField ?? 'type';
      const sessionRole =
        roleField === 'type'
          ? String(session.type ?? '')
          : roleField === 'slug'
            ? String(session.slug ?? '')
            : '';
      const sessionSlug = String(session.slug ?? '');

      if (sessionRole !== route.roleValue || sessionRole !== urlRole || sessionSlug !== urlSlug) {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = cfg.loginPath;
        return NextResponse.redirect(loginUrl);
      }

      return NextResponse.next();
    }

    return NextResponse.next();
  }

  const matchers = [
    ...(cfg.adminCookieName ? [adminPrefix, `${adminPrefix}/:path*`] : []),
    ...cfg.roleRoutes.map((r) => `${r.pathPrefix}:path*`),
  ];

  return { middleware, config: { matcher: matchers } };
}
