/**
 * CPR public video release. An admin publishes a deliberately decrypted COPY.
 * Private drafts and their per-file keys stay in encrypted records, never in
 * public catalog entries. Unpublishing removes both the catalog and clear copy.
 */
import { del, head, issueSignedToken, list, presignUrl, put } from '@vercel/blob';
import { getAdminVideoPreview, isVideoPath, listUploadedVideos, videoToken } from '@/lib/video-library/storage';
import type { VideoPlacement, VideoRecord } from '@/lib/video-library/schema';
import { randomUUID } from 'node:crypto';

const PUBLIC_ROOT = 'cpr/videos/published/';
const INDEX_ROOT = 'cpr/videos/public-index/';
const ID = '[a-f0-9-]{36}';
const MEDIA_RE = new RegExp('^' + PUBLIC_ROOT + '(' + ID + ')/(' + ID + ')\\.(mp4|webm|mov)$');
const HOME_PLACEMENTS: VideoPlacement[] = ['homepage-featured', 'homepage-gallery'];
export type PublicVideo = Pick<VideoRecord,
  'id' | 'title' | 'description' | 'placement' | 'thumbnailUrl' | 'caption' | 'publishedAt' | 'playbackUrl'
> & { mimeType: string; publicPath: string };

export function supportsHomepagePublication(placement: VideoPlacement) {
  return HOME_PLACEMENTS.includes(placement);
}

function indexPath(id: string) {
  if (!new RegExp('^' + ID + '$').test(id)) throw new Error('Invalid video identifier.');
  return INDEX_ROOT + id + '.json';
}

export function publishedMediaMatches(pathname: string, id: string) {
  const match = MEDIA_RE.exec(pathname);
  return Boolean(match && match[1] === id);
}

async function getOriginal(pathname: string): Promise<VideoRecord> {
  if (!isVideoPath(pathname)) throw new Error('Invalid encrypted video reference.');
  const id = pathname.split('/')[3];
  const record = (await listUploadedVideos()).find(r => r.id === id && r.storageKey === pathname);
  if (!record || record.sourceType !== 'file' || !record.mimeType || !record.sizeBytes) {
    throw new Error('Video draft was not found.');
  }
  if (!supportsHomepagePublication(record.placement)) {
    throw new Error('Homepage publishing is only available for homepage placements.');
  }
  // Also verifies the encrypted record can still be opened by the admin.
  await getAdminVideoPreview(pathname);
  return record;
}

export async function preparePublicVideo(pathname: string) {
  const token = videoToken();
  if (!token) throw new Error('Video storage is unavailable.');
  const record = await getOriginal(pathname);
  const ext = record.mimeType === 'video/quicktime' ? 'mov' : record.mimeType === 'video/webm' ? 'webm' : 'mp4';
  const publicPath = PUBLIC_ROOT + record.id + '/' + randomUUID() + '.' + ext;
  const validUntil = Date.now() + 15 * 60_000;
  const signedToken = await issueSignedToken({
    token, pathname: publicPath, operations: ['put'], validUntil,
  });
  const { presignedUrl } = await presignUrl(signedToken, {
    pathname: publicPath, operation: 'put', access: 'public', validUntil,
  });
  return { publicPath, uploadUrl: presignedUrl, mimeType: record.mimeType, sizeBytes: record.sizeBytes };
}

export async function getPublishedVideos(): Promise<PublicVideo[]> {
  const token = videoToken();
  if (!token) return [];
  const items: PublicVideo[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: INDEX_ROOT, token, limit: 100, cursor });
    const rows = await Promise.all(page.blobs.filter(b => b.pathname.endsWith('.json')).map(async blob => {
      try {
        const response = await fetch(blob.url, { cache: 'no-store' });
        if (!response.ok) return null;
        const entry = await response.json() as PublicVideo;
        if (!entry || typeof entry.id !== 'string' || !publishedMediaMatches(entry.publicPath, entry.id) ||
          blob.pathname !== indexPath(entry.id) || !supportsHomepagePublication(entry.placement) ||
          !entry.playbackUrl?.startsWith('https://') || !entry.publishedAt) return null;
        return entry;
      } catch { return null; }
    }));
    items.push(...rows.filter((entry): entry is PublicVideo => entry !== null));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor && items.length < 200);
  return items.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
}

export async function publishPublicVideo(pathname: string, publicPath: string): Promise<PublicVideo> {
  const token = videoToken();
  if (!token) throw new Error('Video storage is unavailable.');
  const record = await getOriginal(pathname);
  if (!publishedMediaMatches(publicPath, record.id)) throw new Error('Invalid published video reference.');
  const clear = await head(publicPath, { token });
  if (clear.size !== record.sizeBytes || clear.contentType !== record.mimeType) {
    throw new Error('Published upload does not match the original video details.');
  }
  const previous = (await getPublishedVideos()).find(r => r.id === record.id);
  const entry: PublicVideo = {
    id: record.id, title: record.title, description: record.description,
    placement: record.placement, thumbnailUrl: record.thumbnailUrl,
    caption: record.caption, playbackUrl: clear.url, publicPath,
    publishedAt: new Date().toISOString(), mimeType: record.mimeType,
  };
  await put(indexPath(record.id), JSON.stringify(entry), {
    access: 'public', token, contentType: 'application/json',
    allowOverwrite: true, addRandomSuffix: false, cacheControlMaxAge: 60,
  });
  if (previous && previous.publicPath !== publicPath) {
    // Old public copy is no longer referenced. Retry cleanup separately if deletion fails.
    try { await del(previous.publicPath, { token }); } catch { /* no impact on new publication */ }
  }
  return entry;
}

export async function unpublishPublicVideo(pathname: string) {
  const token = videoToken();
  if (!token) throw new Error('Video storage is unavailable.');
  const id = pathname.split('/')[3];
  if (!isVideoPath(pathname)) throw new Error('Invalid video reference.');
  const record = (await listUploadedVideos()).find(r => r.id === id && r.storageKey === pathname);
  if (!record) throw new Error('Video draft was not found.');
  const existing = (await getPublishedVideos()).find(entry => entry.id === id);
  if (!existing) return { unpublished: true };
  await del(indexPath(id), { token });
  // The catalogue is removed first, so the homepage immediately stops linking it.
  await del(existing.publicPath, { token });
  return { unpublished: true };
}

/** Add public publication status to the encrypted draft list for admin display. */
export async function listAdminVideos(): Promise<VideoRecord[]> {
  const [drafts, published] = await Promise.all([listUploadedVideos(), getPublishedVideos()]);
  const publishedById = new Map(published.map(v => [v.id, v]));
  return drafts.map(draft => {
    const live = publishedById.get(draft.id);
    return live ? {
      ...draft, status: 'published' as const, playbackUrl: live.playbackUrl,
      publishedAt: live.publishedAt,
    } : draft;
  });
}
