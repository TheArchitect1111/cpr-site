import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const pages = [
  ['athlete', 'resource-library', 'resources'],
  ['athlete', 'video-learning-center', 'resources'],
  ['athlete', 'recruiting-timeline', 'resources'],
  ['athlete', 'eligibility-center', 'resources'],
  ['athlete', 'scholarship-center', 'resources'],
  ['athlete', 'ask-cpr', 'messages'],
  ['athlete', 'messaging-center', 'messages'],
  ['athlete', 'document-vault', 'home'],
  ['athlete', 'upcoming-events', 'home'],
  ['parent', 'resource-library', 'resources'],
  ['parent', 'video-learning-center', 'resources'],
  ['parent', 'recruiting-timeline', 'resources'],
  ['parent', 'eligibility-center', 'resources'],
  ['parent', 'scholarship-center', 'resources'],
  ['parent', 'ask-cpr', 'messages'],
  ['parent', 'messaging-center', 'messages'],
  ['parent', 'document-vault', 'home'],
  ['parent', 'upcoming-events', 'home'],
];

for (const [portalType, section, active] of pages) {
  const file = path.join(root, 'app/portal', portalType, '[slug]', section, 'page.tsx');
  let src = fs.readFileSync(file, 'utf8');

  src = src.replace(/import \{ site \} from '@\/config\/site';\n/, '');
  src = src.replace(
    /import { notFound } from 'next\/navigation';/,
    "import { notFound } from 'next/navigation';\nimport PortalSubpageLayout from '@/app/portal/components/PortalSubpageLayout';",
  );

  src = src.replace(
    /return \(\s*<div className="portal-page">[\s\S]*?<main className="portal-main res-main">\s*<a href=\{`\/portal\/(?:athlete|parent)\/\$\{slug\}`\} className="res-back">\s*&#8592; Back to Dashboard\s*<\/a>\s*/,
    `return (\n    <PortalSubpageLayout portalType="${portalType}" slug={slug} active="${active}">\n      `,
  );

  src = src.replace(
    /\s*<\/main>\s*<footer className="portal-footer">[\s\S]*?<\/footer>\s*<\/div>\s*\);\s*\}/,
    '\n    </PortalSubpageLayout>\n  );\n}',
  );

  fs.writeFileSync(file, src);
  console.log('patched', file);
}
