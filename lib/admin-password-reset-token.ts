import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { getAdminSessionSecret } from '@/lib/admin-session-secret';

type ResetPayload = {
  email: string;
  exp: number;
  nonce: string;
};

const TTL_MS = 30 * 60 * 1000;

function signingSecret(): string {
  return getAdminSessionSecret() || '';
}

function sign(encoded: string, secret: string): string {
  return createHmac('sha256', secret).update(encoded).digest('base64url');
}

/** Stateless admin password-reset token (no Airtable storage required). */
export function createAdminPasswordResetToken(email: string): string | null {
  const secret = signingSecret();
  if (!secret) return null;

  const payload: ResetPayload = {
    email: email.trim().toLowerCase(),
    exp: Date.now() + TTL_MS,
    nonce: randomBytes(16).toString('base64url'),
  };

  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${encoded}.${sign(encoded, secret)}`;
}

export function verifyAdminPasswordResetToken(token: string): { email: string } | null {
  const secret = signingSecret();
  if (!secret || !token) return null;

  const dot = token.lastIndexOf('.');
  if (dot < 0) return null;

  const encoded = token.slice(0, dot);
  const provided = token.slice(dot + 1);
  const expected = sign(encoded, secret);

  try {
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as ResetPayload;
    if (!payload.email || !payload.exp || payload.exp < Date.now()) return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}
