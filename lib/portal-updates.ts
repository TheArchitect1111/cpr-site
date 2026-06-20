import { getOpportunities, type Opportunity } from '@/lib/portal-data';
import { getMessagesBySlug } from '@/lib/sections-data';

const BASE = 'appvVr6MVrJvEY0YJ';
const ATHLETES = 'tblZwrZHi3WBR3NHZ';
const ACTIVITY_PREFIX = '[CPR_ACTIVITY]';

export type PortalUpdate = {
  id: string;
  date: string;
  title: string;
  body: string;
  category: 'recruiting' | 'onboarding' | 'message' | 'opportunity' | 'system';
};

type AirtableRecord = { id: string; fields: Record<string, unknown> };

function parseActivityLines(notes: string): PortalUpdate[] {
  return notes
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith(ACTIVITY_PREFIX))
    .map((line, index) => {
      const rest = line.slice(ACTIVITY_PREFIX.length).trim();
      const space = rest.indexOf(' ');
      const iso = space > 0 ? rest.slice(0, space) : rest;
      const message = space > 0 ? rest.slice(space + 1).trim() : 'Activity update';
      return {
        id: `activity-${index}-${iso}`,
        date: iso,
        title: 'CPR Team Update',
        body: message,
        category: 'system' as const,
      };
    });
}

function opportunityUpdates(opportunities: Opportunity[]): PortalUpdate[] {
  return opportunities.map((opp) => ({
    id: `opp-${opp.id}`,
    date: opp.lastContactDate || new Date().toISOString().slice(0, 10),
    title: opp.schoolName || 'School interest update',
    body: [
      opp.coachName ? `Coach ${opp.coachName}` : '',
      opp.status ? `Status: ${opp.status}` : '',
      opp.followUpDate ? `Follow-up: ${opp.followUpDate}` : '',
    ]
      .filter(Boolean)
      .join(' · '),
    category: 'opportunity' as const,
  }));
}

function messageUpdates(
  messages: Awaited<ReturnType<typeof getMessagesBySlug>>['messages']
): PortalUpdate[] {
  return messages
    .filter((m) => m.sender === 'Coach Mike' || m.sender === 'CPR Team')
    .map((m) => ({
      id: `msg-${m.id}`,
      date: m.dateSent,
      title: `Message from ${m.sender}`,
      body: m.messageBody,
      category: 'message' as const,
    }));
}

const SAMPLE_UPDATES: PortalUpdate[] = [
  {
    id: 'sample-1',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    title: 'Profile sent to coaches',
    body: 'Your recruiting profile was shared with three NCAA Division II programs.',
    category: 'recruiting',
  },
  {
    id: 'sample-2',
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    title: 'Highlight video reviewed',
    body: 'Coach Mike reviewed your film and added notes to your recruiting file.',
    category: 'onboarding',
  },
  {
    id: 'sample-3',
    date: new Date(Date.now() - 8 * 86400000).toISOString(),
    title: 'University of Toronto',
    body: 'Coach Williams · Status: Responded · Follow-up scheduled',
    category: 'opportunity',
  },
];

export async function getPortalUpdates(slug: string): Promise<{ updates: PortalUpdate[]; live: boolean }> {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) {
    return { updates: slug === 'jayden-thompson' ? SAMPLE_UPDATES : [], live: false };
  }

  const safe = slug.replace(/[^a-z0-9-]/g, '');
  const url = `https://api.airtable.com/v0/${BASE}/${ATHLETES}?maxRecords=1&filterByFormula=${encodeURIComponent(`{Slug}='${safe}'`)}&fields[]=Notes&fields[]=Slug`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (!res.ok) return { updates: [], live: true };

  const data = (await res.json()) as { records: AirtableRecord[] };
  const record = data.records?.[0];
  if (!record) return { updates: [], live: true };

  const notes = String(record.fields.Notes ?? '');
  const [opportunities, { messages }] = await Promise.all([
    getOpportunities(record.id),
    getMessagesBySlug(slug),
  ]);

  const updates = [
    ...parseActivityLines(notes),
    ...opportunityUpdates(opportunities),
    ...messageUpdates(messages),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { updates, live: true };
}
