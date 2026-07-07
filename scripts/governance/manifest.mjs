import path from 'node:path';
import { branchPolicy, currentCommit, generatedAt, policySummary, readJson, reportDir, root, writeJson } from './lib.mjs';

const routeManifest = readJson(path.join(root, 'route-manifest.json'));
const platformManifest = readJson(path.join(root, 'platform.manifest.json'));
const driftReportPath = path.join(reportDir, 'drift-report.json');
const driftReport = readJson(driftReportPath);
const policy = branchPolicy();
if (!policy.validationEligible) {
  throw new Error(`Branch is not eligible for governance manifest validation.\n${policySummary(policy)}`);
}

const manifest = {
  baseline: 'EA Governance Baseline v1.0',
  branch: policy.branch,
  branchClassification: policy.classification,
  validationStatus: policy.validationEligible ? 'Allowed' : 'Blocked',
  deploymentEligible: policy.deploymentEligible,
  mode: policy.mode,
  productionReadiness: policy.productionReadiness,
  commit: currentCommit(),
  generatedAt: generatedAt(),
  routeCount: routeManifest.routeCount,
  integrityScore: driftReport.integrityScore,
  driftScore: driftReport.driftScore,
  platform: {
    package: platformManifest.package,
    governanceFileCount: platformManifest.governanceFiles.length,
    dependencyCount: platformManifest.dependencies.length,
  },
  reports: [
    'governance/reports/route-inventory.json',
    'governance/reports/platform.manifest.json',
    'governance/reports/drift-report.json'
  ]
};

writeJson(path.join(root, 'docs', 'releases', 'latest.json'), manifest);
writeJson(path.join(reportDir, 'latest.json'), manifest);
console.log(policy.mode);
console.log(policySummary(policy));
console.log(`Release manifest generated: routeCount=${manifest.routeCount}, driftScore=${manifest.driftScore}, integrityScore=${manifest.integrityScore}`);
