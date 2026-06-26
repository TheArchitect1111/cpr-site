import { site } from '@/config/site';

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  idempotencyKey?: string;
};

const fromEmail = () => process.env.RESEND_FROM_EMAIL || `CPR Global Prospects <${site.footer.email}>`;

export async function sendEmail(input: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Missing RESEND_API_KEY');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(input.idempotencyKey ? { 'Idempotency-Key': input.idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from: fromEmail(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      reply_to: site.footer.email,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = typeof data?.message === 'string' ? data.message : 'Email send failed';
    throw new Error(message);
  }
  return data as { id?: string };
}

export function emailPage(title: string, body: string) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#151515;max-width:620px;margin:0 auto;padding:24px">
      <h1 style="font-size:22px;margin:0 0 16px;color:#0C0C0A">${title}</h1>
      ${body}
      <p style="margin-top:24px;color:#555;font-size:13px">CPR Global Prospects<br><a href="mailto:${site.footer.email}">${site.footer.email}</a></p>
    </div>
  `;
}
