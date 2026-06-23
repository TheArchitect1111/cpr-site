import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NextRequest, NextResponse } from 'next/server';

const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

export type LoginRealm = 'portal' | 'admin';

type GuardPayload = {
  k: string;
  c: number;
  until: number;
};

function secretFor(realm: LoginRealm): string {
  if (realm === 'admin') {
    return process.env.ADMIN_AUTH_SECRET || process.env.ADMIN_PASSWORD || 'cpr-admin-login-guard';
  }
  return process.env.PORTAL_SECRET || 'cpr-portal-login-guard';
}

function cookieName(realm: LoginRealm): string {
  return realm === 'admin' ? 'cpr_admin_login_guard' : 'cpr_portal_login_guard';
}

function keyFor(identifier: string): string {
  return createHmac('sha256', 'cpr-login-key').update(identifier.trim().toLowerCase()).digest('hex');
}

function sign(payload: string, realm: LoginRealm): string {
  return createHmac('sha256', secretFor(realm)).update(payload).digest('base64url');
}

function encode(payload: GuardPayload, realm: LoginRealm): string {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${body}.${sign(body, realm)}`;
}

function decode(raw: string | undefined, realm: LoginRealm): GuardPayload | null {
  if (!raw) return null;
  const [body, sig] = raw.split('.');
  if (!body || !sig) return null;
  const expected = sign(body, realm);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as GuardPayload;
  } catch {
    return null;
  }
}

function readGuard(req: NextRequest, realm: LoginRealm, identifier: string): GuardPayload {
  const current = decode(req.cookies.get(cookieName(realm))?.value, realm);
  const k = keyFor(identifier);
  if (!current || current.k !== k) return { k, c: 0, until: 0 };
  return current;
}

function writeGuard(res: NextResponse, realm: LoginRealm, payload: GuardPayload) {
  res.cookies.set(cookieName(realm), encode(payload, realm), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.ceil(LOCK_MS / 1000),
  });
}

export function clearLoginGuard(res: NextResponse, realm: LoginRealm) {
  res.cookies.set(cookieName(realm), '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export function checkLoginAllowed(req: NextRequest, realm: LoginRealm, identifier: string) {
  const guard = readGuard(req, realm, identifier);
  if (guard.until > Date.now()) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((guard.until - Date.now()) / 1000),
      message: `Too many failed attempts. Try again in ${Math.ceil((guard.until - Date.now()) / 60000)} minutes.`,
    };
  }
  return { allowed: true as const };
}

export function recordLoginFailure(
  req: NextRequest,
  res: NextResponse,
  realm: LoginRealm,
  identifier: string,
) {
  const guard = readGuard(req, realm, identifier);
  const nextCount = guard.c + 1;
  const until = nextCount >= MAX_ATTEMPTS ? Date.now() + LOCK_MS : 0;
  writeGuard(res, realm, { k: keyFor(identifier), c: nextCount, until });
  if (until > Date.now()) {
    return {
      locked: true,
      retryAfterSec: Math.ceil(LOCK_MS / 1000),
      message: 'Too many failed attempts. Your login is temporarily locked for 15 minutes.',
    };
  }
  const remaining = MAX_ATTEMPTS - nextCount;
  return {
    locked: false,
    remaining,
    message: `Invalid credentials. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before a 15-minute lockout.`,
  };
}
