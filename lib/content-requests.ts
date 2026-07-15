/**
 * CPR Content Requests — Update Hub™ persistence via Airtable.
 * Env: AIRTABLE_CONTENT_REQUESTS_TABLE_ID (fallback table name "Content Requests")
 */

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

const BASE = process.env.AIRTABLE_BASE_ID || 'appvVr6MVrJvEY0YJ';
const TABLE =
  process.env.AIRTABLE_CONTENT_REQUESTS_TABLE_ID?.trim() || 'Content Requests';

function token() {
  return process.env.AIRTABLE_TOKEN || process.env.AIRTABLE_API_KEY || '';
}

function headers() {
  return {
    Authorization: `Bearer ${token()}`,
    'Content-Type': 'application/json',
  };
}

function tableUrl(id?: string) {
  const base = `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(TABLE)}`;
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

async function listAll(filterByFormula?: string): Promise<{ records: ContentRequestRecord[]; live: boolean; error?: string }> {
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

      const res = await fetch(`${tableUrl()}?${params}`, {
        headers: headers(),
        cache: 'no-store',
      });

      if (!res.ok) {
        const detail = await res.text();
        console.error('content-requests list failed:', detail);
        return {
          records,
          live: true,
          error: 'Content Requests table could not be read. Check AIRTABLE_CONTENT_REQUESTS_TABLE_ID.',
        };
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

/** Published + pending requests for one athlete portal. */
export async function listForAthlete(
  slug: string,
): Promise<{ records: ContentRequestRecord[]; live: boolean; error?: string }> {
  const safe = slug.replace(/'/g, "\\'");
  const result = await listAll(`{Athlete Slug}='${safe}'`);
  if (result.error && result.records.length === 0) {
    const all = await listAll();
    return {
      ...all,
      records: all.records.filter((r) => r.athleteSlug.toLowerCase() === slug.toLowerCase()),
    };
  }
  return result;
}

/** Admin publish queue (all athletes). */
export async function listAdminQueue(): Promise<{
  records: ContentRequestRecord[];
  live: boolean;
  error?: string;
}> {
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
  if (!token()) {
    return { ok: false, error: 'Airtable is not configured (missing AIRTABLE_TOKEN).' };
  }

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
    const res = await fetch(tableUrl(), {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ records: [{ fields }], typecast: true }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('createRequest POST failed:', detail);
      return {
        ok: false,
        error:
          'Failed to create content request. Ensure the Content Requests table exists with expected fields.',
      };
    }

    const data = (await res.json()) as { records?: AirtableRow[] };
    const created = data.records?.[0];
    return {
      ok: true,
      recordId: created?.id,
      requestId: created ? text(created.fields, 'Request ID') || created.id : undefined,
    };
  } catch (err) {
    console.error('createRequest error:', err);
    return { ok: false, error: 'Unexpected error creating content request.' };
  }
}

export async function updateRequestStatus(
  recordId: string,
  patch: {
    status?: string;
    datePublished?: string;
    publishedContent?: string;
  },
): Promise<{ ok: boolean; error?: string }> {
  if (!token()) {
    return { ok: false, error: 'Airtable is not configured (missing AIRTABLE_TOKEN).' };
  }

  const fields: Record<string, unknown> = {};
  if (patch.status) fields.Status = patch.status;
  if (patch.datePublished) fields['Date Published'] = patch.datePublished;
  if (patch.publishedContent !== undefined) fields['Published Content'] = patch.publishedContent;

  try {
    const res = await fetch(tableUrl(recordId), {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ fields, typecast: true }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('updateRequestStatus PATCH failed:', detail);
      return { ok: false, error: 'Failed to update content request.' };
    }

    return { ok: true };
  } catch (err) {
    console.error('updateRequestStatus error:', err);
    return { ok: false, error: 'Unexpected error updating content request.' };
  }
}
