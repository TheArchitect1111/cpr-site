import { NextRequest, NextResponse } from 'next/server';
import { getAthleteByRecordId, verifyAthleteEditToken } from '@/lib/athletes';
import { isPaymentStage, paymentAmountCents, paymentDescription } from '@/lib/payments';
import { paypalCheckoutUrl } from '@/lib/paypal';

export async function POST(req: NextRequest) {
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
  const url = paypalCheckoutUrl({
    amountCents: amount,
    description: paymentDescription(stage, athlete),
    returnUrl: `${origin}/pay?status=success&id=${encodeURIComponent(recordId)}&stage=${stage}&token=${encodeURIComponent(token)}`,
    cancelUrl: `${origin}/pay?status=cancelled&id=${encodeURIComponent(recordId)}&stage=${stage}&token=${encodeURIComponent(token)}`,
  });

  return NextResponse.json({ url });
}
