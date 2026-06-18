import { NextRequest, NextResponse } from 'next/server';
import { appendOutreachActivityByEmailId } from '@/lib/outreach';

const tracked = new Set(['email.delivered', 'email.bounced', 'email.complained', 'email.suppressed', 'email.failed']);

function emailIdFrom(event: Record<string, unknown>) {
  const data = event.data as Record<string, unknown> | undefined;
  return String(data?.email_id || data?.id || event.email_id || event.id || '').trim();
}

function recipientFrom(event: Record<string, unknown>) {
  const data = event.data as Record<string, unknown> | undefined;
  const to = data?.to;
  if (Array.isArray(to)) return to.join(', ');
  return String(to || data?.email || '').trim();
}

export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 503 });
  const supplied = req.nextUrl.searchParams.get('secret') || req.headers.get('x-cpr-webhook-secret') || '';
  if (supplied !== secret) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const event = await req.json().catch(() => null) as Record<string, unknown> | null;
  const type = String(event?.type || '').trim();
  if (!event || !tracked.has(type)) return NextResponse.json({ received: true });

  const emailId = emailIdFrom(event);
  if (!emailId) return NextResponse.json({ received: true, matched: false });

  const label = type.replace('email.', '');
  const recipient = recipientFrom(event);
  const matched = await appendOutreachActivityByEmailId(
    emailId,
    `Email ${label}${recipient ? ` for ${recipient}` : ''}. Resend email ID: ${emailId}.`,
  );

  return NextResponse.json({ received: true, matched: Boolean(matched) });
}
