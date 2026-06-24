import { emailPage, sendEmail } from '@/lib/email';
import type {
  CommunicationAnnouncement,
  CommunicationNotification,
} from '@/components/communication-center/types';

type AirtableRow = {
  id: string;
  fields: Record<string, unknown>;
};

const BASE = process.env.AIRTABLE_BASE_ID || 'appvVr6MVrJvEY0YJ';

const TABLES = {
  announcements: process.env.AIRTABLE_COMMUNICATION_ANNOUNCEMENTS_TABLE || 'Communication Announcements',
  notifications: process.env.AIRTABLE_COMMUNICATION_NOTIFICATIONS_TABLE || 'Communication Notifications',
  events: process.env.AIRTABLE_COMMUNICATION_EVENTS_TABLE || 'Communication Events',
};

const SAMPLE_ANNOUNCEMENTS: CommunicationAnnouncement[] = [
  {
    id: 'sample-announcement-1',
    title: 'Summer showcase reminder',
    body: 'Families should review upcoming showcase dates and confirm availability with CPR.',
    status: 'Published',
    audience: 'Families',
    channels: ['Portal'],
    pinned: true,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

function token() {
  return process.env.AIRTABLE_TOKEN || process.env.AIRTABLE_API_KEY || '';
}

function headers() {
  return {
    Authorization: `Bearer ${token()}`,
    'Content-Type': 'application/json',
  };
}

function tableUrl(table: string, id?: string) {
  const baseUrl = `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}`;
  return id ? `${baseUrl}/${id}` : baseUrl;
}

function text(row: AirtableRow, field: string) {
  const value = row.fields[field];
  return value === undefined || value === null ? '' : String(value);
}

function bool(row: AirtableRow, field: string) {
  return Boolean(row.fields[field]);
}

function list(row: AirtableRow, field: string) {
  const value = row.fields[field];
  if (Array.isArray(value)) return value.map(item => String(item)).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map(item => item.trim()).filter(Boolean);
  return [];
}

function rowToAnnouncement(row: AirtableRow): CommunicationAnnouncement {
  const status = text(row, 'Status') as CommunicationAnnouncement['status'];
  return {
    id: row.id,
    title: text(row, 'Title'),
    body: text(row, 'Body'),
    status: status || 'Draft',
    audience: text(row, 'Audience') || 'All',
    channels: list(row, 'Channels'),
    recipientEmails: list(row, 'Recipient Emails'),
    emailSentAt: text(row, 'Email Sent At'),
    emailDeliveryStatus: text(row, 'Email Delivery Status'),
    pinned: bool(row, 'Pinned'),
    scheduledAt: text(row, 'Scheduled At'),
    publishedAt: text(row, 'Published At'),
    createdAt: text(row, 'Created At'),
    updatedAt: text(row, 'Updated At'),
  };
}

function rowToNotification(row: AirtableRow): CommunicationNotification {
  return {
    id: row.id,
    type: text(row, 'Type') || 'Update',
    title: text(row, 'Title'),
    body: text(row, 'Body'),
    priority: (text(row, 'Priority') || 'Normal') as CommunicationNotification['priority'],
    sourceType: text(row, 'Source Type'),
    sourceId: text(row, 'Source ID'),
    readAt: text(row, 'Read At'),
    actionUrl: text(row, 'Action URL'),
    createdAt: text(row, 'Created At'),
  };
}

async function airtableGet(table: string, query = '') {
  if (!token()) return { rows: [], live: false };
  const url = `${tableUrl(table)}${query ? `?${query}` : ''}`;
  try {
    const res = await fetch(url, { headers: headers(), cache: 'no-store' });
    if (!res.ok) return { rows: [], live: true };
    const data = await res.json() as { records?: AirtableRow[] };
    return { rows: data.records || [], live: true };
  } catch {
    return { rows: [], live: true };
  }
}

async function airtableCreate(table: string, fields: Record<string, unknown>) {
  if (!token()) return null;
  try {
    const res = await fetch(tableUrl(table), {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ records: [{ fields }], typecast: true }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { records?: AirtableRow[] };
    return data.records?.[0] || null;
  } catch {
    return null;
  }
}

async function airtablePatch(table: string, id: string, fields: Record<string, unknown>) {
  if (!token()) return null;
  try {
    const res = await fetch(tableUrl(table, id), {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ fields, typecast: true }),
    });
    if (!res.ok) return null;
    return await res.json() as AirtableRow;
  } catch {
    return null;
  }
}

export async function getCommunicationAnnouncements() {
  const sort = `${encodeURIComponent('sort[0][field]')}=${encodeURIComponent('Created At')}&${encodeURIComponent('sort[0][direction]')}=desc`;
  const result = await airtableGet(TABLES.announcements, sort);
  if (!result.live && result.rows.length === 0) {
    return { announcements: SAMPLE_ANNOUNCEMENTS, live: false };
  }
  return { announcements: result.rows.map(rowToAnnouncement), live: result.live };
}

export async function getCommunicationNotifications() {
  const sort = `${encodeURIComponent('sort[0][field]')}=${encodeURIComponent('Created At')}&${encodeURIComponent('sort[0][direction]')}=desc`;
  const result = await airtableGet(TABLES.notifications, sort);
  return { notifications: result.rows.map(rowToNotification), live: result.live };
}

export async function createCommunicationNotification(input: {
  type: string;
  title: string;
  body: string;
  priority?: CommunicationNotification['priority'];
  sourceType: string;
  sourceId: string;
  actionUrl?: string;
}) {
  return airtableCreate(TABLES.notifications, {
    Type: input.type,
    Title: input.title,
    Body: input.body,
    Priority: input.priority || 'Normal',
    'Source Type': input.sourceType,
    'Source ID': input.sourceId,
    'Action URL': input.actionUrl || '',
    'Created At': new Date().toISOString(),
  });
}

export async function createCommunicationEvent(input: {
  eventType: string;
  sourceType: string;
  sourceId: string;
  actorName: string;
  label: string;
  metadata?: Record<string, unknown>;
}) {
  return airtableCreate(TABLES.events, {
    'Event Type': input.eventType,
    'Source Type': input.sourceType,
    'Source ID': input.sourceId,
    'Actor Name': input.actorName,
    Label: input.label,
    Metadata: input.metadata ? JSON.stringify(input.metadata) : '',
    'Created At': new Date().toISOString(),
  });
}

export async function createCommunicationAnnouncement(input: {
  title: string;
  body: string;
  audience: string;
  channels: string[];
  recipientEmails: string[];
  pinned?: boolean;
  scheduledAt?: string;
  publishNow?: boolean;
  actorName: string;
}) {
  const now = new Date().toISOString();
  const status: CommunicationAnnouncement['status'] = input.publishNow ? 'Published' : input.scheduledAt ? 'Scheduled' : 'Draft';
  const created = await airtableCreate(TABLES.announcements, {
    Title: input.title,
    Body: input.body,
    Audience: input.audience,
    Channels: input.channels,
    'Recipient Emails': input.recipientEmails.join(', '),
    Pinned: Boolean(input.pinned),
    Status: status,
    'Scheduled At': input.scheduledAt || '',
    'Published At': input.publishNow ? now : '',
    'Created At': now,
    'Updated At': now,
  });
  if (!created) throw new Error('Announcement storage is not configured.');

  let announcement = rowToAnnouncement(created);
  await createCommunicationNotification({
    type: 'Announcement',
    title: announcement.title,
    body: announcement.body,
    priority: input.pinned ? 'High' : 'Normal',
    sourceType: 'announcement',
    sourceId: announcement.id,
    actionUrl: '/admin?tab=communication',
  });
  await createCommunicationEvent({
    eventType: status,
    sourceType: 'announcement',
    sourceId: announcement.id,
    actorName: input.actorName,
    label: `${status}: ${announcement.title}`,
    metadata: { channels: input.channels, audience: input.audience },
  });

  if (input.publishNow && input.channels.includes('Email')) {
    announcement = await sendAnnouncementEmail(announcement, input.actorName);
  }

  return announcement;
}

export async function updateCommunicationAnnouncement(input: {
  id: string;
  action: 'publish' | 'archive';
  actorName: string;
}) {
  const now = new Date().toISOString();
  const fields: Record<string, unknown> = { 'Updated At': now };
  if (input.action === 'publish') {
    fields.Status = 'Published';
    fields['Published At'] = now;
  }
  if (input.action === 'archive') {
    fields.Status = 'Archived';
    fields['Archived At'] = now;
  }

  const patched = await airtablePatch(TABLES.announcements, input.id, fields);
  if (!patched) throw new Error('Announcement could not be updated.');
  let announcement = rowToAnnouncement(patched);

  await createCommunicationNotification({
    type: input.action === 'publish' ? 'Announcement Published' : 'Announcement Archived',
    title: announcement.title,
    body: announcement.body,
    priority: input.action === 'publish' && announcement.pinned ? 'High' : 'Normal',
    sourceType: 'announcement',
    sourceId: announcement.id,
    actionUrl: '/admin?tab=communication',
  });
  await createCommunicationEvent({
    eventType: input.action,
    sourceType: 'announcement',
    sourceId: announcement.id,
    actorName: input.actorName,
    label: `${input.action}: ${announcement.title}`,
    metadata: { channels: announcement.channels },
  });

  if (input.action === 'publish' && announcement.channels.includes('Email')) {
    announcement = await sendAnnouncementEmail(announcement, input.actorName);
  }

  return announcement;
}

async function sendAnnouncementEmail(announcement: CommunicationAnnouncement, actorName: string) {
  const recipients = announcement.recipientEmails?.filter(Boolean) || [];
  if (!recipients.length) {
    const patched = await airtablePatch(TABLES.announcements, announcement.id, {
      'Email Delivery Status': 'No recipients',
      'Updated At': new Date().toISOString(),
    });
    return patched ? rowToAnnouncement(patched) : announcement;
  }

  try {
    await sendEmail({
      to: recipients,
      subject: announcement.title,
      html: emailPage(
        announcement.title,
        `<p>${escapeHtml(announcement.body).replace(/\n/g, '<br>')}</p><p style="margin-top:20px;color:#555;font-size:13px">Sent by ${escapeHtml(actorName)} through Communication Center.</p>`,
      ),
      text: announcement.body,
      idempotencyKey: `announcement-${announcement.id}`,
    });
    const patched = await airtablePatch(TABLES.announcements, announcement.id, {
      'Email Sent At': new Date().toISOString(),
      'Email Delivery Status': `Sent to ${recipients.length}`,
      'Updated At': new Date().toISOString(),
    });
    return patched ? rowToAnnouncement(patched) : announcement;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Email failed';
    const patched = await airtablePatch(TABLES.announcements, announcement.id, {
      'Email Delivery Status': message,
      'Updated At': new Date().toISOString(),
    });
    return patched ? rowToAnnouncement(patched) : announcement;
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

