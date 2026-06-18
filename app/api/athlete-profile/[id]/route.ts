import { NextRequest, NextResponse } from 'next/server';
import { getAthleteByRecordId, submitPendingAthleteUpdate, verifyAthleteEditToken } from '@/lib/athletes';

function authorized(id: string, req: NextRequest) {
  return verifyAthleteEditToken(id, req.nextUrl.searchParams.get('token') || '');
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!authorized(id, req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const athlete = await getAthleteByRecordId(id);
  if (!athlete) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  return NextResponse.json({ athlete });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!authorized(id, req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  try {
    const update = await submitPendingAthleteUpdate(id, body);
    return NextResponse.json({ ok: true, update });
  } catch (err) {
    console.error('Athlete profile update failed:', err);
    return NextResponse.json({ error: 'Could not submit profile update for review.' }, { status: 502 });
  }
}
