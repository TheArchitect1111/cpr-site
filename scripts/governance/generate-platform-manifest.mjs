#!/usr/bin/env node
/**
 * Phase 6 — Generate machine-readable Platform Manifest.
 * Usage: node scripts/governance/generate-platform-manifest.mjs [--write]
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  REPO_ROOT,
  getGitMetadata,
  getPackageVersions,
  loadEnvCatalog,
  loadExternalServices,
  loadFeatureFlags,
  loadPlatformConfig,
  loadRedirectsManifest,
  loadVersionBaseline,
  scanApiRoutes,
  scanAppRoutes,
  hashFile,
  writeJson,
  parseEnvExample,
} from '../../governance/lib/governance-utils.mjs';

const write = process.argv.includes('--write');
const platform = loadPlatformConfig();
const versions = loadVersionBaseline();
const pkg = getPackageVersions();
const git = getGitMetadata();

const manifest = {
  schemaVersion: '1.0.0',
  generatedAt: new Date().toISOString(),
  releaseVersion: `${platform.platformVersion}+${git.shortSha}`,
  platformVersion: platform.platformVersion,
  application: platform.application,
  git: {
    commitSha: git.sha,
    branch: git.branch,
  },
  modules: {
    list: platform.modules,
    authentication: {
      portal: ['magic-link', 'password-reset'],
      admin: ['magic-link', 'password', 'session-cookie'],
      middleware: 'middleware.ts',
      chassis: '@ea/portal-chassis/hmac',
    },
    routing: {
      pages: scanAppRoutes(),
      api: scanApiRoutes(),
      redirects: loadRedirectsManifest().redirects,
      middlewareMatcher: [
        '/admin', '/admin/:path*',
        '/portal/login', '/portal/athlete/:path*', '/portal/parent/:path*',
      ],
    },
    environment: {
      catalogVersion: loadEnvCatalog().catalogVersion,
      variableCount: loadEnvCatalog().variables.length,
      duplicates: loadEnvCatalog().duplicates,
      unused: loadEnvCatalog().unused,
    },
    featureFlags: loadFeatureFlags().flags,
    storage: {
      primary: 'Airtable',
      files: 'Vercel Blob',
      blobEnvVar: 'BLOB_READ_WRITE_TOKEN',
    },
    payments: {
      provider: 'Stripe',
      routes: ['/api/payments/checkout', '/api/webhooks/stripe'],
      configurationVersion: versions.stripeConfigurationVersion,
    },
    communications: {
      email: 'Resend',
      webhooks: ['Make.com'],
      routes: ['/api/ask-cpr', '/api/messages', '/api/webhooks/resend'],
    },
    ai: {
      ...(platform.modules.includes('orbie')
        ? {
            orbie: {
              version: versions.orbieVersion,
              path: platform.versions.orbiePath,
            },
          }
        : {}),
      openai: { status: 'unused', envVar: 'OPENAI_API_KEY' },
    },
    monitoring: {
      sentry: { envVar: 'NEXT_PUBLIC_SENTRY_DSN' },
      pulse: { envVars: ['EA_PULSE_INGEST_URL', 'EA_CAPTURE_API_KEY'] },
    },
    integrations: loadExternalServices().services.map((s) => ({
      id: s.id,
      name: s.name,
      failureImpact: s.failureImpact,
    })),
    deployment: {
      productionBranch: platform.application.productionBranch,
      vercelProject: platform.application.vercelProject,
      ciWorkflow: '.github/workflows/ci.yml',
      governanceWorkflow: '.github/workflows/release-governance.yml',
    },
  },
  versions: {
    ...pkg,
    portalVersion: versions.portalVersion,
    ...(versions.orbieVersion ? { orbieVersion: versions.orbieVersion } : {}),
    chassisVersion: pkg.chassis,
    environmentCatalogVersion: versions.environmentCatalogVersion,
    redirectVersion: versions.redirectVersion,
  },
  checksums: {
    vercelJson: hashFile(join(REPO_ROOT, 'vercel.json')),
    middleware: hashFile(join(REPO_ROOT, 'middleware.ts')),
    envCatalog: hashFile(join(REPO_ROOT, 'governance/config/env-catalog.json')),
    envExample: hashFile(join(REPO_ROOT, '.env.example')),
  },
};

const outputPath = join(REPO_ROOT, 'governance', 'config', 'platform.manifest.json');
console.log(JSON.stringify(manifest, null, 2));

if (write) {
  writeJson(outputPath, manifest);
  console.error('\nPlatform manifest written to governance/config/platform.manifest.json');
}
