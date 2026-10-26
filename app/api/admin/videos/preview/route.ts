import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/admin-auth';
import { getAdminVideoPreview, isVideoPath } from '@/lib/video-library/storage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const pathname = req.nextUrl.searchParams.get('pathname') || '';
  if (!isVideoPath(pathname)) return NextResponse.json({ error: 'Invalid video reference.' }, { status: 400 });
  try {
    const data = await getAdminVideoPreview(pathname);
    return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' } });
  } catch {
    return NextResponse.json({ error: 'Video preview is temporarily unavailable.' }, { status: 503 });
  }
}
