import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import {
  createNylasCalendarEvent,
  deleteNylasCalendarEvent,
  listNylasCalendarEvents,
  nylasCalendarConfigured,
  updateNylasCalendarEvent,
  type SharedCalendarEventInput,
} from '@/lib/nylas-calendar';

export const dynamic = 'force-dynamic';

function authorized(req: NextRequest) {
  return verifyAdminSession(req.cookies.get('cpr_admin_session')?.value ?? '');
}

function parseDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function readInput(req: NextRequest) {
  const body = (await req.json()) as Partial<SharedCalendarEventInput> & { id?: string };
  return {
    id: body.id?.trim() || '',
    event: {
      title: String(body.title || ''),
      start: String(body.start || ''),
      end: String(body.end || ''),
      allDay: Boolean(body.allDay),
      location: String(body.location || ''),
      description: String(body.description || ''),
    } satisfies SharedCalendarEventInput,
  };
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!nylasCalendarConfigured()) {
    return NextResponse.json({ configured: false, events: [], message: 'Connect Nylas to manage the shared calendar.' });
  }
  const start = parseDate(req.nextUrl.searchParams.get('start'));
  const end = parseDate(req.nextUrl.searchParams.get('end'));
  if (!start || !end || end <= start || end.getTime() - start.getTime() > 370 * 86_400_000) {
    return NextResponse.json({ error: 'Valid calendar dates are required.' }, { status: 400 });
  }
  try {
    return NextResponse.json({ configured: true, events: await listNylasCalendarEvents({ start, end }) });
  } catch {
    return NextResponse.json({ error: 'The shared calendar is temporarily unavailable.' }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { event } = await readInput(req);
    return NextResponse.json({ event: await createNylasCalendarEvent(event) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Event could not be created.' }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id, event } = await readInput(req);
    if (!id) return NextResponse.json({ error: 'Event ID is required.' }, { status: 400 });
    return NextResponse.json({ event: await updateNylasCalendarEvent(id, event) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Event could not be updated.' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = req.nextUrl.searchParams.get('id')?.trim();
  if (!id) return NextResponse.json({ error: 'Event ID is required.' }, { status: 400 });
  try {
    await deleteNylasCalendarEvent(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Event could not be deleted.' }, { status: 400 });
  }
}
