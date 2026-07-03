import { getAllTickets, type Ticket } from '@/lib/sections-data';
import type { AthleteAdmin } from '@/lib/athletes';
import { isOpenStaging } from '@/lib/staging';

export type WebsiteUpdateRequest = {
  id: string;
  athleteSlug: string;
  athleteName: string;
  subject: string;
  message: string;
  status: string;
  dateSubmitted: string;
};

const PREFIX = 'Website update request:';

const STAGING_REQUESTS: WebsiteUpdateRequest[] = [
  {
    id: 'staging-web-1',
    athleteSlug: 'jayden-thompson',
    athleteName: 'Jayden Thompson',
    subject: 'Website update request: New highlight video',
    message:
      'Please add the new mid-season highlight video to Jayden profile and include a short note about improved court vision.',
    status: 'Open',
    dateSubmitted: new Date().toISOString().slice(0, 10),
  },
  {
    id: 'staging-web-2',
    athleteSlug: 'jayden-thompson',
    athleteName: 'Jayden Thompson',
    subject: 'Website update request: Add camp photos',
    message:
      'Please review the latest camp photos and add the best image to the recruiting profile after approval.',
    status: 'Open',
    dateSubmitted: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
  },
];

function athleteNameFor(slug: string, athletes: AthleteAdmin[]): string {
  const athlete = athletes.find((item) => item.slug === slug);
  return athlete ? `${athlete.firstName} ${athlete.lastName}`.trim() : slug;
}

function fromTicket(ticket: Ticket, athletes: AthleteAdmin[]): WebsiteUpdateRequest {
  return {
    id: ticket.id,
    athleteSlug: ticket.athleteSlug,
    athleteName: athleteNameFor(ticket.athleteSlug, athletes),
    subject: ticket.subject,
    message: ticket.message,
    status: ticket.status,
    dateSubmitted: ticket.dateSubmitted,
  };
}

export function websiteRequestSubject(type: string): string {
  return `${PREFIX} ${type}`;
}

export function isWebsiteUpdateTicket(ticket: Ticket): boolean {
  return ticket.subject.toLowerCase().startsWith(PREFIX.toLowerCase());
}

export async function getWebsiteUpdateRequests(
  athletes: AthleteAdmin[],
): Promise<{ requests: WebsiteUpdateRequest[]; live: boolean }> {
  if (isOpenStaging()) return { requests: STAGING_REQUESTS, live: false };

  const result = await getAllTickets();
  return {
    requests: result.tickets
      .filter(isWebsiteUpdateTicket)
      .map((ticket) => fromTicket(ticket, athletes)),
    live: result.live,
  };
}

