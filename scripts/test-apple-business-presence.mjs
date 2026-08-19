import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const contract = readFileSync(new URL('../lib/business-presence.ts', import.meta.url), 'utf8');
const admin = readFileSync(new URL('../app/admin/page.tsx', import.meta.url), 'utf8');
const panel = readFileSync(new URL('../app/admin/AdminBusinessPresence.tsx', import.meta.url), 'utf8');

assert.match(contract, /https:\/\/business\.apple\.com\//);
assert.match(contract, /Automated synchronization remains disabled/);
assert.match(admin, /tab === 'business-presence'/);
assert.match(admin, />Business Presence<\/a>/);
assert.match(panel, />Set Up Apple Business<\/a>/);

console.log('PASS: CPR Apple Business presence contract');
