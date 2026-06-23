import { NextRequest, NextResponse } from 'next/server';
import { emailPage, sendEmail } from '@/lib/email';
import { findPortalAccount, requestPortalPasswordReset } from '@/lib/portal-credentials';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const identifier = String(form.get('identifier') || '').trim();
  const done = new URL('/portal/forgot-password', req.nextUrl.origin);
  done.searchParams.set('sent', '1');
  if (!identifier) return NextResponse.redirect(done, 303);

  try {
    const resetUrl = await requestPortalPasswordReset(identifier, req.nextUrl.origin);
    if (resetUrl) {
      const account = await findPortalAccount(identifier);
      if (account?.email) {
        await sendEmail({
          to: account.email,
          subject: 'Reset your CPR portal password',
          html: emailPage('Reset your CPR portal password', `
            <p>Use this secure link to set a new portal password. The link expires in 30 minutes and can only be used once.</p>
            <p><a href="${resetUrl}" style="display:inline-block;background:#B21712;color:#fff;padding:10px 14px;border-radius:5px;text-decoration:none;font-weight:bold">Reset Password</a></p>
            <p>If you did not request this, you can ignore this email.</p>
          `),
          text: `Reset your CPR portal password: ${resetUrl}`,
          idempotencyKey: `portal-reset-${account.email}-${Date.now()}`,
        });
      }
    }
    return NextResponse.redirect(done, 303);
  } catch (err) {
    console.error('Portal password reset request failed:', err);
    const url = new URL('/portal/forgot-password', req.nextUrl.origin);
    url.searchParams.set('error', '1');
    return NextResponse.redirect(url, 303);
  }
}
