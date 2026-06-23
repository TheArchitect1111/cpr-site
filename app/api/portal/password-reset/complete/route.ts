import { NextRequest, NextResponse } from 'next/server';
import { resetPortalPassword, type PortalRole } from '@/lib/portal-credentials';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const recordId = String(form.get('recordId') || '');
  const role = String(form.get('role') || '') as PortalRole;
  const token = String(form.get('token') || '');
  const password = String(form.get('password') || '');
  const confirm = String(form.get('confirm') || '');

  if (!recordId || !token || !password || password !== confirm || (role !== 'athlete' && role !== 'parent')) {
    const url = new URL('/portal/reset-password', req.nextUrl.origin);
    url.searchParams.set('recordId', recordId);
    url.searchParams.set('role', role);
    url.searchParams.set('token', token);
    url.searchParams.set('error', '1');
    return NextResponse.redirect(url, 303);
  }

  try {
    await resetPortalPassword(recordId, role, token, password);
    const url = new URL('/portal/login', req.nextUrl.origin);
    url.searchParams.set('reset', '1');
    return NextResponse.redirect(url, 303);
  } catch (err) {
    console.error('Portal password reset failed:', err);
    const url = new URL('/portal/reset-password', req.nextUrl.origin);
    url.searchParams.set('recordId', recordId);
    url.searchParams.set('role', role);
    url.searchParams.set('token', token);
    url.searchParams.set('error', '1');
    return NextResponse.redirect(url, 303);
  }
}
