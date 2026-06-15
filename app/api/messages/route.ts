import { NextRequest, NextResponse } from 'next/server';
// NextRequest is used by POST only
import { cookies } from 'next/headers';
import { PORTAL_COOKIE, verifySession } from '@/lib/portal-auth';
import { createMessage, markMessagesRead, getMessagesBySlug } from '@/lib/sections-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(PORTAL_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const session = await verifySession(token);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { messages } = await getMessagesBySlug(session.slug);
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(PORTAL_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const session = await verifySession(token);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { messageBody?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const messageBody = (body.messageBody ?? '').trim();
  if (!messageBody)
    return NextResponse.json({ error: 'Message body is required.' }, { status: 400 });
  if (messageBody.length > 5000)
    return NextResponse.json({ error: 'Message too long (max 5000 characters).' }, { status: 400 });

  const sender = session.type === 'parent' ? 'Parent' : 'Athlete';
  const message = await createMessage({ athleteSlug: session.slug, sender, messageBody });
  if (!message) {
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ message }, { status: 201 });
}

export async function PATCH() {
  const cookieStore = await cookies();
  const token = cookieStore.get(PORTAL_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const session = await verifySession(token);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await markMessagesRead(session.slug);
  return NextResponse.json({ ok: true });
}
