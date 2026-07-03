import { getAllTickets, getAllMessages } from '@/lib/sections-data';
import { isOpenStaging } from '@/lib/staging';

const BASE = 'appvVr6MVrJvEY0YJ';
const ATHLETES = 'tblZwrZHi3WBR3NHZ';

export type AthleteActivity = {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  gradYear: number;
  lastLogin: string;
  lastLoginType: string;
  totalLogins: number;
  onboardingSteps: number;
  engagementScore: number;
  openTicketCount: number;
  daysSinceLogin: number | null;
};

// Engagement Score: 0 to 100
//
// Login Score (0-30)
//   2 pts per login, capped at 15 logins (30 pts max)
//
// Recency Score (0-30)
//   0-7 days since last login: 30 pts
//   8-14 days: 20 pts
//   15-30 days: 10 pts
//   31+ days or never logged in: 0 pts
//
// Onboarding Score (0-25)
//   Proportional to steps completed: (completedSteps / 7) * 25
//
// Ticket Score (0-8)
//   2 pts per submitted Ask CPR ticket, max 4 tickets (8 pts)
//
// Message Score (0-7)
//   1 pt per message sent by the athlete, max 7 messages (7 pts)

export function computeEngagementScore(opts: {
  totalLogins: number;
  lastLogin: string;
  onboardingSteps: number;
  totalTickets: number;
  athleteMessages: number;
}): number {
  const loginScore = Math.min(opts.totalLogins, 15) * 2;

  let recencyScore = 0;
  if (opts.lastLogin) {
    const daysAgo =
      (Date.now() - new Date(opts.lastLogin).getTime()) / (1000 * 60 * 60 * 24);
    if (daysAgo <= 7) recencyScore = 30;
    else if (daysAgo <= 14) recencyScore = 20;
    else if (daysAgo <= 30) recencyScore = 10;
  }

  const onboardingScore = Math.round((opts.onboardingSteps / 7) * 25);
  const ticketScore = Math.min(opts.totalTickets * 2, 8);
  const messageScore = Math.min(opts.athleteMessages, 7);

  return Math.min(loginScore + recencyScore + onboardingScore + ticketScore + messageScore, 100);
}

const ONBOARDING_FIELDS = [
  'Onboarding: Profile Complete',
  'Onboarding: Highlight Video Uploaded',
  'Onboarding: Photos Uploaded',
  'Onboarding: Recruiting Assessment Complete',
  'Onboarding: Parent Orientation Complete',
  'Onboarding: CPR Review Complete',
  'Onboarding: Ready For Promotion',
];

function countOnboardingSteps(fields: Record<string, unknown>): number {
  return ONBOARDING_FIELDS.filter((f) => fields[f] === true).length;
}

const SAMPLE_ACTIVITY: AthleteActivity[] = [
  {
    id: 'recSample1',
    slug: 'jayden-thompson',
    firstName: 'Jayden',
    lastName: 'Thompson',
    gradYear: 2027,
    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastLoginType: 'Parent',
    totalLogins: 12,
    onboardingSteps: 4,
    engagementScore: 79,
    openTicketCount: 1,
    daysSinceLogin: 2,
  },
  {
    id: 'recSample2',
    slug: 'marcus-johnson',
    firstName: 'Marcus',
    lastName: 'Johnson',
    gradYear: 2026,
    lastLogin: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    lastLoginType: 'Athlete',
    totalLogins: 5,
    onboardingSteps: 7,
    engagementScore: 46,
    openTicketCount: 0,
    daysSinceLogin: 18,
  },
  {
    id: 'recSample3',
    slug: 'tyler-chen',
    firstName: 'Tyler',
    lastName: 'Chen',
    gradYear: 2028,
    lastLogin: '',
    lastLoginType: '',
    totalLogins: 0,
    onboardingSteps: 1,
    engagementScore: 4,
    openTicketCount: 0,
    daysSinceLogin: null,
  },
  {
    id: 'recSample4',
    slug: 'aiden-rodriguez',
    firstName: 'Aiden',
    lastName: 'Rodriguez',
    gradYear: 2029,
    lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastLoginType: 'Athlete',
    totalLogins: 8,
    onboardingSteps: 5,
    engagementScore: 68,
    openTicketCount: 2,
    daysSinceLogin: 5,
  },
];

const ACTIVITY_FIELDS = [
  'Slug',
  'First Name',
  'Last Name',
  'Graduation Year',
  'Last Login',
  'Last Login Type',
  'Total Logins',
  'Onboarding: Profile Complete',
  'Onboarding: Highlight Video Uploaded',
  'Onboarding: Photos Uploaded',
  'Onboarding: Recruiting Assessment Complete',
  'Onboarding: Parent Orientation Complete',
  'Onboarding: CPR Review Complete',
  'Onboarding: Ready For Promotion',
];

export async function getAthleteActivity(): Promise<{
  athletes: AthleteActivity[];
  live: boolean;
}> {
  if (isOpenStaging()) return { athletes: SAMPLE_ACTIVITY, live: false };

  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return { athletes: SAMPLE_ACTIVITY, live: false };

  const fieldParams = ACTIVITY_FIELDS.map(
    (f) => `fields[]=${encodeURIComponent(f)}`
  ).join('&');
  const url =
    `https://api.airtable.com/v0/${BASE}/${ATHLETES}` +
    `?${fieldParams}&sort[0][field]=Last+Name&sort[0][direction]=asc&maxRecords=200`;

  try {
    const [athleteRes, ticketsResult, messagesResult] = await Promise.all([
      fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }),
      getAllTickets(),
      getAllMessages(),
    ]);

    if (!athleteRes.ok) return { athletes: [], live: true };

    const athleteData = (await athleteRes.json()) as {
      records?: { id: string; fields: Record<string, unknown> }[];
    };

    // Aggregate ticket counts by slug
    const openTicketsBySlug: Record<string, number> = {};
    const allTicketsBySlug: Record<string, number> = {};
    for (const t of ticketsResult.tickets) {
      allTicketsBySlug[t.athleteSlug] = (allTicketsBySlug[t.athleteSlug] ?? 0) + 1;
      if (t.status === 'Open') {
        openTicketsBySlug[t.athleteSlug] = (openTicketsBySlug[t.athleteSlug] ?? 0) + 1;
      }
    }

    // Count athlete-sent messages by slug
    const athleteMessagesBySlug: Record<string, number> = {};
    for (const m of messagesResult.messages) {
      if (m.sender === 'Athlete') {
        athleteMessagesBySlug[m.athleteSlug] =
          (athleteMessagesBySlug[m.athleteSlug] ?? 0) + 1;
      }
    }

    const athletes: AthleteActivity[] = (athleteData.records ?? []).map((r) => {
      const f = r.fields;
      const slug = String(f['Slug'] ?? '');
      const lastLogin = String(f['Last Login'] ?? '');
      const totalLogins = Number(f['Total Logins'] ?? 0);
      const onboardingSteps = countOnboardingSteps(f);

      let daysSinceLogin: number | null = null;
      if (lastLogin) {
        daysSinceLogin = Math.floor(
          (Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      const engagementScore = computeEngagementScore({
        totalLogins,
        lastLogin,
        onboardingSteps,
        totalTickets: allTicketsBySlug[slug] ?? 0,
        athleteMessages: athleteMessagesBySlug[slug] ?? 0,
      });

      return {
        id: r.id,
        slug,
        firstName: String(f['First Name'] ?? ''),
        lastName: String(f['Last Name'] ?? ''),
        gradYear: Number(f['Graduation Year'] ?? 0),
        lastLogin,
        lastLoginType: String(f['Last Login Type'] ?? ''),
        totalLogins,
        onboardingSteps,
        engagementScore,
        openTicketCount: openTicketsBySlug[slug] ?? 0,
        daysSinceLogin,
      };
    });

    return { athletes, live: true };
  } catch {
    return { athletes: [], live: true };
  }
}
