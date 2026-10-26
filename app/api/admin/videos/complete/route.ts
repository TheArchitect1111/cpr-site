import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/admin-auth';
import { VIDEO_PLACEMENTS, getValidatedVideoLink, type VideoDraft } from '@/lib/video-library/schema';
import { isVideoPath, persistUploadedVideo, videoToken } from '@/lib/video-library/storage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!videoToken()) return NextResponse.json({ error: 'Private video storage is not configured.' }, { status: 503 });
  try {
    const data = await req.json() as { pathname?: string; draft?: VideoDraft };
    const pathname = String(data.pathname || '');
    const draft = data.draft;
    if (!isVideoPath(pathname) || !draft || draft.sourceType !== 'file' ||
      !draft.title?.trim() || draft.title.length > 120 ||
      (draft.description || '').length > 2000 || (draft.caption || '').length > 300 ||
      !VIDEO_PLACEMENTS.some(p => p.value === draft.placement) ||
      (draft.thumbnailUrl && !/^https:\/\//i.test(draft.thumbnailUrl)) ||
      (draft.externalUrl && !getValidatedVideoLink(draft.externalUrl, 'youtube'))) {
      return NextResponse.json({ error: 'Invalid video details.' }, { status: 400 });
    }
    const record = await persistUploadedVideo(pathname, draft);
    return NextResponse.json({ record }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Could not verify and record private video.' }, { status: 502 });
  }
}
