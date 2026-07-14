#!/usr/bin/env node
/**
 * Phase 1 — Generate Release Manifest for every production deployment.
 * Usage: node scripts/governance/generate-release-manifest.mjs [--write]
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  RELEASES_DIR,
  REPO_ROOT,
  getGitMetadata,
  getPackageVersions,
  loadEnvCatalog,
  loadExternalServices,
  loadFeatureFlags,
  loadPlatformConfig,
  loadRedirectsManifest,
  loadVersionBaseline,
  incrementBuildNumber,
  parseEnvExample,
  scanApiRoutes,
  scanAppRoutes,
  writeJson,
  hashFile,
  execGit,
} from '../../governance/lib/governance-utils.mjs';

const write = process.argv.includes('--write');
const platform = loadPlatformConfig();
const versions = loadVersionBaseline();
const pkg = getPackageVersions();
const git = getGitMetadata();
const buildNumber = incrementBuildNumber();

const releaseVersion = `${platform.platformVersion}+${git.shortSha}.${buildNumber}`;
const vercelDeploymentId = process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_URL || null;

const smokeResultsPath = join(REPO_ROOT, 'governance', 'reports', 'smoke-results.json');
const smokeResults = existsSync(smokeResultsPath)
  ? JSON.parse(readFileSync(smokeResultsPath, 'utf8'))
  : { status: 'not-run', note: 'Run npm run test:smoke before manifest generation in CI' };

const manifest = {
  schemaVersion: '1.0.0',
  releaseVersion,
  git: {
    commitSha: git.sha,
    shortSha: git.shortSha,
    branch: git.branch,
    commitMessage: git.message,
    author: git.author,
    commitTimestamp: git.timestamp,
    workingTreeClean: git.isClean,
  },
  deployment: {
    vercelDeploymentId,
    vercelEnvironment: process.env.VERCEL_ENV || 'local',
    buildTimestamp: new Date().toISOString(),
    buildNumber,
    buildStatus: process.env.GOVERNANCE_BUILD_STATUS || 'unknown',
    deploymentApproval: process.env.GOVERNANCE_DEPLOY_APPROVAL || 'pending',
    rollbackVersion: process.env.GOVERNANCE_ROLLBACK_VERSION || null,
  },
  platform: {
    application: platform.application.id,
    applicationName: platform.application.name,
    platformVersion: platform.platformVersion,
    productionUrl: platform.application.productionUrl,
  },
  runtime: {
    nodeVersion: pkg.node,
    nextVersion: pkg.next,
    reactVersion: pkg.react,
  },
  components: {
    chassisVersion: pkg.chassis,
    portalVersion: versions.portalVersion,
    ...(versions.orbieVersion ? { orbieVersion: versions.orbieVersion } : {}),
    applicationVersion: pkg.application,
  },
  configurationVersions: {
    environmentCatalogVersion: versions.environmentCatalogVersion,
    redirectVersion: versions.redirectVersion,
    airtableSchemaVersion: versions.airtableSchemaVersion,
    stripeConfigurationVersion: versions.stripeConfigurationVersion,
    resendConfigurationVersion: versions.resendConfigurationVersion,
    blobStorageVersion: versions.blobStorageVersion,
    externalIntegrationsVersion: versions.externalIntegrationsVersion,
  },
  featureFlagSnapshot: loadFeatureFlags().flags.map((f) => ({
    name: f.name,
    allowedEnvironments: f.allowedEnvironments,
    productionEnabled: ['1', 'true'].includes(
      String(process.env[f.name] || '').toLowerCase(),
    ),
  })),
  externalIntegrations: loadExternalServices().services.map((s) => ({
    id: s.id,
    name: s.name,
    failureImpact: s.failureImpact,
  })),
  routes: {
    pages: scanAppRoutes(),
    api: scanApiRoutes(),
    pageCount: scanAppRoutes().length,
    apiCount: scanApiRoutes().length,
  },
  checksums: {
    vercelJson: hashFile(join(REPO_ROOT, 'vercel.json')),
    envExample: hashFile(join(REPO_ROOT, '.env.example')),
    middleware: hashFile(join(REPO_ROOT, 'middleware.ts')),
    envCatalog: hashFile(join(REPO_ROOT, 'governance/config/env-catalog.json')),
  },
  envCatalog: {
    version: loadEnvCatalog().catalogVersion,
    documentedVariables: loadEnvCatalog().variables.length,
    exampleVariables: parseEnvExample().length,
  },
  redirects: {
    version: loadRedirectsManifest().redirectVersion,
    gitRedirects: loadRedirectsManifest().redirects.length,
    dashboardOnlyCount: loadRedirectsManifest().knownDashboardOnlyRedirects?.length || 0,
  },
  quality: {
    smokeTestResults: smokeResults,
    visualQaStatus: process.env.GOVERNANCE_VISUAL_QA || 'not-run',
    lintStatus: process.env.GOVERNANCE_LINT_STATUS || 'unknown',
  },
  releaseNotes: process.env.GOVERNANCE_RELEASE_NOTES || git.message,
};

const filename = `RELEASE-${git.shortSha}-${new Date().toISOString().slice(0, 10)}.json`;
const outputPath = join(RELEASES_DIR, filename);
const latestPath = join(RELEASES_DIR, 'latest.json');

console.log(JSON.stringify(manifest, null, 2));

if (write) {
  writeJson(outputPath, manifest);
  writeJson(latestPath, manifest);
  console.error(`\nRelease manifest written to docs/releases/${filename}`);
  console.error(`Latest manifest: docs/releases/latest.json`);
}

process.exit(0);
