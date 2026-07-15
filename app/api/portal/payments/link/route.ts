import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PORTAL_COOKIE, verifySession } from '@/lib/portal-auth';
import { resolvePortalPaymentLink } from '@/lib/portal-payments';

export const dynamic = 'force-dynamic';

async function requirePortalSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(PORTAL_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

/**
 * Mint a tokenized `/pay?...` URL for the signed-in athlete (or parent of that athlete).
 * Token is never embedded in client bundles — call this API from the Pay CTA.
 * Checkout still requires Stripe env; missing Stripe → 503 from /api/payments/checkout.
 */
async function handle(req: NextRequest) {
  const session = await requirePortalSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const stage =
    req.method === 'POST'
      ? String((await req.json().catch(() => null))?.stage || '')
      : String(req.nextUrl.searchParams.get('stage') || '');

  const result = await resolvePortalPaymentLink(session.slug, stage || null);
  if (!result.ok) {
    if (result.reason === 'token_unavailable') {
      return NextResponse.json(
        { error: 'Payment links are not configured. Contact CPR support.' },
        { status: 503 },
      );
    }
    if (result.reason === 'not_found') {
      return NextResponse.json({ error: 'Athlete not found.' }, { status: 404 });
    }
    if (result.reason === 'none_due') {
      return NextResponse.json({ error: 'No payments due.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Invalid or already paid stage.' }, { status: 404 });
  }

  return NextResponse.json({ url: result.url, stage: result.stage });
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
