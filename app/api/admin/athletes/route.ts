import { NextRequest, NextResponse } from 'next/server';
import { createAthlete, getAthletes } from '@/lib/athletes';
import { isAdminAuthed } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { rows, live } = await getAthletes();
    const athletes = rows.map((a) => ({
      id: a.id,
      firstName: a.firstName,
      lastName: a.lastName,
      slug: a.slug,
      status: a.status,
      gradYear: a.gradYear,
      position: a.position,
    }));
    return NextResponse.json({ athletes, live });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not load profiles.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  try {
    const athlete = await createAthlete(body);
    return NextResponse.json({ athlete });
  } catch (err) {
    console.error('Admin athlete create failed:', err);
    const message = err instanceof Error ? err.message : 'Could not create player profile.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
