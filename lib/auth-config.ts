/**
 * CPR Platform — single source of truth for authentication readiness.
 * Used by System Readiness, forgot-password pages, and magic-link API.
 */

import { magicLinkConfigured } from '@/lib/magic-link';
import { getAdminSessionSecret } from '@/lib/admin-session-secret';
import { adminUsers } from '@/lib/admin-auth';

export type AuthReadiness = {
  /** HMAC secret for sessions + magic links + password-reset tokens */
  sessionSecret: boolean;
  /** At least one admin identity (env, Airtable, or allowlist) */
  adminIdentity: boolean;
  adminCount: number;
  /** Resend configured for login/reset emails */
  emailDelivery: boolean;
  emailFrom: boolean;
  /** Airtable Admin Users table — required to persist password changes */
  adminUserStorage: boolean;
  /** Portal HMAC secret */
  portalSecret: boolean;
  /** Primary login method available */
  magicLinkReady: boolean;
  /** Password login + reset can persist to Airtable */
  passwordResetReady: boolean;
  /** Human-readable blockers */
  blockers: string[];
};

export function getAuthReadiness(): AuthReadiness {
  const sessionSecret = Boolean(getAdminSessionSecret());
  const admins = adminUsers();
  const adminIdentity = admins.length > 0 || Boolean(process.env.AIRTABLE_ADMIN_USERS_TABLE_ID);
  const emailDelivery = Boolean(process.env.RESEND_API_KEY?.trim());
  const emailFrom = Boolean(process.env.RESEND_FROM_EMAIL?.trim());
  const adminUserStorage = Boolean(
    process.env.AIRTABLE_ADMIN_USERS_TABLE_ID?.trim() && process.env.AIRTABLE_TOKEN?.trim(),
  );
  const portalSecret = Boolean(process.env.PORTAL_SECRET?.trim());
  const magicLinkReady = magicLinkConfigured() && emailDelivery;
  const passwordResetReady = magicLinkReady && adminUserStorage;

  const blockers: string[] = [];
  if (!sessionSecret) {
    blockers.push('Set ADMIN_AUTH_SECRET on Vercel Production (openssl rand -hex 32).');
  }
  if (!emailDelivery) {
    blockers.push('Set RESEND_API_KEY so login and reset emails can send.');
  }
  if (!emailFrom) {
    blockers.push('Set RESEND_FROM_EMAIL to a verified sender domain in Resend.');
  }
  if (!adminIdentity && !process.env.AIRTABLE_TOKEN) {
    blockers.push('Configure ADMIN_EMAIL + ADMIN_PASSWORD or AIRTABLE_ADMIN_USERS_TABLE_ID with Mike\'s account.');
  }
  if (!adminUserStorage) {
    blockers.push(
      'Set AIRTABLE_ADMIN_USERS_TABLE_ID + AIRTABLE_TOKEN to save password changes (magic-link login works without this).',
    );
  }
  if (!portalSecret) {
    blockers.push('Set PORTAL_SECRET for athlete/parent portal sessions.');
  }

  return {
    sessionSecret,
    adminIdentity,
    adminCount: admins.length,
    emailDelivery,
    emailFrom,
    adminUserStorage,
    portalSecret,
    magicLinkReady,
    passwordResetReady,
    blockers,
  };
}

export function passwordResetBlockedReason(): string | null {
  const r = getAuthReadiness();
  if (!r.sessionSecret) {
    return 'Password reset is not configured. Set ADMIN_AUTH_SECRET on Vercel Production, then run System Readiness in the admin portal or contact the site owner.';
  }
  if (!r.emailDelivery) {
    return 'Password reset email cannot send. Set RESEND_API_KEY on Vercel Production, then try again.';
  }
  if (!r.adminUserStorage) {
    return 'Password reset cannot save a new password yet. Set AIRTABLE_ADMIN_USERS_TABLE_ID on Vercel, or use Email me a login link on the sign-in page (no password needed).';
  }
  return null;
}

export function magicLinkBlockedReason(): string | null {
  const r = getAuthReadiness();
  if (!r.magicLinkReady) {
    if (!r.sessionSecret) {
      return 'Login is not configured. Set ADMIN_AUTH_SECRET on Vercel Production.';
    }
    if (!r.emailDelivery) {
      return 'Login email cannot send. Set RESEND_API_KEY on Vercel Production.';
    }
  }
  return null;
}
