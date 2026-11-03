import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { del, head, list } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminVideoPreview, issueVideoUpload, newVideoPath,
  persistUploadedVideo, videoStorageConfigured, videoToken,
} from '@/lib/video-library/storage';
import {
  preparePublicVideo, publishPublicVideo, getPublishedVideos,
  unpublishPublicVideo,
} from '@/lib/video-library/published';
import { EMPTY_VIDEO_DRAFT } from '@/lib/video-library/schema';

export const dynamic = 'force-dynamic';

// Temporary test-only implementation on an unmerged branch.
// Never available on production, and requires a high-entropy test challenge.
// Test objects use PREVIEW prefix ('cpr'), never production prefix ('cpr-production').
const PROOF = 'x0FAE1I6zvSESz286s31EbUeua__1FfR2ENd6RcGoiANNa5A-Lt6gw';
const SAMPLE = Buffer.from('GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJChYECGFOAZwEAAAAAAAKCEU2bdLpNu4tTq4QVSalmU6yBoU27i1OrhBZUrmtTrIHWTbuMU6uEElTDZ1OsggEjTbuMU6uEHFO7a1OsggJs7AEAAAAAAABZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVSalmsCrXsYMPQkBNgIxMYXZmNjEuNy4xMDNXQYxMYXZmNjEuNy4xMDNEiYhAh3AAAAAAABZUrmvIrgEAAAAAAAA/14EBc8WIcs9dzCuXd4+cgQAitZyDdW5kiIEAhoVWX1ZQOIOBASPjg4QHc1lA4JCwgWC6gUCagQJVsIRVuYEBElTDZ/tzc59jwIBnyJlFo4dFTkNPREVSRIeMTGF2ZjYxLjcuMTAzc3PWY8CLY8WIcs9dzCuXd49nyKFFo4dFTkNPREVSRIeUTGF2YzYxLjE5LjEwMSBsaWJ2cHhnyKFFo4hEVVJBVElPTkSHkzAwOjAwOjAwLjc1MDAwMDAwMAAfQ7Z1QMPngQCjxoEAAIDwAwCdASpgAEAAAEcIhYWIhYSIAgICdaoD+AIGwSzT6hw4cOHDhw4ZAP7/TRL//FhX8WFfxYV/8WFf/PzO7cX85gCjloEAfQDRAQABEBAAGAAYWC/0AAiFKACjloEA+gDRAQABEBAAGAAYWC/0AAiFKACjloEBdwDRAQABEBAAGAAYWC/0AAiFKACjloEB9ADRAQABEBAAGAAYWC/0AAiFKACjloECcQDRAQABEBAAGAAYWC/0AAiFKAAcU7trkbuPs4EAt4r3gQHxggGj8IED', 'base64');

export async function GET(req: NextRequest) {
  if (process.env.VERCEL_ENV !== 'preview' ||
      req.nextUrl.searchParams.get('proof') !== PROOF) {
    return new NextResponse(null, { status: 404 });
  }
  if (!videoStorageConfigured()) {
    return NextResponse.json({ ok: false, stage: 'configuration' }, { status: 503 });
  }
  const token = videoToken()!;
  const steps: string[] = [];
  let stage = 'start';
  let path = '';
  let metaPath = '';
  let publicPath = '';
  let indexPath = '';
  const uploadReport: { status?: number; createdPath?: string; siblings?: string[]; headOk?: boolean; contentType?: string } = {};

  try {
    const key = randomBytes(32);
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([
      cipher.update(SAMPLE), cipher.final(), cipher.getAuthTag(),
    ]);
    path = newVideoPath('cpr-test-sample.webm');
    const id = path.split('/')[3];
    metaPath = 'cpr/videos/encrypted-records/' + id + '.json';
    indexPath = 'cpr/videos/public-index/' + id + '.json';

    stage = 'authorize-encrypted-upload';
    const signedUrl = await issueVideoUpload(path);
    steps.push(stage);

    stage = 'put-encrypted-video';
    const upload = await fetch(signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: encrypted,
    });
    if (!upload.ok) throw new Error('Signed encrypted upload HTTP ' + upload.status);
    uploadReport.status = upload.status;
    const body = await upload.text();
    try {
      const data = JSON.parse(body) as { pathname?: string };
      uploadReport.createdPath = data.pathname;
    } catch { /* empty response */ }
    const siblings = await list({ prefix: 'cpr/videos/encrypted/' + id + '/', token, limit: 10 });
    uploadReport.siblings = siblings.blobs.map(x => x.pathname);
    for (const p of [path, uploadReport.createdPath].filter((p): p is string => Boolean(p))) {
      try {
        const details = await head(p, { token });
        uploadReport.headOk = true;
        uploadReport.contentType = details.contentType;
        break;
      } catch { /* candidate not present */ }
    }
    if (!uploadReport.createdPath) throw new Error('Missing encrypted upload receipt pathname');
    path = uploadReport.createdPath;
    steps.push(stage);

    stage = 'persist-metadata';
    const record = await persistUploadedVideo(
      path,
      { ...EMPTY_VIDEO_DRAFT, sourceType: 'file', title: 'CPR temporary storage test',
        description: 'Disposable automated verification', placement: 'homepage-gallery' },
      { key: key.toString('base64'), iv: iv.toString('base64'), size: SAMPLE.length, mime: 'video/webm' },
    );
    if (record.id !== id) throw new Error('Draft ID mismatch');
    steps.push(stage);

    stage = 'read-and-decrypt';
    const preview = await getAdminVideoPreview(path);
    const read = await fetch(preview.url, { cache: 'no-store' });
    if (!read.ok) throw new Error('Encrypted read HTTP ' + read.status);
    const bytes = Buffer.from(await read.arrayBuffer());
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(bytes.subarray(-16));
    const clear = Buffer.concat([decipher.update(bytes.subarray(0, -16)), decipher.final()]);
    if (!clear.equals(SAMPLE)) throw new Error('Decrypted bytes mismatch');
    steps.push(stage);

    stage = 'authorize-public-video';
    const authorization = await preparePublicVideo(path);
    publicPath = authorization.publicPath;
    steps.push(stage);

    stage = 'put-public-video';
    const publishedUpload = await fetch(authorization.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'video/webm' },
      body: SAMPLE,
    });
    if (!publishedUpload.ok) throw new Error('Signed published upload HTTP ' + publishedUpload.status);
    const receipt = await publishedUpload.json() as { pathname?: string };
    if (!receipt.pathname) throw new Error('Missing public upload receipt pathname');
    publicPath = receipt.pathname;
    steps.push(stage);

    stage = 'commit-and-list-publication';
    const published = await publishPublicVideo(path, publicPath);
    if (published.id !== record.id) throw new Error('Published record mismatch');
    const current = await getPublishedVideos();
    if (!current.some(video => video.id === record.id)) throw new Error('Video not visible in public index');
    if (!published.playbackUrl) throw new Error('Published playback URL missing');
    const playback = await fetch(published.playbackUrl, { cache: 'no-store' });
    if (!playback.ok || !Buffer.from(await playback.arrayBuffer()).equals(SAMPLE)) {
      throw new Error('Published video bytes mismatch');
    }
    steps.push(stage);

    stage = 'unpublish-and-confirm';
    await unpublishPublicVideo(path);
    const after = await getPublishedVideos();
    if (after.some(video => video.id === record.id)) throw new Error('Video remains published');
    steps.push(stage);

    return NextResponse.json({ ok: true, stages: steps, verifiedBytes: SAMPLE.length },
      { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({
      ok: false, stage, completed: steps,
      error: error instanceof Error ? error.message : 'Unknown failure', uploadReport,
    }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  } finally {
    // Remove only paths created by this test. Never enumerate/delete client media.
    for (const name of [publicPath, indexPath, metaPath, path]) {
      if (!name) continue;
      try { await del(name, { token }); }
      catch (error) { console.error('CPR test cleanup failed', name, error instanceof Error ? error.message : 'unknown'); }
    }
  }
}
