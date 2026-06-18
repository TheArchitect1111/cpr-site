import { NextRequest, NextResponse } from 'next/server';
import { getAthleteByRecordId, verifyAthleteEditToken } from '@/lib/athletes';
import { isPaymentStage, paymentAmountCents, paymentDescription, paymentStageLabel } from '@/lib/payments';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 503 });
  const body = await req.json().catch(() => null);
  const recordId = String(body?.recordId || '');
  const token = String(body?.token || '');
  const stage = String(body?.stage || '');
  if (!recordId || !verifyAthleteEditToken(recordId, token)) {
    return NextResponse.json({ error: 'Unauthorized payment link.' }, { status: 401 });
  }
  if (!isPaymentStage(stage)) return NextResponse.json({ error: 'Invalid payment stage.' }, { status: 400 });

  const athlete = await getAthleteByRecordId(recordId);
  if (!athlete) return NextResponse.json({ error: 'Applicant not found.' }, { status: 404 });

  const origin = req.nextUrl.origin;
  const amount = paymentAmountCents(stage, athlete);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: athlete.email || athlete.parentEmail || undefined,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: process.env.STRIPE_CURRENCY || 'cad',
        unit_amount: amount,
        product_data: {
          name: `CPR ${paymentStageLabel(stage)} Payment`,
          description: paymentDescription(stage, athlete),
        },
      },
    }],
    metadata: {
      recordId,
      stage,
      athleteName: [athlete.firstName, athlete.lastName].filter(Boolean).join(' '),
    },
    success_url: `${origin}/pay?status=success&id=${encodeURIComponent(recordId)}&stage=${stage}&token=${encodeURIComponent(token)}`,
    cancel_url: `${origin}/pay?status=cancelled&id=${encodeURIComponent(recordId)}&stage=${stage}&token=${encodeURIComponent(token)}`,
  });

  return NextResponse.json({ url: session.url });
}
