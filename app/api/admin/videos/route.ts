import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/admin-auth';
import { videoStorageConfigured } from '@/lib/video-library/storage';
import { listAdminVideos } from '@/lib/video-library/published';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!videoStorageConfigured()) return NextResponse.json({ items: [], configured: false }, { headers: { 'Cache-Control': 'no-store' } });
  try {
    const items = await listAdminVideos();
    return NextResponse.json({ items, configured: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Could not load private video drafts.' }, { status: 502 });
  }
}
