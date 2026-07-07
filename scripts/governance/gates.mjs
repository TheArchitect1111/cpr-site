import fs from 'node:fs';
import path from 'node:path';
import { changedFiles, currentBranch, currentCommit, mergeBase, originMainCommit, readJson, root } from './lib.mjs';

const allowedExact = new Set([
  '.env.example',
  'package.json',
  'route-manifest.json',
  'platform.manifest.json',
  '.github/workflows/release-governance.yml',
  'docs/EA-RELEASE-GOVERNANCE.md',
  'docs/PLATFORM-MANIFEST.md',
  'docs/ENVIRONMENT-CATALOG.md',
  'docs/EXTERNAL-SERVICE-REGISTRY.md',
  'docs/BRANCH-GOVERNANCE.md',
  'docs/DEPLOYMENT-CHECKLIST.md',
  'docs/DRIFT-DETECTION.md',
  'docs/RECOVERY-PLAYBOOK.md',
  'docs/releases/README.md',
  'docs/releases/latest.json'
]);

const allowedPrefixes = [
  'governance/',
  'scripts/governance/'
];

const forbiddenPrefixes = [
  'app/',
  'lib/',
  'vendor/',
  'public/',
  'components/',
  'pages/'
];

const forbiddenExact = new Set(['middleware.ts']);

function normalize(file) {
  return file.replaceAll('\\', '/');
}

function isAllowed(file) {
  const normalized = normalize(file);
  return allowedExact.has(normalized) || allowedPrefixes.some((prefix) => normalized.startsWith(prefix));
}

const files = changedFiles().map(normalize);
const disallowed = files.filter((file) => !isAllowed(file));
const applicationDrift = files.filter((file) => forbiddenExact.has(file) || forbiddenPrefixes.some((prefix) => file.startsWith(prefix)));

const branch = currentBranch();
const allowedBranches = new Set(['governance/baseline-v1.0', 'main']);
if (!allowedBranches.has(branch)) {
  throw new Error(`Expected governance/baseline-v1.0 or main, got ${branch}`);
}

if (mergeBase('HEAD', 'origin/main') !== originMainCommit()) {
  throw new Error(`HEAD ${currentCommit()} is not based on origin/main ${originMainCommit()}`);
}

if (disallowed.length) {
  throw new Error(`Disallowed governance baseline changes:\n${disallowed.join('\n')}`);
}

if (applicationDrift.length) {
  throw new Error(`Application drift detected:\n${applicationDrift.join('\n')}`);
}

for (const file of ['route-manifest.json', 'platform.manifest.json', 'docs/releases/latest.json']) {
  readJson(path.join(root, file));
}

const latestRaw = fs.readFileSync(path.join(root, 'docs', 'releases', 'latest.json'), 'utf8');
for (const forbidden of ['fix/admin-login-loop', '87187f4']) {
  if (latestRaw.includes(forbidden)) throw new Error(`Forbidden reference found in latest.json: ${forbidden}`);
}

console.log(`Governance gates passed: ${files.length} changed files, ${applicationDrift.length} application drift files`);
