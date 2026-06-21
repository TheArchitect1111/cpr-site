import { createHmacPortalMiddleware } from '@/lib/chassis/auth/hmac-middleware-factory';
import {
  CPR_ADMIN_COOKIE,
  CPR_PORTAL_COOKIE,
  CPR_PORTAL_SESSION,
} from '@/lib/chassis/cpr-portal';

const { middleware, config } = createHmacPortalMiddleware({
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
export { config };
