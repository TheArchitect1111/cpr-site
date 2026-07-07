import path from 'node:path';
import {
  branchPolicy,
  currentCommit,
  ensureDir,
  generatedAt,
  policySummary,
  posix,
  reportDir,
  root,
  walk,
  writeJson,
} from './lib.mjs';

function routeFromFile(file) {
  const rel = posix(path.relative(path.join(root, 'app'), file));
  const parts = rel.split('/');
  const leaf = parts.at(-1);
  if (!['page.tsx', 'route.ts'].includes(leaf)) return null;
  const routeParts = parts.slice(0, -1).filter((part) => !part.startsWith('('));
  const route = `/${routeParts.join('/')}`.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  return {
    route,
    kind: leaf === 'route.ts' ? 'api' : 'page',
    file: posix(path.relative(root, file)),
    dynamic: route.includes('['),
  };
}

const files = walk(path.join(root, 'app'), (file) => /[\\\/](page\.tsx|route\.ts)$/.test(file));
const routes = files.map(routeFromFile).filter(Boolean).sort((a, b) => a.route.localeCompare(b.route) || a.kind.localeCompare(b.kind));
const policy = branchPolicy();
if (!policy.validationEligible) {
  throw new Error(`Branch is not eligible for governance route validation.\n${policySummary(policy)}`);
}

const manifest = {
  name: 'EA Route Manifest',
  branch: policy.branch,
  branchClassification: policy.classification,
  validationStatus: policy.validationEligible ? 'Allowed' : 'Blocked',
  deploymentEligible: policy.deploymentEligible,
  mode: policy.mode,
  productionReadiness: policy.productionReadiness,
  commit: currentCommit(),
  generatedAt: generatedAt(),
  routeCount: routes.length,
  routes,
};

writeJson(path.join(root, 'route-manifest.json'), manifest);
ensureDir(reportDir);
writeJson(path.join(reportDir, 'route-inventory.json'), manifest);
console.log(policy.mode);
console.log(policySummary(policy));
console.log(`Route inventory generated: ${routes.length} routes`);
