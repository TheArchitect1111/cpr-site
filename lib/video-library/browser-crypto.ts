/**
 * Browser-only AES-GCM for video drafts. Plaintext never leaves the browser.
 * Video payloads in Vercel Blob are ciphertext, and the record containing this
 * per-video key is encrypted separately with CPR's server-only admin secret.
 */
export function base64FromBytes(data: Uint8Array): string {
  let s = '';
  for (const byte of data) s += String.fromCharCode(byte);
  return btoa(s);
}

export function bytesFromBase64(value: string): Uint8Array<ArrayBuffer> {
  const decoded = atob(value);
  const data = new Uint8Array(new ArrayBuffer(decoded.length));
  for (let i = 0; i < decoded.length; i++) data[i] = decoded.charCodeAt(i);
  return data;
}

export async function encryptVideoFile(file: File): Promise<{
  data: Blob;
  key: string;
  iv: string;
  size: number;
  mime: string;
}> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt']);
  const rawKey = await crypto.subtle.exportKey('raw', key);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, await file.arrayBuffer());
  return {
    data: new Blob([encrypted], { type: 'application/octet-stream' }),
    key: base64FromBytes(new Uint8Array(rawKey)),
    iv: base64FromBytes(iv),
    size: file.size,
    mime: file.type,
  };
}

export async function decryptVideoFile(encrypted: ArrayBuffer, keyB64: string, ivB64: string, mime: string): Promise<string> {
  const keyBytes = bytesFromBase64(keyB64);
  const iv = bytesFromBase64(ivB64);
  if (keyBytes.length !== 32 || iv.length !== 12 || !mime.startsWith('video/')) throw new Error('Invalid secure preview.');
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['decrypt']);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);
  return URL.createObjectURL(new Blob([plain], { type: mime }));
}
