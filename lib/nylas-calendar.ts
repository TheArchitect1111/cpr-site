import 'server-only';

export type SharedCalendarEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  location?: string;
  description?: string;
  status?: string;
};

type NylasWhen = {
  object?: string;
  start_time?: number;
  end_time?: number;
  date?: string;
  start_date?: string;
  end_date?: string;
};

type NylasEvent = {
  id?: string;
  title?: string;
  description?: string;
  location?: string;
  status?: string;
  when?: NylasWhen;
};

type NylasListResponse = {
  data?: NylasEvent[];
  request_id?: string;
};

type NylasEventResponse = {
  data?: NylasEvent;
};

export type SharedCalendarEventInput = {
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  location?: string;
  description?: string;
};

export function nylasCalendarConfigured(): boolean {
  return Boolean(
    process.env.NYLAS_API_KEY?.trim() &&
      process.env.NYLAS_GRANT_ID?.trim() &&
      process.env.NYLAS_CALENDAR_ID?.trim(),
  );
}

function unixToIso(value: number | undefined): string | undefined {
  if (!Number.isFinite(value)) return undefined;
  return new Date(Number(value) * 1000).toISOString();
}

function mapEvent(event: NylasEvent): SharedCalendarEvent | null {
  const id = event.id?.trim();
  const when = event.when;
  if (!id || !when) return null;

  const allDay = when.object === 'date' || when.object === 'datespan';
  const start = allDay ? when.date || when.start_date : unixToIso(when.start_time);
  const end = allDay ? when.end_date : unixToIso(when.end_time);
  if (!start) return null;

  return {
    id,
    title: event.title?.trim() || 'Calendar event',
    start,
    end,
    allDay,
    location: event.location?.trim() || undefined,
    description: event.description?.trim() || undefined,
    status: event.status?.trim() || undefined,
  };
}

function nylasConnection() {
  const apiKey = process.env.NYLAS_API_KEY?.trim();
  const grantId = process.env.NYLAS_GRANT_ID?.trim();
  const calendarId = process.env.NYLAS_CALENDAR_ID?.trim();
  if (!apiKey || !grantId || !calendarId) return null;
  return {
    apiKey,
    grantId,
    calendarId,
    base: process.env.NYLAS_API_URI?.trim() || 'https://api.us.nylas.com',
  };
}

function eventPayload(input: SharedCalendarEventInput) {
  const start = new Date(input.start);
  const end = new Date(input.end);
  if (!input.title.trim() || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    throw new Error('A title and valid start and end dates are required.');
  }
  return {
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    location: input.location?.trim() || undefined,
    when: input.allDay
      ? {
          object: 'datespan',
          start_date: input.start.slice(0, 10),
          end_date: input.end.slice(0, 10),
        }
      : {
          object: 'timespan',
          start_time: Math.floor(start.getTime() / 1000),
          end_time: Math.floor(end.getTime() / 1000),
        },
  };
}

async function mutateNylasEvent(input: {
  method: 'POST' | 'PUT' | 'DELETE';
  eventId?: string;
  event?: SharedCalendarEventInput;
}) {
  const connection = nylasConnection();
  if (!connection) throw new Error('Shared calendar connection is not configured.');
  const path = input.eventId
    ? `/v3/grants/${encodeURIComponent(connection.grantId)}/events/${encodeURIComponent(input.eventId)}`
    : `/v3/grants/${encodeURIComponent(connection.grantId)}/events`;
  const url = new URL(path, connection.base);
  url.searchParams.set('calendar_id', connection.calendarId);
  const response = await fetch(url, {
    method: input.method,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${connection.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: input.event ? JSON.stringify(eventPayload(input.event)) : undefined,
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    console.error('[nylas-calendar] mutation failed', { method: input.method, status: response.status });
    throw new Error('The calendar change could not be saved.');
  }
  if (input.method === 'DELETE') return null;
  const payload = (await response.json()) as NylasEventResponse;
  const mapped = payload.data ? mapEvent(payload.data) : null;
  if (!mapped) throw new Error('The calendar returned an invalid event.');
  return mapped;
}

export function createNylasCalendarEvent(event: SharedCalendarEventInput) {
  return mutateNylasEvent({ method: 'POST', event });
}

export function updateNylasCalendarEvent(id: string, event: SharedCalendarEventInput) {
  return mutateNylasEvent({ method: 'PUT', eventId: id, event });
}

export function deleteNylasCalendarEvent(id: string) {
  return mutateNylasEvent({ method: 'DELETE', eventId: id });
}

export async function listNylasCalendarEvents(input: {
  start: Date;
  end: Date;
}): Promise<SharedCalendarEvent[]> {
  const apiKey = process.env.NYLAS_API_KEY?.trim();
  const grantId = process.env.NYLAS_GRANT_ID?.trim();
  const calendarId = process.env.NYLAS_CALENDAR_ID?.trim();
  if (!apiKey || !grantId || !calendarId) return [];

  const base = process.env.NYLAS_API_URI?.trim() || 'https://api.us.nylas.com';
  const url = new URL(`/v3/grants/${encodeURIComponent(grantId)}/events`, base);
  url.searchParams.set('calendar_id', calendarId);
  url.searchParams.set('start', String(Math.floor(input.start.getTime() / 1000)));
  url.searchParams.set('end', String(Math.floor(input.end.getTime() / 1000)));
  url.searchParams.set('limit', '200');

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    console.error('[nylas-calendar] list failed', {
      status: response.status,
      grantConfigured: true,
      calendarConfigured: true,
    });
    throw new Error('The shared calendar could not be loaded.');
  }

  const payload = (await response.json()) as NylasListResponse;
  return (payload.data ?? [])
    .map(mapEvent)
    .filter((event): event is SharedCalendarEvent => event !== null);
}
