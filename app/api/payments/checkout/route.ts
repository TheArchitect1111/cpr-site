import { NextRequest, NextResponse } from 'next/server';
import { getAthleteByRecordId, verifyAthleteEditToken } from '@/lib/athletes';
import { isPaymentStage, paymentAmountCents, paymentDescription, paymentStageLabel } from '@/lib/payments';
import { stripe } from '@/lib/stripe';

function stripeCurrency(): string | null {
  const currency = (process.env.STRIPE_CURRENCY || 'cad').trim().toLowerCase();
  return /^[a-z]{3}$/.test(currency) ? currency : null;
}

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
  const currency = stripeCurrency();
  if (!currency) return NextResponse.json({ error: 'Stripe currency is not configured correctly.' }, { status: 503 });
  if (!Number.isInteger(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Payment amount is not configured correctly.' }, { status: 503 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: athlete.email || athlete.parentEmail || undefined,
      line_items: [{
        quantity: 1,
        price_data: {
          currency,
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

    if (!session.url) {
      return NextResponse.json({ error: 'Checkout could not be started. Please contact CPR.' }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout creation failed:', err);
    return NextResponse.json({ error: 'Checkout is temporarily unavailable. Please contact CPR.' }, { status: 502 });
  }
}
