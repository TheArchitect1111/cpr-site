import { NextRequest, NextResponse } from 'next/server';
import { clerkClient, verifyToken } from '@clerk/nextjs/server';
import { findPortalAccountByEmail, recordPortalLogin } from '@/lib/portal-credentials';
import { makeSessionCookie, newExpiry, signSession } from '@/lib/portal-auth';

export const dynamic = 'force-dynamic';

/**
 * Exchanges a Clerk session (Google / magic-link) for the CPR portal session
 * cookie. Only emails that match an athlete or parent email on file are accepted.
 */
export async function POST(req: NextRequest) {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return NextResponse.json({ error: 'Google sign-in is not configured.' }, { status: 503 });
  }

  let token = '';
  try {
    const body = (await req.json()) as { token?: string };
    token = String(body.token || '');
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  if (!token) return NextResponse.json({ error: 'Missing session token.' }, { status: 400 });

  let userId = '';
  try {
    const claims = await verifyToken(token, { secretKey });
    userId = String(claims.sub || '');
  } catch {
    return NextResponse.json({ error: 'Sign-in could not be verified.' }, { status: 401 });
  }
  if (!userId) return NextResponse.json({ error: 'Sign-in could not be verified.' }, { status: 401 });

  let email = '';
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    email =
      user.primaryEmailAddress?.emailAddress?.toLowerCase() ||
      user.emailAddresses[0]?.emailAddress?.toLowerCase() ||
      '';
  } catch {
    return NextResponse.json({ error: 'Could not read your account email.' }, { status: 502 });
  }

  const account = await findPortalAccountByEmail(email);
  if (!account) {
    return NextResponse.json(
      {
        error: `${email || 'This account'} is not linked to a CPR portal. Use the email on your welcome message or sign in with your username and password.`,
      },
      { status: 403 },
    );
  }

  const sessionToken = await signSession({ type: account.role, slug: account.slug, exp: newExpiry() });
  if (!sessionToken) {
    return NextResponse.json({ error: 'Portal login is temporarily unavailable.' }, { status: 503 });
  }

  void recordPortalLogin(account);

  const res = NextResponse.json({ ok: true, type: account.role, slug: account.slug, email: account.email });
  res.cookies.set(makeSessionCookie(sessionToken));
  return res;
}
