import { put } from '@vercel/blob';

const DATA_URL_RE = /^data:(image\/[\w+.-]+);base64,(.+)$/i;
const MAX_BYTES = 5 * 1024 * 1024;

function extensionForMime(mime: string): string {
  const sub = mime.split('/')[1]?.toLowerCase() || 'jpg';
  if (sub === 'jpeg') return 'jpg';
  return sub.replace(/[^a-z0-9]/g, '') || 'jpg';
}

/** Upload a data-URL image to Vercel Blob. Returns the public URL or null on failure. */
export async function uploadDataUrlPhoto(dataUrl: string, slug: string): Promise<string | null> {
  if (!dataUrl.startsWith('data:image/')) return null;

  const match = dataUrl.match(DATA_URL_RE);
  if (!match) return null;

  const [, mime, base64] = match;
  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length > MAX_BYTES) {
    console.error('Apply photo exceeds 5 MB limit.');
    return null;
  }

  const pathname = `cpr/apply/${slug}/photo-${Date.now()}.${extensionForMime(mime)}`;
  try {
    const blob = await put(pathname, buffer, {
      access: 'public',
      contentType: mime,
      addRandomSuffix: false,
    });
    return blob.url;
  } catch (err) {
    console.error('Apply photo upload failed:', err);
    return null;
  }
}

/** Normalize photo input: keep http(s) URLs, upload data URLs, drop invalid values. */
export async function normalizePhotoUrl(raw: string | undefined, slug: string): Promise<string | undefined> {
  const value = raw?.trim();
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('data:image/')) {
    const uploaded = await uploadDataUrlPhoto(value, slug);
    return uploaded || undefined;
  }
  return undefined;
}
