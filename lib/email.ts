import { site } from '@/config/site';
import { fallbackResendFromCandidates, resolveResendFromEmail } from '@/lib/resend-readiness';

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  idempotencyKey?: string;
};

export async function sendEmail(input: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Missing RESEND_API_KEY');

  const senders = [resolveResendFromEmail(), ...fallbackResendFromCandidates(resolveResendFromEmail())];
  let lastError = 'Email send failed';

  for (let index = 0; index < senders.length; index += 1) {
    const from = senders[index];
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(input.idempotencyKey
          ? { 'Idempotency-Key': index === 0 ? input.idempotencyKey : `${input.idempotencyKey}-fallback-${index}` }
          : {}),
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        reply_to: site.footer.email,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) return data as { id?: string };

    lastError = typeof data?.message === 'string' ? data.message : lastError;
    const retryable =
      lastError.toLowerCase().includes('domain is not verified') ||
      lastError.toLowerCase().includes('only send testing emails');
    if (!retryable || index === senders.length - 1) {
      throw new Error(lastError);
    }
  }

  throw new Error(lastError);
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
