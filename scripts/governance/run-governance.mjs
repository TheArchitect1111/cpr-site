#!/usr/bin/env node
/**
 * Orchestrator — run full governance pipeline.
 * Usage: node scripts/governance/run-governance.mjs [--production] [--write]
 */
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2).filter((a) => a.startsWith('--')).join(' ');
const production = process.argv.includes('--production');

mkdirSync(join(__dirname, '..', '..', 'governance', 'reports'), { recursive: true });

const steps = [
  { name: 'Collect routes', cmd: `node scripts/governance/collect-route-manifest.mjs ${args.includes('--write') ? '--write' : ''}` },
  { name: 'Platform manifest', cmd: `node scripts/governance/generate-platform-manifest.mjs ${args.includes('--write') ? '--write' : ''}` },
  { name: 'Drift detection', cmd: `node scripts/governance/detect-drift.mjs ${args.includes('--write') ? '--write' : ''}` },
  { name: 'Deployment gates', cmd: `node scripts/governance/verify-deployment-gates.mjs ${production ? '--production' : ''}` },
  { name: 'Release manifest', cmd: `node scripts/governance/generate-release-manifest.mjs ${args.includes('--write') ? '--write' : ''}` },
];

console.log('EA Release Governance Pipeline\n');

for (const step of steps) {
  console.log(`▶ ${step.name}...`);
  try {
    execSync(step.cmd, { cwd: join(__dirname, '..', '..'), stdio: 'inherit' });
    console.log(`✓ ${step.name}\n`);
  } catch (err) {
    console.error(`✗ ${step.name} failed\n`);
    if (production) process.exit(1);
  }
}

console.log('Governance pipeline complete.');
