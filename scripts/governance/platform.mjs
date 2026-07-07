import path from 'node:path';
import { currentBranch, currentCommit, generatedAt, readJson, reportDir, root, walk, writeJson } from './lib.mjs';

const pkg = readJson(path.join(root, 'package.json'));
const docs = walk(path.join(root, 'docs'), (file) => file.endsWith('.md')).map((file) => path.relative(root, file).replaceAll(path.sep, '/'));
const governanceFiles = walk(path.join(root, 'governance')).map((file) => path.relative(root, file).replaceAll(path.sep, '/'));

const manifest = {
  name: 'EA Platform Governance Manifest',
  branch: currentBranch(),
  commit: currentCommit(),
  generatedAt: generatedAt(),
  package: {
    name: pkg.name,
    version: pkg.version,
    private: pkg.private === true,
  },
  scripts: Object.keys(pkg.scripts || {}).sort(),
  dependencies: Object.keys(pkg.dependencies || {}).sort(),
  devDependencies: Object.keys(pkg.devDependencies || {}).sort(),
  governanceFiles,
  docs,
};

writeJson(path.join(root, 'platform.manifest.json'), manifest);
writeJson(path.join(reportDir, 'platform.manifest.json'), manifest);
console.log(`Platform manifest generated: ${manifest.governanceFiles.length} governance files`);
