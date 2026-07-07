import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export const root = process.cwd();
export const reportDir = path.join(root, 'governance', 'reports');

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function git(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

export function writeJson(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function walk(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, predicate));
    else if (predicate(full)) out.push(full);
  }
  return out.sort();
}

export function posix(file) {
  return file.split(path.sep).join('/');
}

export function currentBranch() {
  return git(['branch', '--show-current']);
}

export function currentCommit() {
  return git(['rev-parse', 'HEAD']);
}

export function originMainCommit() {
  return git(['rev-parse', 'origin/main']);
}

export function mergeBase(left, right) {
  return git(['merge-base', left, right]);
}

export function changedFiles() {
  const output = execFileSync('git', ['status', '--porcelain=v1', '-uall'], { cwd: root, encoding: 'utf8' });
  if (!output) return [];
  return output.split(/\r?\n/)
    .map((line) => {
      const match = line.match(/^.. (.+)$/);
      return (match?.[1] || line).replace(/^"|"$/g, '').trim();
    })
    .filter(Boolean);
}

export function generatedAt() {
  return new Date().toISOString();
}
