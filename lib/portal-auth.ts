import {
  signHmacSession,
  verifyHmacSession,
  makeSessionCookie as makeChassisSessionCookie,
  newSessionExpiry,
} from '@ea/portal-chassis/hmac';
import { CPR_PORTAL_COOKIE, CPR_PORTAL_SESSION } from '@/lib/chassis/cpr-portal';

export const PORTAL_COOKIE = CPR_PORTAL_COOKIE;

export type PortalRole = 'athlete' | 'parent';

export type PortalSession = {
  type: PortalRole;
  slug: string;
  exp: number;
};

export function isPortalRole(value: unknown): value is PortalRole {
  return value === 'athlete' || value === 'parent';
}

export function normalizePortalSession(session: unknown): PortalSession | null {
  if (!session || typeof session !== 'object') return null;
  const candidate = session as Partial<PortalSession>;
  if (!isPortalRole(candidate.type)) return null;
  if (typeof candidate.slug !== 'string' || !candidate.slug.trim()) return null;
  if (typeof candidate.exp !== 'number' || !Number.isFinite(candidate.exp)) return null;
  return {
    type: candidate.type,
    slug: candidate.slug,
    exp: candidate.exp,
  };
}

export async function signSession(session: PortalSession): Promise<string | null> {
  const normalized = normalizePortalSession(session);
  if (!normalized) return null;
  return signHmacSession(normalized, CPR_PORTAL_SESSION);
}

export async function verifySession(token: string): Promise<PortalSession | null> {
  const session = await verifyHmacSession<PortalSession>(token, CPR_PORTAL_SESSION);
  return normalizePortalSession(session);
}

export function makeSessionCookie(value: string) {
  return makeChassisSessionCookie(PORTAL_COOKIE, value);
}

export function newExpiry(): number {
  return newSessionExpiry();
}
