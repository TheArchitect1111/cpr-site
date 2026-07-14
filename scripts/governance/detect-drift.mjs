#!/usr/bin/env node
/**
 * Phase 7 — Drift detection across Git, Vercel config, env, routes.
 * Usage: node scripts/governance/detect-drift.mjs [--write]
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  REPO_ROOT,
  RELEASES_DIR,
  execGit,
  getGitMetadata,
  loadEnvCatalog,
  loadPlatformConfig,
  loadRedirectsManifest,
  parseEnvExample,
  scanAppRoutes,
  scanApiRoutes,
  hashFile,
  computeIntegrityScore,
  writeJson,
  readJson,
} from '../../governance/lib/governance-utils.mjs';

const write = process.argv.includes('--write');
const git = getGitMetadata();
const envCatalog = loadEnvCatalog();
const checks = [];

function check(category, name, status, detail, expected = null, actual = null) {
  checks.push({ category, name, status, detail, expected, actual });
}

// Repository drift
check(
  'repository',
  'Working tree clean',
  git.isClean ? 'pass' : 'fail',
  git.isClean ? 'No uncommitted changes' : 'Uncommitted changes present',
);

const prodBranch = loadPlatformConfig().application.productionBranch;
check(
  'repository',
  'On production branch',
  git.branch === prodBranch ? 'pass' : 'warn',
  `Branch: ${git.branch} (expected ${prodBranch})`,
);

// Deployment drift — compare latest manifest SHA to HEAD
const latestManifestPath = join(RELEASES_DIR, 'latest.json');
if (existsSync(latestManifestPath)) {
  const latest = readJson(latestManifestPath);
  const match = latest.git?.commitSha === git.sha;
  check(
    'deployment',
    'Manifest matches HEAD',
    match ? 'pass' : 'fail',
    match ? 'latest.json matches current commit' : `Manifest SHA ${latest.git?.shortSha} ≠ HEAD ${git.shortSha}`,
    git.sha,
    latest.git?.commitSha,
  );
} else {
  check('deployment', 'Release manifest exists', 'fail', 'No docs/releases/latest.json');
}

// Configuration drift — .env.example vs catalog
const catalogNames = new Set(envCatalog.variables.map((v) => v.name));
const exampleNames = parseEnvExample();
for (const name of exampleNames) {
  if (!catalogNames.has(name)) {
    check('configuration', `Env var ${name}`, 'fail', 'In .env.example but not in env catalog');
  }
}
for (const v of envCatalog.variables.filter((x) => x.status === 'undocumented-in-example' || envCatalog.undocumentedInExample?.includes(x.name))) {
  check('configuration', `Env var ${v.name}`, 'warn', 'In catalog/Vercel but missing from .env.example');
}

// Duplicate env vars
for (const dup of envCatalog.duplicates || []) {
  check('configuration', `Duplicate env: ${dup.names.join('/')}`, 'warn', `Canonical: ${dup.canonical}`);
}

// Unused env vars
for (const name of envCatalog.unused || []) {
  check('configuration', `Unused env: ${name}`, 'warn', 'Present in Vercel, not referenced in code');
}

// Redirect drift
const vercelRedirects = existsSync(join(REPO_ROOT, 'vercel.json'))
  ? readJson(join(REPO_ROOT, 'vercel.json')).redirects || []
  : [];
const manifestRedirects = loadRedirectsManifest().redirects || [];
check(
  'infrastructure',
  'vercel.json redirect count',
  vercelRedirects.length >= manifestRedirects.length ? 'pass' : 'warn',
  `Git: ${vercelRedirects.length}, manifest: ${manifestRedirects.length}`,
);

for (const r of loadRedirectsManifest().knownDashboardOnlyRedirects || []) {
  if (r.status === 'drift-detected') {
    check(
      'infrastructure',
      `Dashboard redirect ${r.source}`,
      'fail',
      `Must migrate to vercel.json → ${r.destination}`,
    );
  }
}

// Route drift
const routes = scanAppRoutes();
const routeManifestPath = join(REPO_ROOT, 'governance', 'config', 'route-manifest.json');
if (existsSync(routeManifestPath)) {
  const known = new Set(readJson(routeManifestPath).routes || []);
  const orphans = routes.filter((r) => !known.has(r));
  check(
    'infrastructure',
    'Route manifest sync',
    orphans.length === 0 ? 'pass' : 'warn',
    orphans.length ? `${orphans.length} route(s) not in manifest: ${orphans.slice(0, 5).join(', ')}` : 'All routes tracked',
  );
} else {
  check('infrastructure', 'Route manifest', 'warn', 'Run governance:routes --write to create baseline');
}

// Middleware checksum vs last manifest
if (existsSync(latestManifestPath)) {
  const latest = readJson(latestManifestPath);
  const currentMiddleware = hashFile(join(REPO_ROOT, 'middleware.ts'));
  check(
    'runtime',
    'Middleware unchanged since last manifest',
    latest.checksums?.middleware === currentMiddleware ? 'pass' : 'warn',
    latest.checksums?.middleware === currentMiddleware ? 'Match' : 'Middleware hash changed',
  );
}

// Feature flag drift — staging on production
const stagingVars = ['CPR_STAGING_OPEN', 'NEXT_PUBLIC_CPR_STAGING_OPEN', 'DEMO_MODE'];
for (const name of stagingVars) {
  const val = process.env[name];
  if (val && ['1', 'true'].includes(String(val).toLowerCase())) {
    check('runtime', `${name} enabled`, 'fail', 'Forbidden flag active in current environment');
  }
}

// External integration documentation
const undocumentedServices = envCatalog.unused?.length || 0;
check(
  'configuration',
  'External service registry complete',
  undocumentedServices === 0 ? 'pass' : 'warn',
  `${envCatalog.variables.length} vars cataloged; ${envCatalog.unused?.length || 0} unused`,
);

const integrityScore = computeIntegrityScore(checks);
const report = {
  generatedAt: new Date().toISOString(),
  git: { sha: git.sha, branch: git.branch, shortSha: git.shortSha },
  integrityScore,
  summary: {
    pass: checks.filter((c) => c.status === 'pass').length,
    warn: checks.filter((c) => c.status === 'warn').length,
    fail: checks.filter((c) => c.status === 'fail').length,
  },
  reports: {
    configurationDrift: checks.filter((c) => c.category === 'configuration'),
    infrastructureDrift: checks.filter((c) => c.category === 'infrastructure'),
    repositoryDrift: checks.filter((c) => c.category === 'repository'),
    deploymentDrift: checks.filter((c) => c.category === 'deployment'),
    runtimeDrift: checks.filter((c) => c.category === 'runtime'),
  },
  checks,
  alert: checks.some((c) => c.status === 'fail')
    ? 'Production may no longer match Git — review failed checks'
    : null,
};

console.log(JSON.stringify(report, null, 2));

if (write) {
  writeJson(join(REPO_ROOT, 'governance', 'reports', 'drift-report.json'), report);
  console.error(`\nIntegrity Score: ${integrityScore}/100`);
  if (report.alert) console.error(`⚠️  ${report.alert}`);
}

process.exit(checks.some((c) => c.status === 'fail') ? 1 : 0);
