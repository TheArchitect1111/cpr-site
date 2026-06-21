// CPR portal session adapter — EA Portal Chassis HMAC layer.

import {
  signHmacSession,
  verifyHmacSession,
  makeSessionCookie as makeChassisSessionCookie,
  newSessionExpiry,
} from '@/lib/chassis/auth/hmac-session';
import { CPR_PORTAL_COOKIE, CPR_PORTAL_SESSION } from '@/lib/chassis/cpr-portal';

export const PORTAL_COOKIE = CPR_PORTAL_COOKIE;

export type PortalSession = {
  type: 'athlete' | 'parent';
  slug: string;
  exp: number;
};

export async function signSession(session: PortalSession): Promise<string | null> {
  return signHmacSession(session, CPR_PORTAL_SESSION);
}

export async function verifySession(token: string): Promise<PortalSession | null> {
  return verifyHmacSession<PortalSession>(token, CPR_PORTAL_SESSION);
}

export function makeSessionCookie(value: string) {
  return makeChassisSessionCookie(PORTAL_COOKIE, value);
}

export function newExpiry(): number {
  return newSessionExpiry();
}
