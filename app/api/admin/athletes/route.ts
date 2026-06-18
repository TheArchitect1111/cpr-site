import { NextRequest, NextResponse } from 'next/server';
import { createAthlete } from '@/lib/athletes';
import { isAdminAuthed } from '@/lib/admin-auth';

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
