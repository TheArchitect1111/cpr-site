import { NextRequest, NextResponse } from 'next/server';
import { HmacSessionConfig } from './hmac.js';

/**
 * Protect routes shaped like /portal/{role}/{slug}/...
 * Matches CPR athlete/parent portal middleware pattern.
 */
type SlugRoleRoute = {
    /** URL prefix, e.g. '/portal/athlete/' */
    pathPrefix: string;
    /** Session field holding role, default 'type' */
    roleField?: string;
    /** Expected role value matching URL segment, e.g. 'athlete' */
    roleValue: string;
};
type HmacPortalMiddlewareConfig = {
    cookieName: string;
    loginPath: string;
    session: HmacSessionConfig;
    roleRoutes: SlugRoleRoute[];
    /** Optional admin cookie name — redirects to adminLoginPath when unset */
    adminCookieName?: string;
    adminLoginPath?: string;
    adminPathPrefix?: string;
    adminPublicPaths?: string[];
};
declare function createHmacPortalMiddleware(cfg: HmacPortalMiddlewareConfig): {
    middleware: (req: NextRequest) => Promise<NextResponse<unknown>>;
    config: {
        matcher: string[];
    };
};

export { type HmacPortalMiddlewareConfig, type SlugRoleRoute, createHmacPortalMiddleware };
