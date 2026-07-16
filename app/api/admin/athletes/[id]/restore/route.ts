import { NextRequest, NextResponse } from 'next/server';
import { getAthleteByRecordId, restoreAthlete } from '@/lib/athletes';
import { isAdminAuthed } from '@/lib/admin-auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  try {
    const slug = await restoreAthlete(id);
    const athlete = await getAthleteByRecordId(id);
    return NextResponse.json({ ok: true, slug, athlete });
  } catch (err) {
    console.error('Admin athlete restore failed:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not restore player profile.' },
      { status: 502 },
    );
  }
}
