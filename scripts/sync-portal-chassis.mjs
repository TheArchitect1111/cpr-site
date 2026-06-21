#!/usr/bin/env node
/**
 * Sync built @ea/portal-chassis from ea-operating-system into cpr-site/vendor.
 * Source of truth: ../../ea-operating-system/portal-core
 */
import { cpSync, mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const cprRoot = resolve(here, '..');
const source = resolve(cprRoot, '../../ea-operating-system/portal-core');
const target = resolve(cprRoot, 'vendor/portal-chassis');

if (!existsSync(source)) {
  console.error('Chassis source not found:', source);
  process.exit(1);
}

console.log('Building chassis at', source);
const build = spawnSync('npm run build', { cwd: source, shell: true, stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status ?? 1);

if (existsSync(target)) rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });

for (const item of ['dist', 'styles', 'package.json', 'README.md']) {
  cpSync(join(source, item), join(target, item), { recursive: true });
}

const pkgPath = join(target, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
delete pkg.scripts?.prepare;
delete pkg.scripts?.prepublishOnly;
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

console.log('Synced @ea/portal-chassis to', target);
