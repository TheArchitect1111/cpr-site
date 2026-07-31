import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

const [client, api, provider, catalog, presets, athlete, parent, env, adminPage, adminClient, adminApi] = await Promise.all([
  read('app/portal/components/SharedCalendar.tsx'),
  read('app/api/portal/calendar/route.ts'),
  read('lib/nylas-calendar.ts'),
  read('lib/portal-hub-modules.ts'),
  read('lib/tenant-presets.ts'),
  read('app/portal/athlete/[slug]/calendar/page.tsx'),
  read('app/portal/parent/[slug]/calendar/page.tsx'),
  read('.env.example'),
  read('app/admin/calendar/page.tsx'),
  read('app/admin/calendar/AdminSharedCalendar.tsx'),
  read('app/api/admin/calendar/route.ts'),
]);

assert.match(client, /@fullcalendar\/react/);
assert.match(client, /dayGridMonth/);
assert.match(client, /timeGridWeek/);
assert.match(api, /verifySession/);
assert.match(api, /maximumWindowMs/);
assert.match(provider, /Authorization: `Bearer \$\{apiKey\}`/);
assert.match(provider, /cache: 'no-store'/);
assert.match(provider, /NYLAS_GRANT_ID/);
assert.match(catalog, /path: '\/calendar'/);
assert.match(presets, /'family-calendar'/);
assert.match(athlete, /<SharedCalendar \/>/);
assert.match(parent, /<SharedCalendar \/>/);
assert.match(env, /NYLAS_API_KEY=/);
assert.match(adminPage, /<AdminSharedCalendar \/>/);
assert.match(adminClient, /Save event/);
assert.match(adminClient, /Delete/);
assert.match(adminApi, /verifyAdminSession/);
assert.match(adminApi, /createNylasCalendarEvent/);
assert.match(adminApi, /updateNylasCalendarEvent/);
assert.match(adminApi, /deleteNylasCalendarEvent/);

console.log('Nylas + FullCalendar shared calendar contract ok');
