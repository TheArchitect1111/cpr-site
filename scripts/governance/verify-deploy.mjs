#!/usr/bin/env node
/**
 * Full deploy verification — lint, build, smoke, governance pipeline.
 * Sets governance status env vars for gate checks.
 */
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

process.env.GOVERNANCE_LINT_STATUS = 'pending';
process.env.GOVERNANCE_BUILD_STATUS = 'pending';
process.env.GOVERNANCE_SMOKE_STATUS = 'pending';

function run(cmd, label) {
  console.log(`\n▶ ${label}...`);
  execSync(cmd, { cwd: root, stdio: 'inherit', env: process.env });
  console.log(`✓ ${label}`);
}

try {
  run('npm run lint', 'Lint');
  process.env.GOVERNANCE_LINT_STATUS = 'passed';

  run('npm run build', 'Build');
  process.env.GOVERNANCE_BUILD_STATUS = 'passed';

  run('npm run test:smoke', 'Smoke tests');
  process.env.GOVERNANCE_SMOKE_STATUS = 'passed';

  mkdirSync(join(root, 'governance', 'reports'), { recursive: true });
  writeFileSync(
    join(root, 'governance', 'reports', 'smoke-results.json'),
    JSON.stringify({ status: 'passed', timestamp: new Date().toISOString() }, null, 2),
  );

  run('node scripts/governance/run-governance.mjs --write', 'Governance pipeline');
  console.log('\n✅ verify:deploy complete');
} catch (err) {
  console.error('\n❌ verify:deploy failed');
  process.exit(1);
}
