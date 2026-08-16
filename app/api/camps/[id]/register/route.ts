import { NextRequest, NextResponse } from 'next/server';
import { registerForCamp, type CampRegistrationInput } from '@/lib/camp-registration';

export const dynamic = 'force-dynamic';

const attempts = new Map<string, number[]>();

function rateLimited(request: NextRequest) {
  const key = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter((time) => now - time < 60_000);
  recent.push(now);
  attempts.set(key, recent);
  return recent.length > 6;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (rateLimited(request)) return NextResponse.json({ error: 'Too many attempts. Please wait one minute.' }, { status: 429 });
  const { id } = await params;
  let body: CampRegistrationInput & { website?: string };
  try { body = await request.json() as CampRegistrationInput & { website?: string }; }
  catch { return NextResponse.json({ error: 'Invalid registration form.' }, { status: 400 }); }
  if (body.website) return NextResponse.json({ ok: true });

  try {
    const result = await registerForCamp(id, body);
    return NextResponse.json({
      ok: true,
      registrationId: result.registration.id,
      paymentUrl: result.paymentUrl,
      confirmationSent: result.confirmationSent,
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration could not be completed.';
    const status = message.includes('full') ? 409 : message.includes('already registered') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
