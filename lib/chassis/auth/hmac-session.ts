import { isProductionDeploy } from '@/lib/chassis/env';

export type HmacSessionConfig = {
  secretEnvKey: string;
  devSecret?: string;
};

export type SessionCookieOptions = {
  name: string;
  value: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax';
  path: string;
  maxAge: number;
};

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

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

function resolveSecret(config: HmacSessionConfig): string | null {
  const secret = process.env[config.secretEnvKey]?.trim();
  if (secret) return secret;
  if (isProductionDeploy()) return null;
  return config.devSecret || 'ea-portal-dev-secret-change-in-prod';
}

async function getKey(config: HmacSessionConfig): Promise<CryptoKey | null> {
  const secret = resolveSecret(config);
  if (!secret) return null;
  return globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export function newSessionExpiry(ttlMs = DEFAULT_TTL_MS): number {
  return Date.now() + ttlMs;
}

export async function signHmacSession<T extends { exp: number }>(
  session: T,
  config: HmacSessionConfig,
): Promise<string | null> {
  const payload = JSON.stringify(session);
  const payloadB64 = b64url(new TextEncoder().encode(payload));
  const key = await getKey(config);
  if (!key) return null;
  const sig = await globalThis.crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));
  return `${payloadB64}.${b64url(sig)}`;
}

export async function verifyHmacSession<T extends { exp: number }>(
  token: string,
  config: HmacSessionConfig,
): Promise<T | null> {
  try {
    const dot = token.lastIndexOf('.');
    if (dot < 0) return null;
    const payloadB64 = token.slice(0, dot);
    const sigB64 = token.slice(dot + 1);
    const key = await getKey(config);
    if (!key) return null;
    const sigBytes = fromB64url(sigB64);
    const valid = await globalThis.crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes.buffer.slice(sigBytes.byteOffset, sigBytes.byteOffset + sigBytes.byteLength) as ArrayBuffer,
      new TextEncoder().encode(payloadB64),
    );
    if (!valid) return null;
    const session = JSON.parse(new TextDecoder().decode(fromB64url(payloadB64))) as T;
    if (session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export function makeSessionCookie(
  name: string,
  value: string,
  ttlMs = DEFAULT_TTL_MS,
): SessionCookieOptions {
  return {
    name,
    value,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ttlMs / 1000,
  };
}
