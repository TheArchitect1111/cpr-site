import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/admin-auth';
import { persistYouTubeDraft, videoStorageConfigured } from '@/lib/video-library/storage';
import { publishYouTubeVideo, unpublishYouTubeVideo } from '@/lib/video-library/published';
import type { VideoDraft } from '@/lib/video-library/schema';

export const dynamic = 'force-dynamic';

const ID_RE = /^[a-f0-9-]{36}$/;

export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!videoStorageConfigured()) {
    return NextResponse.json({ error: 'CPR video storage is unavailable.' }, { status: 503 });
  }
  let body: { action?: string; draft?: VideoDraft; id?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  try {
    if (body.action === 'save') {
      const draft = body.draft;
      if (!draft || draft.sourceType !== 'youtube') {
        return NextResponse.json({ error: 'Enter a YouTube or Shorts link.' }, { status: 400 });
      }
      const record = await persistYouTubeDraft(draft);
      return NextResponse.json({ record }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
    }
    const id = String(body.id || '');
    if (!ID_RE.test(id)) return NextResponse.json({ error: 'Invalid video identifier.' }, { status: 400 });
    if (body.action === 'publish') {
      return NextResponse.json({ video: await publishYouTubeVideo(id) }, { headers: { 'Cache-Control': 'no-store' } });
    }
    if (body.action === 'unpublish') {
      return NextResponse.json(await unpublishYouTubeVideo(id), { headers: { 'Cache-Control': 'no-store' } });
    }
    return NextResponse.json({ error: 'Unsupported video action.' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'YouTube video action failed.';
    // Validation errors are safe to surface; storage failures remain generic.
    if (/^(Invalid|Enter|Unsupported|Saved YouTube)/.test(message)) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error('CPR YouTube video action failed:', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json({ error: 'Could not save or publish YouTube video.' }, { status: 502 });
  }
}
