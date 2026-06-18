import { NextRequest, NextResponse } from 'next/server';
import { athleteFieldsFromInput, deleteAthlete, updateAthlete } from '@/lib/athletes';
import { isAdminAuthed } from '@/lib/admin-auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  const fields = athleteFieldsFromInput(body, true);

  try {
    await updateAthlete(id, fields);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Admin athlete update failed:', err);
    return NextResponse.json({ error: 'Could not update player profile.' }, { status: 502 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    await deleteAthlete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Admin athlete delete failed:', err);
    return NextResponse.json({ error: 'Could not delete player profile.' }, { status: 502 });
  }
}
