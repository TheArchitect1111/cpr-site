import { NextResponse } from 'next/server';

function cleanEnv(value?: string) {
  return String(value || '').trim().replace(/^['"]|['"]$/g, '');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function findUsername(email: string) {
  const secretKey = cleanEnv(process.env.CLERK_SECRET_KEY);
  if (!secretKey) return '';

  const response = await fetch(`https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
    cache: 'no-store',
  });

  if (!response.ok) return '';
  const users = await response.json().catch(() => []);
  const user = Array.isArray(users) ? users[0] : null;
  return user?.username || user?.email_addresses?.[0]?.email_address || '';
}

async function sendUsernameEmail({ email, username, clientName }: { email: string; username: string; clientName: string }) {
  const apiKey = cleanEnv(process.env.RESEND_API_KEY);
  if (!apiKey || !username) return { skipped: true };

  const from = cleanEnv(process.env.RESEND_FROM_EMAIL) || 'Portal Support <onboarding@resend.dev>';
  const safeClient = escapeHtml(clientName || 'your portal');
  const safeUsername = escapeHtml(username);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: `${safeClient} username reminder`,
      html: `
        <div style="font-family:Arial,sans-serif;background:#f6f8fb;padding:24px;">
          <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:18px;padding:24px;color:#111827;">
            <h1 style="margin:0 0 12px;font-size:22px;">Username reminder</h1>
            <p>Your username for ${safeClient} is:</p>
            <p style="font-size:20px;font-weight:700;">${safeUsername}</p>
            <p>If you use Google or Apple sign-in, use that button on the login page.</p>
          </div>
        </div>
      `,
    }),
  });

  return { skipped: false, ok: response.ok };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || '').trim();
  const clientName = String(body.clientName || 'your portal').trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  const username = await findUsername(email);
  await sendUsernameEmail({ email, username, clientName });

  return NextResponse.json({ ok: true });
}
