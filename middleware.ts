import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protects /admin with HTTP Basic Auth.
// Set ADMIN_PASSWORD (and optional ADMIN_USER, default "cpr") in Vercel env vars.
// If ADMIN_PASSWORD is not set, /admin is locked.

export function middleware(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  const user = process.env.ADMIN_USER || 'cpr';

  if (!password) {
    return new NextResponse('Admin portal not configured. Set ADMIN_PASSWORD in Vercel environment variables.', { status: 503 });
  }

  const header = req.headers.get('authorization') || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme === 'Basic' && encoded) {
    const [u, p] = Buffer.from(encoded, 'base64').toString().split(':');
    if (u === user && p === password) return NextResponse.next();
  }
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="CPR Admin"' },
  });
}

export const config = { matcher: ['/admin/:path*', '/admin'] };
