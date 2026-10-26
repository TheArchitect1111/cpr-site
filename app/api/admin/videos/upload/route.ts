import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/admin-auth';
import { issueVideoUpload, newVideoPath, validateVideoFileMeta, videoStorageConfigured } from '@/lib/video-library/storage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!videoStorageConfigured()) return NextResponse.json({ error: 'CPR media storage is not configured.' }, { status: 503 });
  try {
    const data = await req.json() as { name?: string; mime?: string; size?: number };
    const name = String(data.name || '');
    const mime = String(data.mime || '');
    const error = validateVideoFileMeta(name, mime, Number(data.size));
    if (error) return NextResponse.json({ error }, { status: 400 });
    const pathname = newVideoPath(name);
    const uploadUrl = await issueVideoUpload(pathname);
    return NextResponse.json({ pathname, uploadUrl }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Could not authorize a private upload.' }, { status: 502 });
  }
}
