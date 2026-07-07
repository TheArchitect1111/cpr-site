import path from 'node:path';
import {
  branchPolicy,
  changedFiles,
  currentCommit,
  generatedAt,
  policySummary,
  reportDir,
  writeJson,
} from './lib.mjs';

const files = changedFiles().map((file) => file.replaceAll('\\', '/'));
const policy = branchPolicy();
if (!policy.validationEligible) {
  throw new Error(`Branch is not eligible for governance drift validation.\n${policySummary(policy)}`);
}

const applicationPrefixes = ['app/', 'lib/', 'vendor/', 'public/', 'components/', 'pages/'];
const applicationExact = new Set(['middleware.ts']);
const applicationDriftFiles = files.filter((file) => applicationExact.has(file) || applicationPrefixes.some((prefix) => file.startsWith(prefix)));
const disallowedReferences = [];
const driftScore = applicationDriftFiles.length === 0 ? 100 : Math.max(0, 100 - applicationDriftFiles.length * 10);
const integrityScore = disallowedReferences.length === 0 && applicationDriftFiles.length === 0 ? 100 : 80;

const report = {
  name: 'EA Governance Drift Report',
  branch: policy.branch,
  branchClassification: policy.classification,
  validationStatus: policy.validationEligible ? 'Allowed' : 'Blocked',
  deploymentEligible: policy.deploymentEligible,
  mode: policy.mode,
  productionReadiness: policy.productionReadiness,
  commit: currentCommit(),
  generatedAt: generatedAt(),
  changedFileCount: files.length,
  applicationDriftFiles,
  disallowedReferences,
  driftScore,
  integrityScore,
};

writeJson(path.join(reportDir, 'drift-report.json'), report);
console.log(policy.mode);
console.log(policySummary(policy));
console.log(`Drift report generated: driftScore=${driftScore}, integrityScore=${integrityScore}`);
