import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdminAsync, createAdminSession, setAdminCookie } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get('email') || '');
  const password = String(form.get('password') || '');
  const next = String(form.get('next') || '/admin');
  const user = await authenticateAdminAsync(email, password);

  if (!user) {
    const url = new URL('/admin/login', req.nextUrl.origin);
    url.searchParams.set('error', '1');
    url.searchParams.set('next', next.startsWith('/admin') ? next : '/admin');
    return NextResponse.redirect(url, 303);
  }

  const token = createAdminSession(user);
  const res = NextResponse.redirect(new URL(next.startsWith('/admin') ? next : '/admin', req.nextUrl.origin), 303);
  setAdminCookie(res, token);
  return res;
}
