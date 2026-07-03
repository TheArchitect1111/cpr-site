import { allowSampleData } from '@/lib/env';
import { isOpenStaging } from '@/lib/staging';

const BASE = 'appvVr6MVrJvEY0YJ';

const TABLES = {
  resources: encodeURIComponent('Resources'),
  tickets: encodeURIComponent('Ask CPR Tickets'),
  messages: encodeURIComponent('Messages'),
  documents: encodeURIComponent('Documents'),
  events: encodeURIComponent('Events'),
};

interface AirtableRow {
  id: string;
  fields: Record<string, unknown>;
}

function atHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

function s(r: AirtableRow, name: string): string {
  return (r.fields[name] as string) ?? '';
}

function b(r: AirtableRow, name: string): boolean {
  return !!(r.fields[name] as boolean);
}

function strArr(r: AirtableRow, name: string): string[] {
  const val = r.fields[name];
  return Array.isArray(val) ? (val as string[]) : [];
}

export interface Resource {
  id: string;
  title: string;
  type: string;
  category: string;
  description: string;
  url: string;
  thumbnail: string;
  gradYearRelevance: string[];
  dateAdded: string;
}

export interface Ticket {
  id: string;
  athleteSlug: string;
  subject: string;
  message: string;
  status: string;
  dateSubmitted: string;
  dateResolved: string;
  adminNotes: string;
}

export interface Message {
  id: string;
  athleteSlug: string;
  sender: string;
  messageBody: string;
  dateSent: string;
  readStatus: boolean;
}

export interface DocFile {
  id: string;
  athleteSlug: string;
  documentName: string;
  documentType: string;
  url: string;
  dateUploaded: string;
  visibleTo: string;
}

export interface PortalEvent {
  id: string;
  eventName: string;
  eventType: string;
  date: string;
  location: string;
  description: string;
  registrationUrl: string;
  gradYearRelevance: string[];
}

// ── Sample data ────────────────────────────────────────────────────────────────

const SAMPLE_RESOURCES: Resource[] = [
  {
    id: 'r1',
    title: 'How to Build a Highlight Reel',
    type: 'Video',
    category: 'Film',
    description: 'Step-by-step guide to creating a standout highlight reel that gets coaches to respond.',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: '',
    gradYearRelevance: [],
    dateAdded: '2025-01-10',
  },
  {
    id: 'r2',
    title: 'NCAA Eligibility Overview',
    type: 'PDF',
    category: 'Eligibility',
    description: 'Key rules and timelines for NCAA eligibility clearinghouse registration.',
    url: '#',
    thumbnail: '',
    gradYearRelevance: [],
    dateAdded: '2025-02-01',
  },
  {
    id: 'r3',
    title: 'Coach Email Templates',
    type: 'Article',
    category: 'Outreach',
    description: 'Proven email templates for reaching out to college coaches at every level.',
    url: '#',
    thumbnail: '',
    gradYearRelevance: [],
    dateAdded: '2025-03-15',
  },
  {
    id: 'r4',
    title: 'Recruiting on a Budget',
    type: 'Video',
    category: 'Finance',
    description: 'How to maximize your exposure without breaking the family budget.',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: '',
    gradYearRelevance: [],
    dateAdded: '2025-04-20',
  },
  {
    id: 'r5',
    title: 'U SPORTS vs NCAA: Which Path is Right for You?',
    type: 'Article',
    category: 'Eligibility',
    description: 'Comparing Canadian and American college paths for prospects from Ontario.',
    url: '#',
    thumbnail: '',
    gradYearRelevance: [],
    dateAdded: '2025-05-01',
  },
];

const SAMPLE_TICKETS: Ticket[] = [
  {
    id: 't1',
    athleteSlug: 'jayden-thompson',
    subject: 'Question about GPA requirements',
    message: 'What GPA do I need to be eligible for D1 schools?',
    status: 'Resolved',
    dateSubmitted: '2025-05-01',
    dateResolved: '2025-05-02',
    adminNotes: 'Replied via email with NCAA D1 academic requirements. Minimum 2.3 GPA for D1, 2.2 for D2.',
  },
  {
    id: 't2',
    athleteSlug: 'jayden-thompson',
    subject: 'Highlight video feedback',
    message: 'Can you review my highlight reel and let me know what needs improvement?',
    status: 'Open',
    dateSubmitted: '2025-06-01',
    dateResolved: '',
    adminNotes: '',
  },
];

const SAMPLE_MESSAGES: Message[] = [
  {
    id: 'm1',
    athleteSlug: 'jayden-thompson',
    sender: 'Coach Mike',
    messageBody: 'Great work on your latest film. The footwork clips are exactly what college coaches want to see.',
    dateSent: '2026-06-01T10:00:00Z',
    readStatus: true,
  },
  {
    id: 'm2',
    athleteSlug: 'jayden-thompson',
    sender: 'Athlete',
    messageBody: 'Thank you! I have been working hard on it. Are there any upcoming camps you recommend?',
    dateSent: '2026-06-01T11:30:00Z',
    readStatus: true,
  },
  {
    id: 'm3',
    athleteSlug: 'jayden-thompson',
    sender: 'Coach Mike',
    messageBody: 'Yes! Check the Upcoming Events section. The Summer Showcase on July 15 is a great opportunity for exposure.',
    dateSent: '2026-06-02T09:00:00Z',
    readStatus: false,
  },
];

const SAMPLE_DOCS: DocFile[] = [
  {
    id: 'd1',
    athleteSlug: 'jayden-thompson',
    documentName: 'Recruiting Profile',
    documentType: 'PDF',
    url: '#',
    dateUploaded: '2025-04-10',
    visibleTo: 'Both',
  },
  {
    id: 'd2',
    athleteSlug: 'jayden-thompson',
    documentName: 'Eligibility Worksheet',
    documentType: 'PDF',
    url: '#',
    dateUploaded: '2025-05-15',
    visibleTo: 'Athlete',
  },
  {
    id: 'd3',
    athleteSlug: 'jayden-thompson',
    documentName: 'Parent Handbook',
    documentType: 'PDF',
    url: '#',
    dateUploaded: '2025-05-20',
    visibleTo: 'Parent',
  },
];

const SAMPLE_EVENTS: PortalEvent[] = [
  {
    id: 'e1',
    eventName: 'CPR Summer Showcase',
    eventType: 'Showcase',
    date: '2026-07-15',
    location: 'Toronto, ON',
    description:
      'Annual showcase for top Canadian prospects. Scouts from 20+ programs will be in attendance. This is a prime opportunity for exposure at the college level.',
    registrationUrl: '#',
    gradYearRelevance: [],
  },
  {
    id: 'e2',
    eventName: 'NCAA Eligibility Webinar',
    eventType: 'Webinar',
    date: '2026-06-28',
    location: 'Online',
    description:
      'Learn the key eligibility steps for competing at the NCAA level with guidance from our eligibility specialists.',
    registrationUrl: '#',
    gradYearRelevance: [],
  },
  {
    id: 'e3',
    eventName: 'CPR Film Review Session',
    eventType: 'Workshop',
    date: '2026-07-05',
    location: 'Online',
    description:
      'Submit your highlight reel for review by Coach Mike and receive live feedback and editing recommendations.',
    registrationUrl: '#',
    gradYearRelevance: [],
  },
];

// ── Core fetch helpers ────────────────────────────────────────────────────────

async function atFetch(tablePath: string): Promise<AirtableRow[]> {
  if (isOpenStaging()) return [];
  if (!process.env.AIRTABLE_TOKEN) return [];
  const url = `https://api.airtable.com/v0/${BASE}/${tablePath}`;
  try {
    const res = await fetch(url, { headers: atHeaders() });
    if (!res.ok) return [];
    const data = (await res.json()) as { records?: AirtableRow[] };
    return data.records ?? [];
  } catch {
    return [];
  }
}

async function atPost(
  table: string,
  fields: Record<string, unknown>
): Promise<{ id: string } | null> {
  if (isOpenStaging()) return null;
  if (!process.env.AIRTABLE_TOKEN) return null;
  const url = `https://api.airtable.com/v0/${BASE}/${table}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: atHeaders(),
      body: JSON.stringify({ records: [{ fields }], typecast: true }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { records?: { id: string }[] };
    return data.records?.[0] ?? null;
  } catch {
    return null;
  }
}

async function atPatch(
  table: string,
  id: string,
  fields: Record<string, unknown>
): Promise<boolean> {
  if (isOpenStaging()) return false;
  if (!process.env.AIRTABLE_TOKEN) return false;
  const url = `https://api.airtable.com/v0/${BASE}/${table}/${id}`;
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: atHeaders(),
      body: JSON.stringify({ fields, typecast: true }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function safeSlug(slug: string): string {
  return slug.replace(/'/g, "\\'");
}

// ── Resources ─────────────────────────────────────────────────────────────────

function rowToResource(r: AirtableRow): Resource {
  return {
    id: r.id,
    title: s(r, 'Title'),
    type: s(r, 'Type'),
    category: s(r, 'Category'),
    description: s(r, 'Description'),
    url: s(r, 'URL'),
    thumbnail: s(r, 'Thumbnail'),
    gradYearRelevance: strArr(r, 'Grad Year Relevance'),
    dateAdded: s(r, 'Date Added'),
  };
}

export async function getResources(): Promise<{ resources: Resource[]; live: boolean }> {
  if (isOpenStaging()) return { resources: SAMPLE_RESOURCES, live: false };

  const sort = encodeURIComponent('sort[0][field]') + '=' + encodeURIComponent('Date Added') +
    '&' + encodeURIComponent('sort[0][direction]') + '=desc';
  const rows = await atFetch(`${TABLES.resources}?${sort}`);
  if (rows.length === 0 && !process.env.AIRTABLE_TOKEN && allowSampleData()) {
    return { resources: SAMPLE_RESOURCES, live: false };
  }
  return { resources: rows.map(rowToResource), live: true };
}

// ── Tickets ───────────────────────────────────────────────────────────────────

function rowToTicket(r: AirtableRow): Ticket {
  return {
    id: r.id,
    athleteSlug: s(r, 'Athlete Slug'),
    subject: s(r, 'Subject'),
    message: s(r, 'Message'),
    status: s(r, 'Status') || 'Open',
    dateSubmitted: s(r, 'Date Submitted'),
    dateResolved: s(r, 'Date Resolved'),
    adminNotes: s(r, 'Admin Notes'),
  };
}

export async function getTicketsBySlug(
  slug: string
): Promise<{ tickets: Ticket[]; live: boolean }> {
  if (isOpenStaging()) {
    const sample = SAMPLE_TICKETS.filter(
      (t) => t.athleteSlug === slug || slug === 'jayden-thompson'
    );
    return { tickets: sample, live: false };
  }

  const formula = encodeURIComponent(`{Athlete Slug}='${safeSlug(slug)}'`);
  const sort =
    encodeURIComponent('sort[0][field]') +
    '=' +
    encodeURIComponent('Date Submitted') +
    '&' +
    encodeURIComponent('sort[0][direction]') +
    '=desc';
  const rows = await atFetch(`${TABLES.tickets}?filterByFormula=${formula}&${sort}`);
  if (rows.length === 0 && !process.env.AIRTABLE_TOKEN && allowSampleData()) {
    const sample = SAMPLE_TICKETS.filter(
      (t) => t.athleteSlug === slug || slug === 'jayden-thompson'
    );
    return { tickets: sample, live: false };
  }
  return { tickets: rows.map(rowToTicket), live: true };
}

export async function getAllTickets(): Promise<{ tickets: Ticket[]; live: boolean }> {
  if (isOpenStaging()) return { tickets: SAMPLE_TICKETS, live: false };

  const sort =
    encodeURIComponent('sort[0][field]') +
    '=' +
    encodeURIComponent('Date Submitted') +
    '&' +
    encodeURIComponent('sort[0][direction]') +
    '=desc';
  const rows = await atFetch(`${TABLES.tickets}?${sort}`);
  if (rows.length === 0 && !process.env.AIRTABLE_TOKEN && allowSampleData()) {
    return { tickets: SAMPLE_TICKETS, live: false };
  }
  return { tickets: rows.map(rowToTicket), live: true };
}

export async function createTicket(data: {
  athleteSlug: string;
  subject: string;
  message: string;
}): Promise<Ticket | null> {
  const dateStr = new Date().toISOString().slice(0, 10);
  if (isOpenStaging()) {
    return {
      id: `staging_ticket_${Date.now()}`,
      athleteSlug: data.athleteSlug,
      subject: data.subject,
      message: data.message,
      status: 'Open',
      dateSubmitted: dateStr,
      dateResolved: '',
      adminNotes: '',
    };
  }

  const created = await atPost(TABLES.tickets, {
    'Athlete Slug': data.athleteSlug,
    Subject: data.subject,
    Message: data.message,
    Status: 'Open',
    'Date Submitted': dateStr,
  });
  if (!created) return null;
  return {
    id: created.id,
    athleteSlug: data.athleteSlug,
    subject: data.subject,
    message: data.message,
    status: 'Open',
    dateSubmitted: dateStr,
    dateResolved: '',
    adminNotes: '',
  };
}

export async function updateTicket(
  id: string,
  fields: { status?: string; adminNotes?: string; dateResolved?: string }
): Promise<boolean> {
  if (isOpenStaging()) return true;

  const raw: Record<string, unknown> = {};
  if (fields.status !== undefined) raw['Status'] = fields.status;
  if (fields.adminNotes !== undefined) raw['Admin Notes'] = fields.adminNotes;
  if (fields.dateResolved !== undefined) raw['Date Resolved'] = fields.dateResolved;
  return atPatch(TABLES.tickets, id, raw);
}

// ── Messages ──────────────────────────────────────────────────────────────────

function rowToMessage(r: AirtableRow): Message {
  return {
    id: r.id,
    athleteSlug: s(r, 'Athlete Slug'),
    sender: s(r, 'Sender'),
    messageBody: s(r, 'Message Body'),
    dateSent: s(r, 'Date Sent'),
    readStatus: b(r, 'Read Status'),
  };
}

export async function getMessagesBySlug(
  slug: string
): Promise<{ messages: Message[]; live: boolean }> {
  if (isOpenStaging()) {
    const sample = SAMPLE_MESSAGES.filter(
      (m) => m.athleteSlug === slug || slug === 'jayden-thompson'
    );
    return { messages: sample, live: false };
  }

  const formula = encodeURIComponent(`{Athlete Slug}='${safeSlug(slug)}'`);
  const sort =
    encodeURIComponent('sort[0][field]') +
    '=' +
    encodeURIComponent('Date Sent') +
    '&' +
    encodeURIComponent('sort[0][direction]') +
    '=asc';
  const rows = await atFetch(`${TABLES.messages}?filterByFormula=${formula}&${sort}`);
  if (rows.length === 0 && !process.env.AIRTABLE_TOKEN && allowSampleData()) {
    const sample = SAMPLE_MESSAGES.filter(
      (m) => m.athleteSlug === slug || slug === 'jayden-thompson'
    );
    return { messages: sample, live: false };
  }
  return { messages: rows.map(rowToMessage), live: true };
}

export async function getAllMessages(): Promise<{ messages: Message[]; live: boolean }> {
  if (isOpenStaging()) return { messages: SAMPLE_MESSAGES, live: false };

  const sort =
    encodeURIComponent('sort[0][field]') +
    '=' +
    encodeURIComponent('Date Sent') +
    '&' +
    encodeURIComponent('sort[0][direction]') +
    '=desc';
  const rows = await atFetch(`${TABLES.messages}?${sort}`);
  if (rows.length === 0 && !process.env.AIRTABLE_TOKEN && allowSampleData()) {
    return { messages: SAMPLE_MESSAGES, live: false };
  }
  return { messages: rows.map(rowToMessage), live: true };
}

export async function createMessage(data: {
  athleteSlug: string;
  sender: string;
  messageBody: string;
}): Promise<Message | null> {
  const dateSent = new Date().toISOString();
  if (isOpenStaging()) {
    return {
      id: `staging_message_${Date.now()}`,
      athleteSlug: data.athleteSlug,
      sender: data.sender,
      messageBody: data.messageBody,
      dateSent,
      readStatus: false,
    };
  }

  const created = await atPost(TABLES.messages, {
    'Athlete Slug': data.athleteSlug,
    Sender: data.sender,
    'Message Body': data.messageBody,
    'Date Sent': dateSent,
    'Read Status': false,
  });
  if (!created) return null;
  return {
    id: created.id,
    athleteSlug: data.athleteSlug,
    sender: data.sender,
    messageBody: data.messageBody,
    dateSent,
    readStatus: false,
  };
}

export async function markMessagesRead(slug: string): Promise<void> {
  if (isOpenStaging()) return;

  const formula = encodeURIComponent(
    `AND({Athlete Slug}='${safeSlug(slug)}',{Read Status}=FALSE())`
  );
  const rows = await atFetch(`${TABLES.messages}?filterByFormula=${formula}`);
  for (const row of rows) {
    await atPatch(TABLES.messages, row.id, { 'Read Status': true });
  }
}

// ── Documents ─────────────────────────────────────────────────────────────────

function rowToDoc(r: AirtableRow): DocFile {
  return {
    id: r.id,
    athleteSlug: s(r, 'Athlete Slug'),
    documentName: s(r, 'Document Name'),
    documentType: s(r, 'Document Type'),
    url: s(r, 'URL'),
    dateUploaded: s(r, 'Date Uploaded'),
    visibleTo: s(r, 'Visible To'),
  };
}

export async function getDocumentsBySlug(
  slug: string,
  portalType?: 'athlete' | 'parent'
): Promise<{ docs: DocFile[]; live: boolean }> {
  if (isOpenStaging()) {
    const sample = SAMPLE_DOCS.filter((d) => {
      if (d.athleteSlug !== slug && slug !== 'jayden-thompson') return false;
      if (!portalType) return true;
      const v = d.visibleTo.toLowerCase();
      return v === 'both' || v === portalType;
    });
    return { docs: sample, live: false };
  }

  const formula = encodeURIComponent(`{Athlete Slug}='${safeSlug(slug)}'`);
  const sort =
    encodeURIComponent('sort[0][field]') +
    '=' +
    encodeURIComponent('Date Uploaded') +
    '&' +
    encodeURIComponent('sort[0][direction]') +
    '=desc';
  const rows = await atFetch(`${TABLES.documents}?filterByFormula=${formula}&${sort}`);
  if (rows.length === 0 && !process.env.AIRTABLE_TOKEN && allowSampleData()) {
    const sample = SAMPLE_DOCS.filter((d) => {
      if (d.athleteSlug !== slug && slug !== 'jayden-thompson') return false;
      if (!portalType) return true;
      const v = d.visibleTo.toLowerCase();
      return v === 'both' || v === portalType;
    });
    return { docs: sample, live: false };
  }
  const docs = rows
    .map(rowToDoc)
    .filter((d) => {
      if (!portalType) return true;
      const v = d.visibleTo.toLowerCase();
      return v === 'both' || v === portalType;
    });
  return { docs, live: true };
}

// ── Events ────────────────────────────────────────────────────────────────────

function rowToEvent(r: AirtableRow): PortalEvent {
  return {
    id: r.id,
    eventName: s(r, 'Event Name'),
    eventType: s(r, 'Event Type'),
    date: s(r, 'Date'),
    location: s(r, 'Location'),
    description: s(r, 'Description'),
    registrationUrl: s(r, 'Registration URL'),
    gradYearRelevance: strArr(r, 'Grad Year Relevance'),
  };
}

export async function getUpcomingEvents(): Promise<{ events: PortalEvent[]; live: boolean }> {
  if (isOpenStaging()) return { events: SAMPLE_EVENTS, live: false };

  const today = new Date().toISOString().slice(0, 10);
  const formula = encodeURIComponent(`IS_AFTER({Date},'${today}')`);
  const sort =
    encodeURIComponent('sort[0][field]') +
    '=Date&' +
    encodeURIComponent('sort[0][direction]') +
    '=asc';
  const rows = await atFetch(`${TABLES.events}?filterByFormula=${formula}&${sort}`);
  if (rows.length === 0 && !process.env.AIRTABLE_TOKEN && allowSampleData()) {
    return { events: SAMPLE_EVENTS, live: false };
  }
  return { events: rows.map(rowToEvent), live: true };
}
