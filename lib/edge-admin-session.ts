/** Edge-compatible admin session verification for middleware. */

type AdminSession = { email: string; role: string; name: string };

function secret(): string | null {
  const value = process.env.ADMIN_AUTH_SECRET?.trim() || process.env.ADMIN_PASSWORD?.trim();
  return value || null;
}

function fromB64url(input: string): Uint8Array {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(padded);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function verifySignature(payloadB64: string, sigB64: string, key: CryptoKey): Promise<boolean> {
  const sigBytes = fromB64url(sigB64);
  const signature = new Uint8Array(sigBytes);
  return globalThis.crypto.subtle.verify(
    'HMAC',
    key,
    signature,
    new TextEncoder().encode(payloadB64),
  );
}

export async function verifyAdminSessionEdge(token: string): Promise<AdminSession | null> {
  const s = secret();
  if (!s || !token) return null;
  const [payloadB64, sigB64] = token.split('.');
  if (!payloadB64 || !sigB64) return null;

  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(s),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );

  const valid = await verifySignature(payloadB64, sigB64, key);
  if (!valid) return null;

  try {
    const parsed = JSON.parse(new TextDecoder().decode(fromB64url(payloadB64))) as AdminSession & { exp?: number };
    if (!parsed.email || !parsed.exp || parsed.exp < Date.now()) return null;
    return {
      email: parsed.email,
      role: parsed.role || 'admin',
      name: parsed.name || parsed.email,
    };
  } catch {
    return null;
  }
}
