import { NextRequest, NextResponse } from 'next/server';
import { createAdminSession, findAdminAccount, setAdminCookie } from '@/lib/admin-auth';
import { findPortalAccountByEmail, recordPortalLogin } from '@/lib/portal-credentials';
import { makeSessionCookie, newExpiry, signSession } from '@/lib/portal-auth';
import { verifyMagicLinkToken } from '@/lib/magic-link';

export const dynamic = 'force-dynamic';

function loginUrl(origin: string, realm: 'admin' | 'portal', error: string, next?: string): URL {
  const path = realm === 'admin' ? '/admin/login' : '/portal/login';
  const url = new URL(path, origin);
  url.searchParams.set('error', error);
  if (next) url.searchParams.set('next', next);
  return url;
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || '';
  const payload = verifyMagicLinkToken(token);
  const origin = req.nextUrl.origin;

  if (!payload) {
    return NextResponse.redirect(loginUrl(origin, 'portal', 'expired'), 303);
  }

  if (payload.realm === 'admin') {
    const account = await findAdminAccount(payload.email);
    if (!account) {
      return NextResponse.redirect(loginUrl(origin, 'admin', 'unauthorized', payload.next), 303);
    }

    const sessionToken = createAdminSession({
      email: account.email,
      role: account.role,
      name: account.name,
      password: '',
    });
    if (!sessionToken) {
      return NextResponse.redirect(loginUrl(origin, 'admin', 'config', payload.next), 303);
    }

    const next = payload.next?.startsWith('/admin') ? payload.next : '/admin';
    const res = NextResponse.redirect(new URL(next, origin), 303);
    setAdminCookie(res, sessionToken);
    return res;
  }

  const account = await findPortalAccountByEmail(payload.email);
  if (!account) {
    return NextResponse.redirect(loginUrl(origin, 'portal', 'unauthorized'), 303);
  }

  const sessionToken = await signSession({
    type: account.role,
    slug: account.slug,
    exp: newExpiry(),
  });
  if (!sessionToken) {
    return NextResponse.redirect(loginUrl(origin, 'portal', 'config'), 303);
  }

  void recordPortalLogin(account);

  const destination = `/portal/${account.role}/${account.slug}`;
  const res = NextResponse.redirect(new URL(destination, origin), 303);
  res.cookies.set(makeSessionCookie(sessionToken));
  return res;
}
