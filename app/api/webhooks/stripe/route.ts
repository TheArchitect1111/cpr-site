import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { markAthletePaymentPaid } from '@/lib/athletes';
import { isPaymentStage, paymentStageLabel } from '@/lib/payments';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: 'Stripe webhook not configured' }, { status: 503 });

  const signature = req.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const recordId = String(session.metadata?.recordId || '');
    const stage = String(session.metadata?.stage || '');
    if (recordId && isPaymentStage(stage)) {
      const amount = typeof session.amount_total === 'number' ? ` ${(session.amount_total / 100).toFixed(2)} ${String(session.currency || '').toUpperCase()}` : '';
      await markAthletePaymentPaid(recordId, stage, `Stripe confirmed ${paymentStageLabel(stage)} payment${amount}. Session ${session.id}.`);
    }
  }

  return NextResponse.json({ received: true });
}
