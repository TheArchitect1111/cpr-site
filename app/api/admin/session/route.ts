import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdminAsync, createAdminSession, setAdminCookie } from '@/lib/admin-auth';
import {
  checkLoginAllowed,
  clearLoginGuard,
  recordLoginFailure,
} from '@/lib/login-rate-limit';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get('email') || '').trim().toLowerCase();
  const password = String(form.get('password') || '');
  const next = String(form.get('next') || '/admin');
  const loginPath = next.startsWith('/admin') ? next : '/admin';

  const guardCheck = checkLoginAllowed(req, 'admin', email || 'unknown');
  if (!guardCheck.allowed) {
    const url = new URL('/admin/login', req.nextUrl.origin);
    url.searchParams.set('locked', '1');
    url.searchParams.set('retry', String(guardCheck.retryAfterSec));
    url.searchParams.set('next', loginPath);
    return NextResponse.redirect(url, 303);
  }

  const user = await authenticateAdminAsync(email, password);

  if (!user) {
    const url = new URL('/admin/login', req.nextUrl.origin);
    url.searchParams.set('error', '1');
    url.searchParams.set('next', loginPath);
    const draft = NextResponse.redirect(url, 303);
    const failure = recordLoginFailure(req, draft, 'admin', email);
    if (failure.locked) {
      url.searchParams.set('locked', '1');
      url.searchParams.set('retry', String(failure.retryAfterSec));
    }
    const res = NextResponse.redirect(url, 303);
    draft.cookies.getAll().forEach((cookie) => res.cookies.set(cookie));
    return res;
  }

  const token = createAdminSession(user);
  const res = NextResponse.redirect(new URL(loginPath, req.nextUrl.origin), 303);
  setAdminCookie(res, token);
  clearLoginGuard(res, 'admin');
  return res;
}
