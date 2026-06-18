import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clearAdminCookie } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/admin/login', req.nextUrl.origin), 303);
  clearAdminCookie(res);
  return res;
}
