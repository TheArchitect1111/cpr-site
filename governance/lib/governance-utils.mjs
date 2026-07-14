/**
 * EA Release Governance — shared utilities
 * Reusable across CPR, Simplifi, and all EA platform applications.
 */
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = join(__dirname, '..', '..');
export const GOVERNANCE_ROOT = join(REPO_ROOT, 'governance');
export const CONFIG_DIR = join(GOVERNANCE_ROOT, 'config');
export const RELEASES_DIR = join(REPO_ROOT, 'docs', 'releases');

export function readJson(path) {
  let content = readFileSync(path, 'utf8');
  if (content.charCodeAt(0) === 0xfeff) content = content.slice(1);
  return JSON.parse(content);
}

export function governanceGitRef() {
  return process.env.GOVERNANCE_GIT_REF?.trim() || null;
}

export function readJsonFromGit(ref, filePath) {
  try {
    const raw = execSync(`git show ${ref}:${filePath}`, {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

export function hashFile(path) {
  if (!existsSync(path)) return null;
  return sha256(readFileSync(path, 'utf8'));
}

export function execGit(args, fallback = '') {
  try {
    return execSync(`git ${args}`, {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return fallback;
  }
}

export function loadPlatformConfig() {
  return readJson(join(CONFIG_DIR, 'platform.json'));
}

export function loadEnvCatalog() {
  return readJson(join(CONFIG_DIR, 'env-catalog.json'));
}

export function loadVersionBaseline() {
  return readJson(join(CONFIG_DIR, 'version-baseline.json'));
}

export function loadExternalServices() {
  return readJson(join(CONFIG_DIR, 'external-services.json'));
}

export function loadFeatureFlags() {
  return readJson(join(CONFIG_DIR, 'feature-flags.json'));
}

export function loadDeploymentGates() {
  return readJson(join(CONFIG_DIR, 'deployment-gates.json'));
}

export function loadRedirectsManifest() {
  return readJson(join(CONFIG_DIR, 'redirects.manifest.json'));
}

export function getPackageVersions() {
  const ref = governanceGitRef();
  const pkg = ref
    ? readJsonFromGit(ref, 'package.json')
    : readJson(join(REPO_ROOT, 'package.json'));
  const lock = ref
    ? readJsonFromGit(ref, 'package-lock.json')
    : existsSync(join(REPO_ROOT, 'package-lock.json'))
      ? readJson(join(REPO_ROOT, 'package-lock.json'))
      : null;

  const resolveVersion = (name) => {
    if (lock?.packages?.[`node_modules/${name}`]?.version) {
      return lock.packages[`node_modules/${name}`].version;
    }
    return pkg?.dependencies?.[name]?.replace(/^\^/, '') ?? null;
  };

  let chassisVersion = null;
  if (ref) {
    const chassisPkg = readJsonFromGit(ref, 'vendor/portal-chassis/package.json');
    chassisVersion = chassisPkg?.version ?? null;
  } else {
    const chassisPath = join(REPO_ROOT, 'vendor', 'portal-chassis', 'package.json');
    if (existsSync(chassisPath)) {
      chassisVersion = readJson(chassisPath).version;
    }
  }

  return {
    application: pkg.version,
    next: resolveVersion('next'),
    react: resolveVersion('react'),
    node: process.version,
    chassis: chassisVersion,
    stripe: resolveVersion('stripe'),
    sentry: resolveVersion('@sentry/nextjs'),
  };
}

export function getGitMetadata() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA
    || process.env.GITHUB_SHA
    || execGit('rev-parse HEAD');
  const branch = process.env.VERCEL_GIT_COMMIT_REF
    || process.env.GITHUB_REF_NAME
    || execGit('rev-parse --abbrev-ref HEAD');
  const shortSha = sha ? sha.slice(0, 7) : 'unknown';
  const message = execGit(`log -1 --format=%s ${sha}`) || '';
  const author = execGit(`log -1 --format=%an ${sha}`) || '';
  const timestamp = execGit(`log -1 --format=%cI ${sha}`) || new Date().toISOString();
  const isClean = execGit('status --porcelain') === '';

  return { sha, shortSha, branch, message, author, timestamp, isClean };
}

export function parseEnvExample() {
  const path = join(REPO_ROOT, '.env.example');
  if (!existsSync(path)) return [];
  const names = [];
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const match = line.match(/^([A-Z][A-Z0-9_]*)=/);
    if (match) names.push(match[1]);
  }
  return names;
}

function gitTreePaths(ref, prefix) {
  const output = execGit(`ls-tree -r --name-only ${ref} ${prefix}`);
  return output ? output.split('\n').filter(Boolean) : [];
}

function routeFromAppPath(filePath) {
  const relativePath = filePath.replace(/^app/, '').replace(/\/page\.(tsx|ts)$/, '') || '/';
  return relativePath.replace(/\/\[[^\]]+\]/g, '/[param]') || '/';
}

function routeFromApiPath(filePath) {
  return filePath.replace(/^app/, '').replace(/\/route\.ts$/, '');
}

export function scanAppRoutes() {
  const ref = governanceGitRef();
  if (ref) {
    const pages = gitTreePaths(ref, 'app')
      .filter((p) => /\/page\.(tsx|ts)$/.test(p))
      .map(routeFromAppPath);
    return [...new Set(pages)].sort();
  }

  const appDir = join(REPO_ROOT, 'app');
  const routes = [];

  function walk(dir, prefix = '') {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        if (entry.startsWith('(') || entry.startsWith('_')) continue;
        if (entry.startsWith('[') && entry.endsWith(']')) {
          walk(full, `${prefix}/[param]`);
        } else {
          walk(full, `${prefix}/${entry}`);
        }
      } else if (entry === 'page.tsx' || entry === 'page.ts') {
        routes.push(prefix || '/');
      }
    }
  }

  walk(appDir);
  return [...new Set(routes)].sort();
}

export function scanApiRoutes() {
  const ref = governanceGitRef();
  if (ref) {
    const apis = gitTreePaths(ref, 'app/api')
      .filter((p) => p.endsWith('/route.ts'))
      .map(routeFromApiPath);
    return apis.sort();
  }

  const apiDir = join(REPO_ROOT, 'app', 'api');
  const routes = [];

  function walk(dir, prefix = '/api') {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        const segment = entry.startsWith('[') ? `[${entry.slice(1, -1)}]` : entry;
        walk(full, `${prefix}/${segment}`);
      } else if (entry === 'route.ts') {
        routes.push(prefix);
      }
    }
  }

  walk(apiDir);
  return routes.sort();
}

export function incrementBuildNumber() {
  const counterPath = join(CONFIG_DIR, 'build-counter.json');
  let counter = { buildNumber: 0 };
  if (existsSync(counterPath)) {
    counter = readJson(counterPath);
  }
  counter.buildNumber = (counter.buildNumber || 0) + 1;
  counter.lastBuildAt = new Date().toISOString();
  writeJson(counterPath, counter);
  return counter.buildNumber;
}

export function formatGateReport(results) {
  const lines = ['# Deployment Readiness Report', '', `Generated: ${new Date().toISOString()}`, ''];
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass && r.severity === 'block');
  const warnings = results.filter((r) => !r.pass && r.severity === 'warn');

  lines.push(`**Status:** ${failed.length === 0 ? '✅ READY' : '❌ BLOCKED'}`, '');
  lines.push(`| Passed | Failed | Warnings |`);
  lines.push(`|--------|--------|----------|`);
  lines.push(`| ${passed} | ${failed.length} | ${warnings.length} |`, '');

  lines.push('## Gate Results', '');
  for (const r of results) {
    const icon = r.pass ? '✅' : r.severity === 'block' ? '❌' : '⚠️';
    lines.push(`${icon} **${r.label}** — ${r.detail || (r.pass ? 'Pass' : 'Fail')}`);
  }

  return lines.join('\n');
}

export function computeIntegrityScore(checks) {
  const weights = { pass: 1, warn: 0.5, fail: 0 };
  const total = checks.length || 1;
  const score = checks.reduce((sum, c) => sum + weights[c.status], 0) / total;
  return Math.round(score * 100);
}

export function rel(path) {
  return relative(REPO_ROOT, path).replace(/\\/g, '/');
}
