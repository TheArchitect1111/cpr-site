import type { HmacSessionConfig } from '@ea/portal-chassis/hmac';

/** CPR tenant bindings for @ea/portal-chassis HMAC auth. */
export const CPR_PORTAL_SESSION: HmacSessionConfig = {
  secretEnvKey: 'PORTAL_SECRET',
  devSecret: 'cpr-portal-dev-secret-change-in-prod',
};

export const CPR_PORTAL_COOKIE = 'cpr_portal_session';
export const CPR_ADMIN_COOKIE = 'cpr_admin_session';
