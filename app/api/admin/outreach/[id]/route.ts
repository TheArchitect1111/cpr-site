import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/admin-auth';
import { deleteOutreach, updateOutreach } from '@/lib/outreach';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  try {
    await updateOutreach(id, body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Admin outreach update failed:', err);
    return NextResponse.json({ error: 'Could not update coach outreach record.' }, { status: 502 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  try {
    await deleteOutreach(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Admin outreach delete failed:', err);
    return NextResponse.json({ error: 'Could not delete coach outreach record.' }, { status: 502 });
  }
}
