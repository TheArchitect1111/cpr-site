import path from 'node:path';
import { changedFiles, currentBranch, currentCommit, generatedAt, reportDir, root, writeJson } from './lib.mjs';

const files = changedFiles().map((file) => file.replaceAll('\\', '/'));
const applicationPrefixes = ['app/', 'lib/', 'vendor/', 'public/', 'components/', 'pages/'];
const applicationExact = new Set(['middleware.ts']);
const applicationDriftFiles = files.filter((file) => applicationExact.has(file) || applicationPrefixes.some((prefix) => file.startsWith(prefix)));
const disallowedReferences = [];
const driftScore = applicationDriftFiles.length === 0 ? 100 : Math.max(0, 100 - applicationDriftFiles.length * 10);
const integrityScore = disallowedReferences.length === 0 && applicationDriftFiles.length === 0 ? 100 : 80;

const report = {
  name: 'EA Governance Drift Report',
  branch: currentBranch(),
  commit: currentCommit(),
  generatedAt: generatedAt(),
  changedFileCount: files.length,
  applicationDriftFiles,
  disallowedReferences,
  driftScore,
  integrityScore,
};

writeJson(path.join(reportDir, 'drift-report.json'), report);
console.log(`Drift report generated: driftScore=${driftScore}, integrityScore=${integrityScore}`);
