import { randomUUID } from 'node:crypto';
import { get, head, issueSignedToken, list, presignUrl, put } from '@vercel/blob';
import { PREVIEW_VIDEO_TYPES, type VideoDraft, type VideoRecord } from './schema';

export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const VIDEO_ROOT = 'cpr/videos/drafts/';
const META_ROOT = 'cpr/videos/records/';

export function videoToken(): string | null {
  // A DEDICATED private Blob store. Never fall back to the site's public image-store token.
  return process.env.CPR_VIDEO_BLOB_READ_WRITE_TOKEN || null;
}

export function isVideoPath(pathname: string): boolean {
  return /^cpr\/videos\/drafts\/[a-f0-9-]{36}\/[a-z0-9_-]{1,80}\.(?:mp4|webm|mov)$/.test(pathname);
}

export function validateVideoFileMeta(name: string, mime: string, bytes: number): string | null {
  if (!name || name.length > 255) return 'Invalid filename.';
  if (!Number.isSafeInteger(bytes) || bytes < 1 || bytes > MAX_VIDEO_BYTES) return 'Video must be 100 MB or smaller.';
  if (!PREVIEW_VIDEO_TYPES.some((t) => t === mime)) return 'Only MP4, WebM and MOV videos are supported.';
  const extension = name.toLowerCase().split('.').pop();
  if ((mime === 'video/mp4' && extension !== 'mp4') ||
      (mime === 'video/webm' && extension !== 'webm') ||
      (mime === 'video/quicktime' && extension !== 'mov')) return 'Filename and video format do not match.';
  return null;
}

export function newVideoPath(filename: string): string {
  const extension = filename.toLowerCase().split('.').pop();
  const stem = filename.slice(0, -(extension!.length + 1)).toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'video';
  return VIDEO_ROOT + randomUUID() + '/' + stem + '.' + extension;
}

export async function issueVideoUpload(pathname: string): Promise<string> {
  const token = videoToken();
  if (!token || !isVideoPath(pathname)) throw new Error('Private video storage is unavailable.');
  const signedToken = await issueSignedToken({ token, pathname, operations: ['put'], validUntil: Date.now() + 15 * 60_000 });
  const result = await presignUrl(signedToken, {
    pathname, operation: 'put', validUntil: Date.now() + 15 * 60_000,
  });
  return result.presignedUrl;
}

export async function inspectVideoBlob(pathname: string) {
  const token = videoToken();
  if (!token || !isVideoPath(pathname)) throw new Error('Invalid private video reference.');
  const blob = await head(pathname, { token });
  if (!blob || !PREVIEW_VIDEO_TYPES.some((t) => t === blob.contentType) || blob.size > MAX_VIDEO_BYTES) {
    throw new Error('Uploaded video has an unsupported format or size.');
  }
  return blob;
}

export async function issueVideoPreview(pathname: string): Promise<string> {
  const token = videoToken();
  if (!token || !isVideoPath(pathname)) throw new Error('Invalid private video reference.');
  const signedToken = await issueSignedToken({
    token, pathname, operations: ['get'], validUntil: Date.now() + 30 * 60_000,
  });
  const { presignedUrl } = await presignUrl(signedToken, {
    pathname, operation: 'get', validUntil: Date.now() + 30 * 60_000,
  });
  return presignedUrl;
}

export async function persistUploadedVideo(pathname: string, draft: VideoDraft): Promise<VideoRecord> {
  const token = videoToken();
  if (!token) throw new Error('Private video storage is not configured.');
  const blob = await inspectVideoBlob(pathname);
  const id = pathname.split('/')[3];
  const now = new Date().toISOString();
  const record: VideoRecord = {
    id, title: draft.title.trim(), description: draft.description.trim(), sourceType: 'file',
    placement: draft.placement, status: 'draft', playbackUrl: null,
    storageKey: pathname, thumbnailUrl: draft.thumbnailUrl.trim() || null,
    caption: draft.caption.trim(), mimeType: blob.contentType, sizeBytes: blob.size,
    createdAt: now, updatedAt: now, publishedAt: null,
  };
  await put(META_ROOT + id + '.json', JSON.stringify(record), {
    access: 'private', token, contentType: 'application/json', addRandomSuffix: false,
    allowOverwrite: false,
  });
  return record;
}

export async function listUploadedVideos(): Promise<VideoRecord[]> {
  const token = videoToken();
  if (!token) return [];
  const { blobs } = await list({ prefix: META_ROOT, token, limit: 100 });
  const rows = await Promise.all(blobs.filter((b) => b.pathname.endsWith('.json')).map(async (b) => {
    try {
      const result = await get(b.pathname, { access: 'private', token });
      if (!result || result.statusCode !== 200 || !result.stream) return null;
      const raw = await new Response(result.stream).json() as VideoRecord;
      return raw.storageKey && isVideoPath(raw.storageKey) ? raw : null;
    } catch {
      return null;
    }
  }));
  return rows.filter((item): item is VideoRecord => item !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
