import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/admin-auth';
import { updateTicket } from '@/lib/sections-data';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null) as { decision?: string; note?: string } | null;
  const decision = body?.decision === 'rejected' ? 'Closed' : 'Resolved';
  const label = decision === 'Resolved' ? 'Approved for website builder review.' : 'Rejected by admin.';

  const ok = await updateTicket(id, {
    status: decision,
    adminNotes: [label, body?.note?.trim()].filter(Boolean).join(' '),
    dateResolved: new Date().toISOString().slice(0, 10),
  });

  if (!ok) return NextResponse.json({ error: 'Could not update request.' }, { status: 502 });
  return NextResponse.json({ ok: true, status: decision });
}

