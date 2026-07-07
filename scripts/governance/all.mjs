import { execFileSync } from 'node:child_process';

for (const script of ['routes', 'platform', 'drift', 'manifest', 'gates']) {
  console.log(`\n> governance:${script}`);
  execFileSync('node', [`scripts/governance/${script}.mjs`], { stdio: 'inherit' });
}
