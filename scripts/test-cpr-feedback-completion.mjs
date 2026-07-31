import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const site = read('config/site.ts');
const landing = read('config/landing.ts');
const resources = read('app/resources/page.tsx');
const experience = read('lib/cpr-experience-lab.ts');
const editor = read('app/admin/landing/AdminLandingEditor.tsx');
const galleryEditor = read('app/admin/landing/GallerySlidesEditor.tsx');
const portal = read('app/portal/components/PortalShell.tsx');
const css = read('app/landing.css');

assert.match(resources, /North America Fee Agreement/);
assert.doesNotMatch(resources, />Standard Application</);
assert.match(resources, /International Experience/);
assert.match(site, /canadian-prospects-international-gu\.vercel\.app/);
assert.match(landing, /chipsAndDrip/);
assert.match(landing, /NCAA|International Experience/);
assert.match(experience, /NCAA Pathways Built For Real Families/);
assert.match(experience, /North America Fee Agreement/);
assert.match(editor, /Hero introduction/);
assert.match(editor, /Coach Rav tribute photos/);
assert.match(editor, /Website menu/);
assert.match(editor, /Portal menu/);
assert.match(galleryEditor, /Photo focus/);
assert.match(portal, /hiddenPortalTabs/);
assert.match(css, /Quote text must stay white/);
assert.doesNotMatch(css, /background-size:\s*contain/);

console.log('CPR feedback completion contract: ok');
