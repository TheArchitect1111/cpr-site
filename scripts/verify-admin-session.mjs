/**
 * Verifies Node admin session signing matches Edge verification.
 * Run: node scripts/verify-admin-session.mjs
 */
import { createHmac } from 'node:crypto';
import { pathToFileURL } from 'node:url';

process.env.ADMIN_AUTH_SECRET = process.env.ADMIN_AUTH_SECRET || 'test-admin-session-secret';

function b64url(input) {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function sign(payload) {
  return createHmac('sha256', process.env.ADMIN_AUTH_SECRET)
    .update(payload)
    .digest('base64url');
}

const payload = b64url(
  JSON.stringify({
    email: 'mikecprglobal@mississaugamagic.com',
    role: 'owner',
    name: 'Mike',
    exp: Date.now() + 60_000,
  }),
);
const token = `${payload}.${sign(payload)}`;

const { verifyAdminSessionEdge } = await import(
  pathToFileURL(new URL('../lib/edge-admin-session.ts', import.meta.url)).href
);

const session = await verifyAdminSessionEdge(token);
if (!session?.email) {
  console.error('FAIL: edge verification rejected a valid Node-signed admin token');
  process.exit(1);
}

console.log('OK: admin session Node sign + Edge verify parity');
