import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { persistYouTubeDraft, listUploadedVideos, videoStorageConfigured, videoToken } from '@/lib/video-library/storage';
import { publishYouTubeVideo, getPublishedVideos, unpublishYouTubeVideo, listAdminVideos } from '@/lib/video-library/published';
import { getYouTubeEmbedUrl } from '@/lib/video-library/schema';
export const dynamic = 'force-dynamic';

// Test only: not merged to main, creates/deletes its own disposable records.
export async function GET(req: NextRequest) {
  if (process.env.VERCEL_ENV !== 'preview' ||
      req.nextUrl.searchParams.get('proof') !== 'CDkeqI0zAvX7FJ_LzR2xfT98Wl9u8syBOPVCK5TV0P4') {
    return new NextResponse(null, { status: 404 });
  }
  if (!videoStorageConfigured()) return NextResponse.json({ ok: false, stage: 'config' }, { status: 503 });
  const token = videoToken()!;
  let id = '';
  let stage = 'save';
  const steps: string[] = [];
  try {
    const record = await persistYouTubeDraft({
      title: 'CPR QA Shorts test (disposable)',
      description: 'Temporary embed test, not user content',
      sourceType: 'youtube',
      externalUrl: 'https://youtube.com/shorts/hd-Lfve3otA?si=piwazqlP09xaVi73',
      placement: 'homepage-gallery',
      thumbnailUrl: '', caption: '',
    });
    id = record.id;
    if (record.status !== 'draft' || record.playbackUrl !== null) throw new Error('Draft accidentally published');
    steps.push('save');
    stage = 'reload';
    const drafts = await listUploadedVideos();
    if (!drafts.some(d => d.id === id && d.externalUrl === 'https://www.youtube.com/watch?v=hd-Lfve3otA')) {
      throw new Error('Encrypted draft not readable');
    }
    steps.push('reload');
    stage = 'publish';
    const pub = await publishYouTubeVideo(id);
    if (pub.playbackUrl !== getYouTubeEmbedUrl('https://youtube.com/shorts/hd-Lfve3otA')) throw new Error('Wrong embed');
    steps.push('publish');
    stage = 'verify-homepage-data';
    const publicItems = await getPublishedVideos();
    if (!publicItems.some(d => d.id === id && d.sourceType === 'youtube' && d.publicPath === null)) {
      throw new Error('YouTube video not in homepage index');
    }
    const adminItems = await listAdminVideos();
    if (!adminItems.some(d => d.id === id && d.status === 'published')) throw new Error('Admin did not reflect published state');
    steps.push('verify-homepage-data');
    stage = 'unpublish';
    await unpublishYouTubeVideo(id);
    const after = await getPublishedVideos();
    if (after.some(d => d.id === id)) throw new Error('YouTube embed remained public');
    steps.push('unpublish');
    return NextResponse.json({ ok: true, steps, embed: pub.playbackUrl },
      { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return NextResponse.json({ ok: false, stage, completed: steps, reason: err instanceof Error ? err.message : 'unknown' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } });
  } finally {
    if (id) for (const name of ['cpr/videos/public-index/' + id + '.json','cpr/videos/encrypted-records/' + id + '.json']) {
      try { await del(name, { token }); }
      catch (err) { console.error('CPR QA cleanup failed', name, err instanceof Error ? err.message : 'unknown'); }
    }
  }
}