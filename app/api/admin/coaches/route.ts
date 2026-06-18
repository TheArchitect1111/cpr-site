import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/admin-auth';
import { createCoach } from '@/lib/coaches';

export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  try {
    const coach = await createCoach(body);
    return NextResponse.json({ coach });
  } catch (err) {
    console.error('Admin coach create failed:', err);
    const message = err instanceof Error ? err.message : 'Could not create coach contact.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
