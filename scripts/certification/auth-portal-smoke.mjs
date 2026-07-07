import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (file) => readFileSync(join(root, file), 'utf8');

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const authFiles = [
  'middleware.ts',
  'lib/admin-auth.ts',
  'lib/portal-auth.ts',
  'lib/portal-owner.ts',
  'app/api/auth/magic-link/verify/route.ts',
  'app/api/portal/login/route.ts',
  'app/api/portal/clerk-bridge/route.ts',
];

const forbiddenBypasses = [
  'cpr-test-mode',
  'isCprTestMode',
  'cpr-staging',
  'isCprAdminStagingHost',
  'STAGING_ADMIN_BYPASS',
];

for (const file of authFiles) {
  const source = read(file);
  for (const marker of forbiddenBypasses) {
    assert(!source.includes(marker), `${file} contains forbidden bypass marker: ${marker}`);
  }
}

const portalAuth = read('lib/portal-auth.ts');
assert(
  portalAuth.includes("value === 'athlete' || value === 'parent'"),
  'Portal sessions must be restricted to athlete and parent roles.',
);
assert(
  portalAuth.includes('normalizePortalSession(session)'),
  'Portal session signing must normalize session payloads.',
);
assert(
  portalAuth.includes('normalizePortalSession(session);'),
  'Portal session verification must normalize session payloads.',
);

const middleware = read('middleware.ts');
assert(
  middleware.includes("const ADMIN_PREFIX = '/admin'") && middleware.includes('pathname.startsWith(`${ADMIN_PREFIX}/`)'),
  'Admin routes must be protected.',
);
assert(
  middleware.includes("pathPrefix: '/portal/athlete/'") && middleware.includes("roleValue: 'athlete'"),
  'Athlete routes must be protected.',
);
assert(
  middleware.includes("pathPrefix: '/portal/parent/'") && middleware.includes("roleValue: 'parent'"),
  'Parent routes must be protected.',
);
assert(middleware.includes('/portal/login'), 'Portal unauthorized access must redirect to portal login.');
assert(middleware.includes('/admin/login'), 'Admin unauthorized access must redirect to admin login.');

const cleanedPortalPages = [
  'app/portal/athlete/[slug]/ask-cpr/page.tsx',
  'app/portal/athlete/[slug]/document-vault/page.tsx',
  'app/portal/athlete/[slug]/messaging-center/page.tsx',
  'app/portal/athlete/[slug]/resource-library/page.tsx',
  'app/portal/athlete/[slug]/upcoming-events/page.tsx',
  'app/portal/athlete/[slug]/video-learning-center/page.tsx',
  'app/portal/parent/[slug]/ask-cpr/page.tsx',
  'app/portal/parent/[slug]/document-vault/page.tsx',
  'app/portal/parent/[slug]/messaging-center/page.tsx',
  'app/portal/parent/[slug]/recruiting-timeline/page.tsx',
  'app/portal/parent/[slug]/resource-library/page.tsx',
  'app/portal/parent/[slug]/upcoming-events/page.tsx',
  'app/portal/parent/[slug]/video-learning-center/page.tsx',
];

for (const file of cleanedPortalPages) {
  assert(!read(file).includes("import { site }"), `${file} still imports unused site config.`);
}

if (failures.length) {
  console.error('Authentication and portal smoke checks failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Authentication and portal smoke checks passed.');
