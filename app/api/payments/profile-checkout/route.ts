import { NextRequest, NextResponse } from 'next/server';
import { paypalCheckoutUrl } from '@/lib/paypal';

const PROFILE_PRICE_CENTS = 7500;

export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const url = paypalCheckoutUrl({
    amountCents: PROFILE_PRICE_CENTS,
    description: 'CPR Player Profile',
    returnUrl: `${origin}/profile/create?status=success`,
    cancelUrl: `${origin}/profile/create?status=cancelled`,
  });

  return NextResponse.json({ url });
}
