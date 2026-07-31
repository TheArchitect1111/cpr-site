import { NextRequest, NextResponse } from 'next/server';
import { PORTAL_COOKIE, verifySession } from '@/lib/portal-auth';
import { listNylasCalendarEvents, nylasCalendarConfigured } from '@/lib/nylas-calendar';

export const dynamic = 'force-dynamic';

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(PORTAL_COOKIE)?.value ?? '';
  const session = token ? await verifySession(token) : null;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!nylasCalendarConfigured()) {
    return NextResponse.json({
      configured: false,
      events: [],
      message: 'Shared calendar connection is not configured yet.',
    });
  }

  const start = parseDate(req.nextUrl.searchParams.get('start'));
  const end = parseDate(req.nextUrl.searchParams.get('end'));
  if (!start || !end || end <= start) {
    return NextResponse.json({ error: 'Valid start and end dates are required.' }, { status: 400 });
  }

  const maximumWindowMs = 370 * 24 * 60 * 60 * 1000;
  if (end.getTime() - start.getTime() > maximumWindowMs) {
    return NextResponse.json({ error: 'Calendar range is too large.' }, { status: 400 });
  }

  try {
    const events = await listNylasCalendarEvents({ start, end });
    return NextResponse.json({ configured: true, events });
  } catch {
    return NextResponse.json(
      { error: 'The shared calendar is temporarily unavailable.' },
      { status: 502 },
    );
  }
}
