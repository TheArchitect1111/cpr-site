import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createTicket } from '@/lib/sections-data';
import { PORTAL_COOKIE, verifySession } from '@/lib/portal-auth';
import { websiteRequestSubject } from '@/lib/website-update-requests';
import { isOpenStaging } from '@/lib/staging';

export const dynamic = 'force-dynamic';

const VALID_TYPES = new Set([
  'Profile copy',
  'Highlight video',
  'Photo update',
  'Camp or event',
  'Stats or achievement',
  'Other',
]);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as {
    portalType?: 'athlete' | 'parent';
    slug?: string;
    type?: string;
    message?: string;
  } | null;

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(PORTAL_COOKIE)?.value;
  const session = isOpenStaging()
    ? { slug: body.slug || 'jayden-thompson', type: body.portalType || 'athlete' }
    : token ? await verifySession(token) : null;

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (body.slug && body.slug !== session.slug) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const type = VALID_TYPES.has(body.type || '') ? body.type || 'Other' : 'Other';
  const message = String(body.message || '').trim();

  if (message.length < 5) {
    return NextResponse.json({ error: 'Please describe the requested update.' }, { status: 400 });
  }
  if (message.length > 1600) {
    return NextResponse.json({ error: 'Request is too long.' }, { status: 400 });
  }

  const ticket = await createTicket({
    athleteSlug: session.slug,
    subject: websiteRequestSubject(type),
    message,
  });

  if (!ticket) {
    return NextResponse.json({ error: 'Could not submit request.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, request: ticket }, { status: 201 });
}

