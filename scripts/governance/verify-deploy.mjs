import { execFileSync } from 'node:child_process';

console.log('Running governance deployment verification gates...');
execFileSync('node', ['scripts/governance/gates.mjs'], { stdio: 'inherit' });
console.log('Deployment governance verification complete.');
