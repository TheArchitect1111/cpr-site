import { NextRequest, NextResponse } from 'next/server';
import { findAdminAccount } from '@/lib/admin-auth';
import { findPortalAccountByEmail } from '@/lib/portal-credentials';
import { emailPage, sendEmail } from '@/lib/email';
import { checkLoginAllowed, recordLoginFailure } from '@/lib/login-rate-limit';
import { createMagicLinkToken, magicLinkConfigured, type MagicLinkRealm } from '@/lib/magic-link';
import { getSiteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

function safeNextPath(raw: string | undefined, realm: MagicLinkRealm): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) {
    return realm === 'admin' ? '/admin' : '/portal/login';
  }
  if (realm === 'admin' && !raw.startsWith('/admin')) return '/admin';
  return raw;
}

export async function POST(req: NextRequest) {
  if (!magicLinkConfigured()) {
    return NextResponse.json(
      { error: 'Login is not configured. Set ADMIN_AUTH_SECRET on Vercel Production.' },
      { status: 503 },
    );
  }

  let body: { email?: string; realm?: string; next?: string };
  try {
    body = (await req.json()) as { email?: string; realm?: string; next?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const email = String(body.email || '').trim().toLowerCase();
  const realm = body.realm === 'admin' ? 'admin' : 'portal';
  const next = safeNextPath(body.next, realm);

  if (!email) {
    return NextResponse.json({ error: 'Enter your email address.' }, { status: 400 });
  }

  const guardRealm = realm === 'admin' ? 'admin' : 'portal';
  const guardCheck = checkLoginAllowed(req, guardRealm, email);
  if (!guardCheck.allowed) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in about ${Math.ceil((guardCheck.retryAfterSec ?? 900) / 60)} minutes.` },
      { status: 429 },
    );
  }

  let authorized = false;
  let label = 'CPR';

  if (realm === 'admin') {
    const account = await findAdminAccount(email);
    authorized = Boolean(account);
    label = 'CPR Admin';
  } else {
    const account = await findPortalAccountByEmail(email);
    authorized = Boolean(account);
    label = 'CPR Portal';
  }

  if (!authorized) {
    const res = NextResponse.json({
      ok: true,
      message: 'If that email is registered, a login link is on its way.',
    });
    recordLoginFailure(req, res, guardRealm, email);
    return res;
  }

  const token = createMagicLinkToken({ realm, email, next });
  if (!token) {
    return NextResponse.json({ error: 'Login is temporarily unavailable.' }, { status: 503 });
  }

  const link = `${getSiteUrl()}/api/auth/magic-link/verify?token=${encodeURIComponent(token)}`;
  const subject = realm === 'admin' ? 'Your CPR admin login link' : 'Your CPR portal login link';

  try {
    await sendEmail({
      to: email,
      subject,
      html: emailPage(
        `Sign in to ${label}`,
        `
          <p>Tap the button below to sign in. This link expires in 15 minutes and works once.</p>
          <p style="margin:24px 0">
            <a href="${link}" style="display:inline-block;background:#C8102E;color:#fff;padding:14px 24px;border-radius:6px;font-weight:700;text-decoration:none">
              Sign in to ${label}
            </a>
          </p>
          <p style="font-size:13px;color:#666">If you did not request this, you can ignore this email.</p>
        `,
      ),
      text: `Sign in to ${label}: ${link}\n\nThis link expires in 15 minutes.`,
      idempotencyKey: `magic-${realm}-${email}-${Math.floor(Date.now() / 60000)}`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not send login email.' },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: 'Check your email — your login link is on the way.',
  });
}
