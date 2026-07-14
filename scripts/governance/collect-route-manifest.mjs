#!/usr/bin/env node
/**
 * Collect app routes into route manifest for orphan detection.
 * Usage: node scripts/governance/collect-route-manifest.mjs [--write]
 */
import { join } from 'node:path';
import {
  REPO_ROOT,
  scanAppRoutes,
  scanApiRoutes,
  writeJson,
  getGitMetadata,
} from '../../governance/lib/governance-utils.mjs';

const write = process.argv.includes('--write');
const git = getGitMetadata();
const pages = scanAppRoutes();
const api = scanApiRoutes();

const manifest = {
  version: '1.0.0',
  generatedAt: new Date().toISOString(),
  gitSha: git.sha,
  routes: pages,
  apiRoutes: api,
  totalRoutes: pages.length + api.length,
};

console.log(JSON.stringify(manifest, null, 2));

if (write) {
  writeJson(join(REPO_ROOT, 'governance', 'config', 'route-manifest.json'), manifest);
  console.error(`\nRoute manifest: ${pages.length} pages, ${api.length} API routes`);
}
