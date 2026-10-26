import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/admin-auth';
import { isVideoPath, videoStorageConfigured } from '@/lib/video-library/storage';
import { preparePublicVideo, publishPublicVideo, unpublishPublicVideo } from '@/lib/video-library/published';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!videoStorageConfigured()) {
    return NextResponse.json({ error: 'CPR video storage is unavailable.' }, { status: 503 });
  }
  try {
    const body = await req.json() as { action?: string; pathname?: string; publicPath?: string };
    const pathname = String(body.pathname || '');
    if (!isVideoPath(pathname)) return NextResponse.json({ error: 'Invalid video reference.' }, { status: 400 });
    if (body.action === 'prepare') {
      const result = await preparePublicVideo(pathname);
      return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
    }
    if (body.action === 'commit') {
      const result = await publishPublicVideo(pathname, String(body.publicPath || ''));
      return NextResponse.json({ video: result }, { headers: { 'Cache-Control': 'no-store' } });
    }
    if (body.action === 'unpublish') {
      const result = await unpublishPublicVideo(pathname);
      return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
    }
    return NextResponse.json({ error: 'Unsupported publishing action.' }, { status: 400 });
  } catch (error) {
    console.error('CPR video publish action failed', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'The video publishing action could not be completed.' }, { status: 502 });
  }
}
