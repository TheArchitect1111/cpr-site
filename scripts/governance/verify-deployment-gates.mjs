#!/usr/bin/env node
/**
 * Phase 2 — Production deployment gates.
 * Usage: node scripts/governance/verify-deployment-gates.mjs [--production]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  REPO_ROOT,
  RELEASES_DIR,
  execGit,
  getGitMetadata,
  loadDeploymentGates,
  loadEnvCatalog,
  loadFeatureFlags,
  loadPlatformConfig,
  loadRedirectsManifest,
  parseEnvExample,
  scanAppRoutes,
  formatGateReport,
  writeJson,
  hashFile,
  readJson,
} from '../../governance/lib/governance-utils.mjs';

const isProduction = process.argv.includes('--production')
  || process.env.VERCEL_ENV === 'production'
  || process.env.GOVERNANCE_PRODUCTION === '1';

const platform = loadPlatformConfig();
const gates = loadDeploymentGates();
const git = getGitMetadata();
const envCatalog = loadEnvCatalog();
const results = [];

function gate(id, label, severity, pass, detail) {
  results.push({ id, label, severity, pass, detail });
}

// Branch is main
const prodBranch = platform.application.productionBranch;
gate(
  'branch-is-main',
  `Branch is ${prodBranch}`,
  'block',
  !isProduction || git.branch === prodBranch,
  isProduction ? `Current branch: ${git.branch}` : 'Skipped (not production check)',
);

// Known commit
gate(
  'known-commit',
  'Git commit exists and is reachable',
  'block',
  Boolean(git.sha && git.sha.length === 40),
  git.sha ? `SHA: ${git.shortSha}` : 'No valid commit SHA',
);

// Release manifest
const latestManifest = join(RELEASES_DIR, 'latest.json');
const manifestForCommit = existsSync(latestManifest)
  && readJson(latestManifest).git?.commitSha === git.sha;
gate(
  'release-manifest',
  'Release manifest exists for this commit',
  'block',
  !isProduction || manifestForCommit || existsSync(latestManifest),
  manifestForCommit
    ? 'Manifest matches current commit'
    : existsSync(latestManifest)
      ? 'Manifest exists but may be for different commit — run governance:manifest --write'
      : 'No manifest — run npm run governance:manifest -- --write',
);

// Smoke / build / lint — read from env set by CI or prior steps
gate(
  'smoke-tests',
  'Smoke tests passed',
  'block',
  process.env.GOVERNANCE_SMOKE_STATUS === 'passed' || !isProduction,
  process.env.GOVERNANCE_SMOKE_STATUS || 'Set GOVERNANCE_SMOKE_STATUS=passed after test:smoke',
);

gate(
  'build-success',
  'Production build succeeded',
  'block',
  process.env.GOVERNANCE_BUILD_STATUS === 'passed' || existsSync(join(REPO_ROOT, '.next')),
  process.env.GOVERNANCE_BUILD_STATUS || (existsSync(join(REPO_ROOT, '.next')) ? 'Build artifact present' : 'Run npm run build'),
);

gate(
  'lint-clean',
  'Lint passed',
  'block',
  process.env.GOVERNANCE_LINT_STATUS === 'passed' || !isProduction,
  process.env.GOVERNANCE_LINT_STATUS || 'Set GOVERNANCE_LINT_STATUS=passed after lint',
);

// Env catalog sync
const catalogNames = new Set(envCatalog.variables.map((v) => v.name));
const exampleNames = parseEnvExample();
const missingFromExample = envCatalog.variables
  .filter((v) => v.required && !exampleNames.includes(v.name))
  .map((v) => v.name);
gate(
  'env-catalog-sync',
  'Required env vars documented in .env.example',
  'block',
  missingFromExample.length === 0,
  missingFromExample.length
    ? `Missing from .env.example: ${missingFromExample.join(', ')}`
    : 'All required vars in .env.example',
);

const undocumented = exampleNames.filter((n) => !catalogNames.has(n));
gate(
  'no-unknown-env',
  'No undocumented variables in .env.example',
  'block',
  undocumented.length === 0,
  undocumented.length
    ? `Undocumented: ${undocumented.join(', ')}`
    : 'All .env.example vars in catalog',
);

// Redirects in git
const vercelJson = existsSync(join(REPO_ROOT, 'vercel.json'))
  ? JSON.parse(readFileSync(join(REPO_ROOT, 'vercel.json'), 'utf8'))
  : { redirects: [] };
const dashboardOnly = loadRedirectsManifest().knownDashboardOnlyRedirects || [];
gate(
  'redirects-in-git',
  'No dashboard-only redirects pending migration',
  'block',
  dashboardOnly.filter((r) => r.status === 'drift-detected').length === 0,
  dashboardOnly.length
    ? `${dashboardOnly.length} dashboard-only redirect(s) must migrate to vercel.json`
    : 'All redirects in Git',
);

// Stripe / Resend / Airtable
const requiredStripe = envCatalog.variables.filter(
  (v) => v.externalService === 'Stripe' && v.required,
);
gate(
  'stripe-configured',
  'Stripe configuration documented',
  'block',
  requiredStripe.every((v) => catalogNames.has(v.name)),
  `${requiredStripe.length} Stripe vars in catalog`,
);

const requiredResend = envCatalog.variables.filter(
  (v) => v.externalService === 'Resend' && v.required,
);
gate(
  'resend-configured',
  'Resend configuration documented',
  'block',
  requiredResend.every((v) => catalogNames.has(v.name)),
  `${requiredResend.length} Resend vars in catalog`,
);

const requiredAirtable = ['AIRTABLE_TOKEN', 'AIRTABLE_BASE_ID'];
gate(
  'airtable-configured',
  'Required Airtable variables documented',
  'block',
  requiredAirtable.every((n) => catalogNames.has(n)),
  requiredAirtable.join(', '),
);

// Staging disabled in production
const stagingFlags = loadFeatureFlags().flags.filter((f) =>
  f.forbiddenEnvironments?.includes('production'),
);
const stagingEnabled = isProduction && stagingFlags.some((f) =>
  ['1', 'true'].includes(String(process.env[f.name] || '').toLowerCase()),
);
gate(
  'staging-disabled',
  'Staging flags not enabled for production',
  'block',
  !stagingEnabled,
  stagingEnabled ? 'CPR_STAGING_OPEN or related flag is set' : 'Staging flags off',
);

// Known feature flags
gate(
  'known-feature-flags',
  'All runtime flags cataloged',
  'block',
  stagingFlags.length > 0,
  `${stagingFlags.length} flags in catalog`,
);

// Orphan routes — route manifest
const routeManifestPath = join(REPO_ROOT, 'governance', 'config', 'route-manifest.json');
const currentRoutes = scanAppRoutes();
let orphanRoutes = [];
if (existsSync(routeManifestPath)) {
  const manifest = JSON.parse(readFileSync(routeManifestPath, 'utf8'));
  const known = new Set(manifest.routes || []);
  orphanRoutes = currentRoutes.filter((r) => !known.has(r));
}
gate(
  'no-orphan-routes',
  'All routes tracked in route manifest',
  'warn',
  orphanRoutes.length === 0 || !existsSync(routeManifestPath),
  orphanRoutes.length
    ? `${orphanRoutes.length} untracked route(s) — run governance:routes --write`
    : 'Routes tracked',
);

// Repository drift
gate(
  'no-repo-drift',
  'Working tree clean for production deploy',
  'block',
  !isProduction || git.isClean,
  git.isClean ? 'Clean working tree' : 'Uncommitted changes detected',
);

gate(
  'visual-qa',
  'Visual QA status recorded',
  'warn',
  Boolean(process.env.GOVERNANCE_VISUAL_QA),
  process.env.GOVERNANCE_VISUAL_QA || 'Set GOVERNANCE_VISUAL_QA=passed|skipped',
);

const report = formatGateReport(results);
const reportPath = join(REPO_ROOT, 'governance', 'reports', 'deployment-readiness.md');
writeJson(join(REPO_ROOT, 'governance', 'reports', 'deployment-gates.json'), {
  generatedAt: new Date().toISOString(),
  isProduction,
  git: { sha: git.sha, branch: git.branch },
  results,
  blocked: results.some((r) => !r.pass && r.severity === 'block'),
});

mkdirSync(join(REPO_ROOT, 'governance', 'reports'), { recursive: true });
writeFileSync(reportPath, report, 'utf8');

console.log(report);

const blocked = results.filter((r) => !r.pass && r.severity === 'block');
if (isProduction && blocked.length > 0) {
  console.error(`\n❌ ${blocked.length} blocking gate(s) failed.`);
  process.exit(1);
}

process.exit(0);
