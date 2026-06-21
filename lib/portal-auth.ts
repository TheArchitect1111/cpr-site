// Portal session token utilities.
// Uses the Web Crypto API so this file works in both Edge (middleware)
// and Node.js (API routes) runtimes.

import { isProductionDeploy } from '@/lib/env';

export const PORTAL_COOKIE = 'cpr_portal_session';
const DEV_SECRET = 'cpr-portal-dev-secret-change-in-prod';
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export type PortalSession = {
  type: 'athlete' | 'parent';
  slug: string;
  exp: number; // Unix ms timestamp
};

function b64url(buf: ArrayBuffer | Uint8Array): string {
  const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode(...u8))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function fromB64url(s: string): Uint8Array {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(padded);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function portalSecret(): string | null {
  const secret = process.env.PORTAL_SECRET?.trim();
  if (secret) return secret;
  if (isProductionDeploy()) return null;
  return DEV_SECRET;
}

async function getKey(): Promise<CryptoKey | null> {
  const secret = portalSecret();
  if (!secret) return null;
  return globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function signSession(session: PortalSession): Promise<string | null> {
  const payload = JSON.stringify(session);
  const payloadB64 = b64url(new TextEncoder().encode(payload));
  const key = await getKey();
  if (!key) return null;
  const sig = await globalThis.crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));
  return `${payloadB64}.${b64url(sig)}`;
}

export async function verifySession(token: string): Promise<PortalSession | null> {
  try {
    const dot = token.lastIndexOf('.');
    if (dot < 0) return null;
    const payloadB64 = token.slice(0, dot);
    const sigB64 = token.slice(dot + 1);
    const key = await getKey();
    if (!key) return null;
    const sigBytes = fromB64url(sigB64);
    const valid = await globalThis.crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes.buffer.slice(sigBytes.byteOffset, sigBytes.byteOffset + sigBytes.byteLength) as ArrayBuffer,
      new TextEncoder().encode(payloadB64),
    );
    if (!valid) return null;
    const session = JSON.parse(
      new TextDecoder().decode(fromB64url(payloadB64)),
    ) as PortalSession;
    if (session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export function makeSessionCookie(value: string): { name: string; value: string; httpOnly: boolean; secure: boolean; sameSite: 'lax'; path: string; maxAge: number } {
  return {
    name: PORTAL_COOKIE,
    value,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: TTL_MS / 1000,
  };
}

export function newExpiry(): number {
  return Date.now() + TTL_MS;
}
