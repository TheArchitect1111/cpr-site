import { NextRequest, NextResponse } from 'next/server';
import { resetAdminPassword } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get('email') || '').trim().toLowerCase();
  const token = String(form.get('token') || '');
  const password = String(form.get('password') || '');
  const confirm = String(form.get('confirm') || '');

  if (!email || !token || !password || password !== confirm) {
    const url = new URL('/admin/reset-password', req.nextUrl.origin);
    url.searchParams.set('email', email);
    url.searchParams.set('token', token);
    url.searchParams.set('error', '1');
    return NextResponse.redirect(url, 303);
  }

  try {
    await resetAdminPassword(email, token, password);
    const url = new URL('/admin/login', req.nextUrl.origin);
    url.searchParams.set('reset', '1');
    return NextResponse.redirect(url, 303);
  } catch (err) {
    console.error('Admin password reset failed:', err);
    const url = new URL('/admin/reset-password', req.nextUrl.origin);
    url.searchParams.set('email', email);
    url.searchParams.set('token', token);
    url.searchParams.set('error', '1');
    return NextResponse.redirect(url, 303);
  }
}
