import path from 'node:path';
import { branchPolicy, currentCommit, generatedAt, policySummary, readJson, reportDir, root, walk, writeJson } from './lib.mjs';

const pkg = readJson(path.join(root, 'package.json'));
const docs = walk(path.join(root, 'docs'), (file) => file.endsWith('.md')).map((file) => path.relative(root, file).replaceAll(path.sep, '/'));
const governanceFiles = walk(path.join(root, 'governance')).map((file) => path.relative(root, file).replaceAll(path.sep, '/'));
const policy = branchPolicy();
if (!policy.validationEligible) {
  throw new Error(`Branch is not eligible for governance platform validation.\n${policySummary(policy)}`);
}

const manifest = {
  name: 'EA Platform Governance Manifest',
  branch: policy.branch,
  branchClassification: policy.classification,
  validationStatus: policy.validationEligible ? 'Allowed' : 'Blocked',
  deploymentEligible: policy.deploymentEligible,
  mode: policy.mode,
  productionReadiness: policy.productionReadiness,
  commit: currentCommit(),
  generatedAt: generatedAt(),
  package: {
    name: pkg.name,
    version: pkg.version,
    private: pkg.private === true,
  },
  scripts: Object.keys(pkg.scripts || {}).sort(),
  dependencies: Object.keys(pkg.dependencies || {}).sort(),
  devDependencies: Object.keys(pkg.devDependencies || {}).sort(),
  governanceFiles,
  docs,
};

writeJson(path.join(root, 'platform.manifest.json'), manifest);
writeJson(path.join(reportDir, 'platform.manifest.json'), manifest);
console.log(policy.mode);
console.log(policySummary(policy));
console.log(`Platform manifest generated: ${manifest.governanceFiles.length} governance files`);
