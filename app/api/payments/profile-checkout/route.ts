import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { CPR_AMPLIFI_COOKIE, readCPRAttribution } from '@/lib/amplifi/campaign-analytics';

const PROFILE_PRICE_CENTS = 7500;

export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 503 });

  const origin = req.nextUrl.origin;
  const attribution = readCPRAttribution(req.cookies.get(CPR_AMPLIFI_COOKIE)?.value);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_creation: 'always',
    billing_address_collection: 'auto',
    line_items: [{
      quantity: 1,
      price_data: {
        currency: process.env.STRIPE_CURRENCY || 'cad',
        unit_amount: PROFILE_PRICE_CENTS,
        product_data: {
          name: 'CPR Player Profile',
          description: 'One-time player profile creation fee',
        },
      },
    }],
    metadata: {
      purchaseType: 'player-profile',
      ...(attribution ? {
        amplifiCampaignId: attribution.campaignId,
        amplifiDraftId: attribution.draftId,
        amplifiPlatform: attribution.platform,
      } : {}),
    },
    success_url: `${origin}/profile/create?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/profile/create?status=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
