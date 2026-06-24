/** Edge-compatible admin session verification for middleware. */

import { getAdminSessionSecret } from '@/lib/admin-session-secret';

export type AdminSession = { email: string; role: string; name: string };

function fromB64url(input: string): Uint8Array {
  let padded = input.replace(/-/g, '+').replace(/_/g, '/');
  while (padded.length % 4) padded += '=';
  const bin = atob(padded);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function verifySignature(payloadB64: string, sigB64: string, key: CryptoKey): Promise<boolean> {
  const sigBytes = fromB64url(sigB64);
  const signature = sigBytes.buffer.slice(
    sigBytes.byteOffset,
    sigBytes.byteOffset + sigBytes.byteLength,
  ) as ArrayBuffer;
  return globalThis.crypto.subtle.verify(
    'HMAC',
    key,
    signature,
    new TextEncoder().encode(payloadB64),
  );
}

export async function verifyAdminSessionEdge(token: string): Promise<AdminSession | null> {
  const secret = getAdminSessionSecret();
  if (!secret || !token) return null;

  const dot = token.lastIndexOf('.');
  if (dot < 0) return null;
  const payloadB64 = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);
  if (!payloadB64 || !sigB64) return null;

  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );

  const valid = await verifySignature(payloadB64, sigB64, key);
  if (!valid) return null;

  try {
    const parsed = JSON.parse(new TextDecoder().decode(fromB64url(payloadB64))) as AdminSession & {
      exp?: number;
    };
    if (!parsed.email || !parsed.exp || parsed.exp < Date.now()) return null;
    return {
      email: parsed.email,
      role: parsed.role || 'admin',
      name: parsed.name || parsed.email,
    };
  } catch {
    return null;
  }
}

/** Token shape from createAdminSession — used when edge secret/env verification is unavailable. */
export function looksLikeAdminSessionToken(token: string): boolean {
  const dot = token.lastIndexOf('.');
  if (dot < 1) return false;
  const payloadB64 = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);
  return payloadB64.length > 16 && sigB64.length > 16;
}
