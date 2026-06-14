// Password hashing utilities for the portal.
// Uses Node.js crypto (scrypt) — only call from API routes, never from middleware.

import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'node:crypto';

const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, KEYLEN).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const derived = scryptSync(password, salt, KEYLEN);
    return timingSafeEqual(derived, Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

// Generates a 10-character uppercase alphanumeric temporary password.
// Avoids ambiguous chars (0/O, 1/I/L).
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export function generateTempPassword(): string {
  const bytes = randomBytes(10);
  return Array.from(bytes)
    .map((b) => CHARS[b % CHARS.length])
    .join('');
}

export function adminNonce(adminPassword: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return createHmac('sha256', adminPassword).update(today).digest('hex');
}

export function verifyAdminNonce(nonce: string): boolean {
  const pw = process.env.ADMIN_PASSWORD || '';
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const ok = createHmac('sha256', pw).update(today).digest('hex');
  const okYest = createHmac('sha256', pw).update(yesterday).digest('hex');
  // timing-safe comparison
  try {
    return (
      timingSafeEqual(Buffer.from(nonce, 'utf8'), Buffer.from(ok, 'utf8')) ||
      timingSafeEqual(Buffer.from(nonce, 'utf8'), Buffer.from(okYest, 'utf8'))
    );
  } catch {
    return false;
  }
}
