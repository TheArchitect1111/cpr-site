/** CPR Content Requests — Airtable table with an Athletes.Notes fallback. */

export type ContentRequestStatus =
  | 'Pending Review'
  | 'In Progress'
  | 'Awaiting Approval'
  | 'Needs Additional Information'
  | 'Scheduled'
  | 'Published'
  | 'Completed';

export type ContentRequestRecord = {
  id: string;
  requestId: string;
  athleteSlug: string;
  athleteName?: string;
  requestType: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dateSubmitted?: string;
  datePublished?: string;
  publishedContent?: string;
  submittedBy?: string;
};

type AirtableRow = {
  id: string;
  createdTime?: string;
  fields: Record<string, unknown>;
};
type NotesRequest = ContentRequestRecord;

const BASE = process.env.AIRTABLE_BASE_ID || 'appvVr6MVrJvEY0YJ';
const TABLE = process.env.AIRTABLE_CONTENT_REQUESTS_TABLE_ID?.trim() || 'Content Requests';
const ATHLETES =
  process.env.AIRTABLE_ATHLETES_TABLE_ID?.trim() ||
  process.env.AIRTABLE_TABLE_ID?.trim() ||
  'tblZwrZHi3WBR3NHZ';
const NOTES_PREFIX = '[CPR_CONTENT_REQUEST]';

function token() {
  return process.env.AIRTABLE_TOKEN || process.env.AIRTABLE_API_KEY || '';
}

function headers() {
  return { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' };
}

function airtableUrl(table: string, id?: string) {
  const base = `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}`;
  return id ? `${base}/${id}` : base;
}

function text(fields: Record<string, unknown>, key: string): string {
  const value = fields[key];
  return value === undefined || value === null ? '' : String(value);
}

function mapRecord(row: AirtableRow): ContentRequestRecord {
  const f = row.fields;
  return {
    id: row.id,
    requestId: text(f, 'Request ID') || row.id,
    athleteSlug: text(f, 'Athlete Slug'),
    athleteName: text(f, 'Athlete Name') || undefined,
    requestType: text(f, 'Request Type') || 'General Update',
    title: text(f, 'Title'),
    description: text(f, 'Description') || undefined,
    priority: text(f, 'Priority') || 'Normal',
    status: text(f, 'Status') || 'Pending Review',
    dateSubmitted: text(f, 'Date Submitted') || row.createdTime,
    datePublished: text(f, 'Date Published') || undefined,
    publishedContent: text(f, 'Published Content') || undefined,
    submittedBy: text(f, 'Submitted By') || undefined,
  };
}

function encodeRequest(record: NotesRequest) {
  return `${NOTES_PREFIX} ${Buffer.from(JSON.stringify(record), 'utf8').toString('base64url')}`;
}

function parseRequests(notes: unknown): NotesRequest[] {
  return String(notes || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith(`${NOTES_PREFIX} `))
    .flatMap((line) => {
      try {
        return [
          JSON.parse(
            Buffer.from(line.slice(NOTES_PREFIX.length + 1), 'base64url').toString('utf8'),
          ) as NotesRequest,
        ];
      } catch {
        return [];
      }
    });
}

async function listAthletes(): Promise<AirtableRow[]> {
  const records: AirtableRow[] = [];
  let offset: string | undefined;
  do {
    const params = new URLSearchParams({ pageSize: '100' });
    params.append('fields[]', 'Slug');
    params.append('fields[]', 'Notes');
    if (offset) params.set('offset', offset);
    const res = await fetch(`${airtableUrl(ATHLETES)}?${params}`, {
      headers: headers(),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Athletes fallback read failed (${res.status}).`);
    const data = (await res.json()) as { records?: AirtableRow[]; offset?: string };
    records.push(...(data.records || []));
    offset = data.offset;
  } while (offset);
  return records;
}

async function listNotesRequests() {
  const athletes = await listAthletes();
  return athletes.flatMap((athlete) =>
    parseRequests(athlete.fields.Notes).map((request) => ({
      ...request,
      athleteSlug: request.athleteSlug || text(athlete.fields, 'Slug'),
    })),
  );
}

async function findAthlete(slug: string) {
  const safe = slug.replace(/'/g, "\\'");
  const params = new URLSearchParams({ maxRecords: '1', filterByFormula: `{Slug}='${safe}'` });
  params.append('fields[]', 'Slug');
  params.append('fields[]', 'Notes');
  const res = await fetch(`${airtableUrl(ATHLETES)}?${params}`, {
    headers: headers(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Athlete fallback lookup failed (${res.status}).`);
  const data = (await res.json()) as { records?: AirtableRow[] };
  return data.records?.[0] || null;
}

async function saveRequests(athlete: AirtableRow, requests: NotesRequest[]) {
  const preserved = String(athlete.fields.Notes || '')
    .split('\n')
    .filter((line) => !line.trim().startsWith(`${NOTES_PREFIX} `));
  const notes = [...preserved, ...requests.map(encodeRequest)].filter(Boolean).join('\n');
  const res = await fetch(airtableUrl(ATHLETES, athlete.id), {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ fields: { Notes: notes } }),
  });
  if (!res.ok) throw new Error(`Athlete fallback write failed (${res.status}).`);
}

async function listAll(filterByFormula?: string): Promise<{
  records: ContentRequestRecord[];
  live: boolean;
  error?: string;
}> {
  if (!token()) {
    return { records: [], live: false, error: 'Airtable is not configured (missing AIRTABLE_TOKEN).' };
  }
  const records: ContentRequestRecord[] = [];
  let offset: string | undefined;
  try {
    do {
      const params = new URLSearchParams({ pageSize: '100' });
      if (offset) params.set('offset', offset);
      if (filterByFormula) params.set('filterByFormula', filterByFormula);
      const res = await fetch(`${airtableUrl(TABLE)}?${params}`, {
        headers: headers(),
        cache: 'no-store',
      });
      if (!res.ok) {
        console.error('content-requests list failed:', await res.text());
        try {
          return { records: await listNotesRequests(), live: true };
        } catch (fallbackError) {
          console.error('content-requests fallback list failed:', fallbackError);
          return {
            records,
            live: true,
            error: 'Content Requests could not be read from Airtable.',
          };
        }
      }
      const data = (await res.json()) as { records?: AirtableRow[]; offset?: string };
      records.push(...(data.records || []).map(mapRecord));
      offset = data.offset;
    } while (offset);
    return { records, live: true };
  } catch (err) {
    console.error('content-requests list error:', err);
    return { records: [], live: false, error: 'Unexpected error reading content requests.' };
  }
}

export async function listForAthlete(slug: string) {
  const safe = slug.replace(/'/g, "\\'");
  const result = await listAll(`{Athlete Slug}='${safe}'`);
  return {
    ...result,
    records: result.records.filter((record) =>
      record.athleteSlug.toLowerCase() === slug.toLowerCase(),
    ),
  };
}

export async function listAdminQueue() {
  return listAll();
}

export async function createRequest(input: {
  athleteSlug: string;
  athleteName?: string;
  requestType: string;
  title: string;
  description?: string;
  priority?: string;
  submittedBy?: string;
  status?: ContentRequestStatus;
}): Promise<{ ok: boolean; error?: string; recordId?: string; requestId?: string }> {
  if (!token()) return { ok: false, error: 'Airtable is not configured (missing AIRTABLE_TOKEN).' };
  const fields: Record<string, unknown> = {
    'Athlete Slug': input.athleteSlug,
    'Request Type': input.requestType,
    Title: input.title,
    Priority: input.priority || 'Normal',
    Status: input.status || 'Pending Review',
    'Date Submitted': new Date().toISOString().slice(0, 10),
  };
  if (input.athleteName) fields['Athlete Name'] = input.athleteName;
  if (input.description) fields.Description = input.description;
  if (input.submittedBy) fields['Submitted By'] = input.submittedBy;
  try {
    const res = await fetch(airtableUrl(TABLE), {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ records: [{ fields }], typecast: true }),
    });
    if (res.ok) {
      const data = (await res.json()) as { records?: AirtableRow[] };
      const created = data.records?.[0];
      return {
        ok: true,
        recordId: created?.id,
        requestId: created ? text(created.fields, 'Request ID') || created.id : undefined,
      };
    }
    console.error('createRequest POST failed:', await res.text());
    const athlete = await findAthlete(input.athleteSlug);
    if (!athlete) return { ok: false, error: 'Player profile was not found.' };
    const id = `notes-${crypto.randomUUID()}`;
    const requestId = `CPR-${Date.now()}`;
    const record: NotesRequest = {
      id,
      requestId,
      athleteSlug: input.athleteSlug,
      athleteName: input.athleteName,
      requestType: input.requestType,
      title: input.title,
      description: input.description,
      priority: input.priority || 'Normal',
      status: input.status || 'Pending Review',
      dateSubmitted: new Date().toISOString().slice(0, 10),
      submittedBy: input.submittedBy,
    };
    await saveRequests(athlete, [...parseRequests(athlete.fields.Notes), record]);
    return { ok: true, recordId: id, requestId };
  } catch (err) {
    console.error('createRequest error:', err);
    return { ok: false, error: 'Unexpected error creating content request.' };
  }
}

export async function updateRequestStatus(
  recordId: string,
  patch: { status?: string; datePublished?: string; publishedContent?: string },
): Promise<{ ok: boolean; error?: string }> {
  if (!token()) return { ok: false, error: 'Airtable is not configured (missing AIRTABLE_TOKEN).' };
  try {
    if (recordId.startsWith('notes-')) {
      for (const athlete of await listAthletes()) {
        const requests = parseRequests(athlete.fields.Notes);
        const index = requests.findIndex((request) => request.id === recordId);
        if (index < 0) continue;
        requests[index] = {
          ...requests[index],
          ...(patch.status ? { status: patch.status } : {}),
          ...(patch.datePublished ? { datePublished: patch.datePublished } : {}),
          ...(patch.publishedContent !== undefined
            ? { publishedContent: patch.publishedContent }
            : {}),
        };
        await saveRequests(athlete, requests);
        return { ok: true };
      }
      return { ok: false, error: 'Content request was not found.' };
    }
    const fields: Record<string, unknown> = {};
    if (patch.status) fields.Status = patch.status;
    if (patch.datePublished) fields['Date Published'] = patch.datePublished;
    if (patch.publishedContent !== undefined) fields['Published Content'] = patch.publishedContent;
    const res = await fetch(airtableUrl(TABLE, recordId), {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ fields, typecast: true }),
    });
    if (!res.ok) {
      console.error('updateRequestStatus PATCH failed:', await res.text());
      return { ok: false, error: 'Failed to update content request.' };
    }
    return { ok: true };
  } catch (err) {
    console.error('updateRequestStatus error:', err);
    return { ok: false, error: 'Unexpected error updating content request.' };
  }
}
