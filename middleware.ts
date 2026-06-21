import { createHmacPortalMiddleware } from '@ea/portal-chassis/middleware';
import {
  CPR_ADMIN_COOKIE,
  CPR_PORTAL_COOKIE,
  CPR_PORTAL_SESSION,
} from '@/lib/chassis/cpr-portal';

const { middleware } = createHmacPortalMiddleware({
  cookieName: CPR_PORTAL_COOKIE,
  loginPath: '/portal/login',
  session: CPR_PORTAL_SESSION,
  adminCookieName: CPR_ADMIN_COOKIE,
  adminLoginPath: '/admin/login',
  roleRoutes: [
    { pathPrefix: '/portal/athlete/', roleValue: 'athlete' },
    { pathPrefix: '/portal/parent/', roleValue: 'parent' },
  ],
});

export default middleware;

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/portal/athlete/:path*',
    '/portal/parent/:path*',
  ],
};