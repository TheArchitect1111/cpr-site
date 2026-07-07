import { execFileSync } from 'node:child_process';
import { branchPolicy, policySummary } from './lib.mjs';

console.log('Running governance deployment verification gates...');
const policy = branchPolicy();
if (!policy.deploymentEligible) {
  throw new Error(`Deployment verification blocked: branch is not deployment eligible.\n${policySummary(policy)}`);
}

execFileSync('node', ['scripts/governance/gates.mjs'], { stdio: 'inherit' });
console.log('Deployment governance verification complete.');
