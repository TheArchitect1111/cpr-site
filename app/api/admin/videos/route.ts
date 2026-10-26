import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/admin-auth';
import { listUploadedVideos, videoToken } from '@/lib/video-library/storage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!videoToken()) return NextResponse.json({ items: [], configured: false }, { headers: { 'Cache-Control': 'no-store' } });
  try {
    const items = await listUploadedVideos();
    return NextResponse.json({ items, configured: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Could not load private video drafts.' }, { status: 502 });
  }
}
