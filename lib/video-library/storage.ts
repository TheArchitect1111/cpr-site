/**
 * Encrypted-at-rest CPR video drafts using CPR's existing PUBLIC Vercel Blob store.
 * IMPORTANT: all bytes placed into the public store MUST be encrypted in the browser.
 * Keys/metadata are AES-256-GCM encrypted with a server-only secret before storage.
 * This is not equivalent to a private Blob store, but encrypted media is safe if its
 * public URL is discovered without the separately protected decryption key.
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from 'node:crypto';
import { head, issueSignedToken, list, presignUrl, put } from '@vercel/blob';
import { getAdminSessionSecret } from '@/lib/admin-session-secret';
import { PREVIEW_VIDEO_TYPES, type VideoDraft, type VideoRecord } from './schema';

export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
// Preview drafts remain in their existing namespace; production is isolated.
const VIDEO_BASE = process.env.VERCEL_ENV === 'production' ? 'cpr-production' : 'cpr';
const VIDEO_ROOT = VIDEO_BASE + '/videos/encrypted/';
const META_ROOT = VIDEO_BASE + '/videos/encrypted-records/';

export function videoToken(): string | null {
  return process.env.BLOB_READ_WRITE_TOKEN || null;
}

function wrappingKey(): Buffer {
  const secret = getAdminSessionSecret();
  if (!secret) throw new Error('The CPR admin encryption secret is not configured.');
  return createHash('sha256').update('CPR encrypted video records v1:' + secret).digest();
}

export function videoStorageConfigured(): boolean {
  return Boolean(videoToken() && getAdminSessionSecret());
}

export function isVideoPath(pathname: string): boolean {
  return pathname.startsWith(VIDEO_ROOT) &&
    /^[a-f0-9-]{36}\/[a-z0-9_-]{1,80}\.enc$/.test(pathname.slice(VIDEO_ROOT.length));
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
  return VIDEO_ROOT + randomUUID() + '/' + stem + '-' + extension + '.enc';
}

export async function issueVideoUpload(pathname: string): Promise<string> {
  const token = videoToken();
  if (!token || !isVideoPath(pathname) || !videoStorageConfigured()) {
    throw new Error('CPR video encryption storage unavailable.');
  }
  const validUntil = Date.now() + 15 * 60_000;
  const signedToken = await issueSignedToken({ token, pathname, operations: ['put'], validUntil });
  const result = await presignUrl(signedToken, {
    pathname, operation: 'put', access: 'public', validUntil,
  });
  return result.presignedUrl;
}

function decodeFixedBase64(value: string, length: number): Buffer {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value) || value.length > 100) {
    throw new Error('Invalid video encryption parameters.');
  }
  const decoded = Buffer.from(value, 'base64');
  if (decoded.length !== length || decoded.toString('base64') !== value) {
    throw new Error('Invalid video encryption parameters.');
  }
  return decoded;
}

type EncryptedRecord = { v: 1; iv: string; tag: string; data: string };
type SecureRecord = { record: VideoRecord; key: string; iv: string; publicUrl: string };

function encryptRecord(value: SecureRecord): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', wrappingKey(), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return JSON.stringify({
    v: 1, iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'),
    data: data.toString('base64'),
  } satisfies EncryptedRecord);
}

function decryptRecord(raw: string): SecureRecord {
  const envelope = JSON.parse(raw) as EncryptedRecord;
  if (envelope.v !== 1) throw new Error('Unknown video metadata format.');
  const decipher = createDecipheriv('aes-256-gcm', wrappingKey(), Buffer.from(envelope.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
  return JSON.parse(Buffer.concat([
    decipher.update(Buffer.from(envelope.data, 'base64')), decipher.final(),
  ]).toString('utf8')) as SecureRecord;
}

export async function inspectVideoBlob(pathname: string, clearBytes: number) {
  const token = videoToken();
  if (!token || !isVideoPath(pathname)) throw new Error('Invalid encrypted video reference.');
  const blob = await head(pathname, { token });
  if (!blob || blob.size !== clearBytes + 16 || blob.contentType !== 'application/octet-stream') {
    throw new Error('Encrypted video was not uploaded successfully.');
  }
  return blob;
}

export async function persistUploadedVideo(
  pathname: string, draft: VideoDraft, metadata: { key: string; iv: string; size: number; mime: string },
): Promise<VideoRecord> {
  const token = videoToken();
  if (!token || !videoStorageConfigured()) throw new Error('CPR video encryption storage unavailable.');
  decodeFixedBase64(metadata.key, 32);
  decodeFixedBase64(metadata.iv, 12);
  if (validateVideoFileMeta('upload.' +
    (metadata.mime === 'video/quicktime' ? 'mov' : metadata.mime === 'video/webm' ? 'webm' : 'mp4'),
    metadata.mime, metadata.size)) throw new Error('Invalid original video.');
  const blob = await inspectVideoBlob(pathname, metadata.size);
  const id = pathname.split('/')[3];
  const now = new Date().toISOString();
  const record: VideoRecord = {
    id, title: draft.title.trim(), description: draft.description.trim(), sourceType: 'file',
    placement: draft.placement, status: 'draft', playbackUrl: null,
    storageKey: pathname, thumbnailUrl: draft.thumbnailUrl.trim() || null,
    caption: draft.caption.trim(), mimeType: metadata.mime, sizeBytes: metadata.size,
    createdAt: now, updatedAt: now, publishedAt: null,
  };
  await put(META_ROOT + id + '.json', encryptRecord({
    record, key: metadata.key, iv: metadata.iv, publicUrl: blob.url,
  }), {
    access: 'public', token, contentType: 'application/octet-stream', addRandomSuffix: false,
    allowOverwrite: false,
  });
  return record;
}

async function readSecureRecord(pathname: string): Promise<SecureRecord> {
  const token = videoToken();
  if (!token || !isVideoPath(pathname)) throw new Error('Invalid video reference.');
  const id = pathname.split('/')[3];
  const { blobs } = await list({ prefix: META_ROOT + id + '.json', token, limit: 10 });
  const match = blobs.find((b) => b.pathname === META_ROOT + id + '.json');
  if (!match) throw new Error('Video is not registered.');
  const response = await fetch(match.url, { cache: 'no-store' });
  if (!response.ok) throw new Error('Encrypted video record unavailable.');
  const secure = decryptRecord(await response.text());
  if (secure.record.storageKey !== pathname || secure.record.status !== 'draft') {
    throw new Error('Video not available for private preview.');
  }
  return secure;
}

export async function getAdminVideoPreview(pathname: string) {
  const { record, key, iv, publicUrl } = await readSecureRecord(pathname);
  return { url: publicUrl, key, iv, mime: record.mimeType };
}

export async function listUploadedVideos(): Promise<VideoRecord[]> {
  const token = videoToken();
  if (!token || !videoStorageConfigured()) return [];
  const records: VideoRecord[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: META_ROOT, token, limit: 100, cursor });
    const rows = await Promise.all(page.blobs.filter((b) => b.pathname.endsWith('.json')).map(async (blob) => {
      try {
        const res = await fetch(blob.url, { cache: 'no-store' });
        if (!res.ok) return null;
        const { record } = decryptRecord(await res.text());
        return record.storageKey && isVideoPath(record.storageKey) ? record : null;
      } catch { return null; }
    }));
    records.push(...rows.filter((record): record is VideoRecord => record !== null));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor && records.length < 500);
  return records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
