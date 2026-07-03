import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PORTAL_COOKIE, verifySession } from '@/lib/portal-auth';
import { createTicket, getTicketsBySlug } from '@/lib/sections-data';
import { notifyAdminNewTicket } from '@/lib/portal-admin-notifications';
import { isOpenStaging } from '@/lib/staging';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(PORTAL_COOKIE)?.value;
  const session = isOpenStaging()
    ? { slug: 'jayden-thompson', type: 'athlete' as const }
    : token ? await verifySession(token) : null;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { tickets } = await getTicketsBySlug(session.slug);
  return NextResponse.json({ tickets });
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(PORTAL_COOKIE)?.value;
  const session = isOpenStaging()
    ? { slug: 'jayden-thompson', type: 'athlete' as const }
    : token ? await verifySession(token) : null;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { subject?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const subject = (body.subject ?? '').trim();
  const message = (body.message ?? '').trim();

  if (!subject) return NextResponse.json({ error: 'Subject is required.' }, { status: 400 });
  if (!message) return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
  if (subject.length > 200)
    return NextResponse.json({ error: 'Subject too long (max 200 characters).' }, { status: 400 });
  if (message.length > 5000)
    return NextResponse.json({ error: 'Message too long (max 5000 characters).' }, { status: 400 });

  const ticket = await createTicket({ athleteSlug: session.slug, subject, message });
  if (!ticket) {
    return NextResponse.json(
      { error: 'Failed to submit ticket. Please try again.' },
      { status: 500 }
    );
  }

  if (!isOpenStaging()) {
    void notifyAdminNewTicket({
      athleteSlug: session.slug,
      subject,
      message,
      ticketId: ticket.id,
    });
  }

  return NextResponse.json({ ticket }, { status: 201 });
}
