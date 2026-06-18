import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/admin-auth';
import { deleteCoach, updateCoach } from '@/lib/coaches';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  try {
    await updateCoach(id, body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Admin coach update failed:', err);
    return NextResponse.json({ error: 'Could not update coach contact.' }, { status: 502 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  try {
    await deleteCoach(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Admin coach delete failed:', err);
    return NextResponse.json({ error: 'Could not delete coach contact.' }, { status: 502 });
  }
}
