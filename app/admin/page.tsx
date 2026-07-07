import '../landing.css';
import './admin.css';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getOutreach } from '@/lib/outreach';
import { getAllTickets, getAllMessages, getResources, getUpcomingEvents } from '@/lib/sections-data';
import { getAthleteActivity } from '@/lib/activity-data';
import { getAthletes } from '@/lib/athletes';
import { getCoaches } from '@/lib/coaches';
import { verifyAdminSession } from '@/lib/admin-auth';
import AdminClient from './AdminClient';
import AdminTickets from './AdminTickets';
import AdminMessages from './AdminMessages';
import AdminActivity from './AdminActivity';
import AdminContentRelevance from './AdminContentRelevance';
import AdminRegistrants from './AdminRegistrants';
import CommunicationCenter from '@/components/communication-center/CommunicationCenter';
import { getCommunicationAnnouncements, getCommunicationNotifications } from '@/lib/communication-center-data';
import AdminCollection from './AdminCollection';
import { getCollectionDef, isCollectionId } from '@/lib/admin-collections-schema';
import AdminTeam from './AdminTeam';
import { listAdminTeamMembers } from '@/lib/admin-team';
import { listCollection } from '@/lib/admin-collections';
import AdminDashboard from './AdminDashboard';
import AdminCommandPalette from './AdminCommandPalette';
import AdminExecutiveBrief from './AdminExecutiveBrief';
import AdminEosSidebar from './AdminEosSidebar';
import AdminRecommendedFirstItem from './AdminRecommendedFirstItem';
import {
  briefFromDecision,
  collectionDecisionItem,
  createExecutiveDecisionContext,
  recommendedFromDecision,
  type RankedDecisionItem,
} from './executive-decision-context';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'CPR Admin',
  robots: { index: false, follow: false },
};

function collectionBrief(tab: string, count: number, storageLive: boolean, topStatus?: [string, number]) {
  const statusDetail = topStatus ? `${topStatus[1]} records are currently ${topStatus[0]}.` : `${count} total records are available.`;
  const shared = {
    confidence: storageLive ? 'High' : 'Publishing setup needed',
    successMetric: 'Priority record advanced',
  };
  const briefs: Record<string, Omit<React.ComponentProps<typeof AdminExecutiveBrief>, 'confidence' | 'successMetric'>> = {
    schools: {
      eyebrow: 'Opportunity',
      title: 'Focus the school list around the next recruiting decision.',
      situation: `${count} school ${count === 1 ? 'record is' : 'records are'} available. ${statusDetail}`,
      recommendation: 'Start with the highest-fit or least-updated program before adding more schools.',
      why: 'A smaller, current target list creates better outreach decisions than a larger stale directory.',
      nextBestAction: 'Review the top target school',
      expectedOutcome: 'The next coach or program action is clearer.',
      actionHref: '/admin?tab=schools',
      actionLabel: 'Review schools',
    },
    'recruitment-tracker': {
      eyebrow: 'Opportunity',
      title: 'Advance the recruiting relationship most likely to move.',
      situation: `${count} recruiting pipeline ${count === 1 ? 'entry is' : 'entries are'} being tracked. ${statusDetail}`,
      recommendation: 'Review the entry with the most urgent next step before creating new pipeline rows.',
      why: 'Pipeline momentum depends on timely follow-up, not record volume.',
      nextBestAction: 'Advance one pipeline item',
      expectedOutcome: 'One athlete-program relationship has a named next owner and next step.',
      actionHref: '/admin?tab=recruitment-tracker',
      actionLabel: 'Review pipeline',
    },
    responses: {
      eyebrow: 'Opportunity',
      title: 'Turn coach responses into a decision.',
      situation: `${count} coach ${count === 1 ? 'response is' : 'responses are'} logged. ${statusDetail}`,
      recommendation: 'Start with the warmest response and decide whether to follow up, close, or escalate.',
      why: 'Responses lose value when they are recorded but not converted into action.',
      nextBestAction: 'Act on the warmest response',
      expectedOutcome: 'A coach response becomes a follow-up, opportunity, or closed loop.',
      actionHref: '/admin?tab=responses',
      actionLabel: 'Review responses',
    },
    offers: {
      eyebrow: 'Opportunity',
      title: 'Clarify the offer path before more outreach.',
      situation: `${count} offer ${count === 1 ? 'record is' : 'records are'} available. ${statusDetail}`,
      recommendation: 'Review open or under-review offers first so families understand options and tradeoffs.',
      why: 'Offers are high-impact decisions that require clarity, timing, and owner guidance.',
      nextBestAction: 'Review the highest-value offer',
      expectedOutcome: 'The family knows whether to accept, decline, negotiate, or wait.',
      actionHref: '/admin?tab=offers',
      actionLabel: 'Review offers',
    },
    'email-templates': {
      eyebrow: 'Health',
      title: 'Keep communication templates ready before urgency arrives.',
      situation: `${count} email ${count === 1 ? 'template is' : 'templates are'} available. ${statusDetail}`,
      recommendation: 'Review the template most likely to be used for the next owner communication.',
      why: 'Prepared messaging reduces delay when families or coaches need a timely answer.',
      nextBestAction: 'Review the most-used template',
      expectedOutcome: 'The next communication can be sent with less friction.',
      actionHref: '/admin?tab=email-templates',
      actionLabel: 'Review templates',
    },
    'site-updates': {
      eyebrow: 'Creation',
      title: 'Decide what needs to be communicated publicly.',
      situation: `${count} update ${count === 1 ? 'record is' : 'records are'} available. ${statusDetail}`,
      recommendation: 'Publish or refine the update that creates the clearest momentum for families and coaches.',
      why: 'Updates are only useful when they reduce uncertainty or create action.',
      nextBestAction: 'Prepare the next update',
      expectedOutcome: 'The audience knows what changed and what to do next.',
      actionHref: '/admin?tab=site-updates',
      actionLabel: 'Review updates',
    },
    'site-events': {
      eyebrow: 'Creation',
      title: 'Use the calendar to create operational focus.',
      situation: `${count} event ${count === 1 ? 'record is' : 'records are'} available. ${statusDetail}`,
      recommendation: 'Review the next dated event and make sure it has a clear audience, location, and action.',
      why: 'Events become operating anchors for recruiting, communication, and family readiness.',
      nextBestAction: 'Review the next event',
      expectedOutcome: 'The next event is ready to promote or clarify.',
      actionHref: '/admin?tab=site-events',
      actionLabel: 'Review events',
    },
    'site-text': {
      eyebrow: 'Creation',
      title: 'Keep key page copy aligned with the owner message.',
      situation: `${count} page text ${count === 1 ? 'block is' : 'blocks are'} available. ${statusDetail}`,
      recommendation: 'Start with the most visible page text before editing lower-traffic copy.',
      why: 'Clear page language reduces repeated questions and improves decision confidence.',
      nextBestAction: 'Review the highest-visibility copy',
      expectedOutcome: 'The public or portal page communicates the next step clearly.',
      actionHref: '/admin?tab=site-text',
      actionLabel: 'Review pages',
    },
    'media-library': {
      eyebrow: 'Creation',
      title: 'Make the media library support trust and momentum.',
      situation: `${count} media ${count === 1 ? 'asset is' : 'assets are'} available. ${statusDetail}`,
      recommendation: 'Review the most reusable or least-described asset before adding more images.',
      why: 'Strong visuals only help when they are usable, accessible, and tied to a purpose.',
      nextBestAction: 'Review one reusable asset',
      expectedOutcome: 'A site, update, or campaign has a ready asset with usable context.',
      actionHref: '/admin?tab=media-library',
      actionLabel: 'Review media',
    },
    'site-quotes': {
      eyebrow: 'Creation',
      title: 'Turn proof points into trust-building assets.',
      situation: `${count} quote ${count === 1 ? 'record is' : 'records are'} available. ${statusDetail}`,
      recommendation: 'Review the strongest proof point and decide where it should appear.',
      why: 'Testimonials create confidence only when they are current, credible, and placed well.',
      nextBestAction: 'Review the strongest quote',
      expectedOutcome: 'One proof point is ready to support a page, update, or conversation.',
      actionHref: '/admin?tab=site-quotes',
      actionLabel: 'Review assets',
    },
  };
  const brief = briefs[tab] ?? {
    eyebrow: 'Operations',
    title: 'Review the record that most needs a decision.',
    situation: `${count} records are available. ${statusDetail}`,
    recommendation: 'Start with the item most likely to unlock a next step before adding new records.',
    why: 'Mission Control should turn records into decisions instead of encouraging passive list management.',
    nextBestAction: 'Review the first priority record',
    expectedOutcome: 'One item is updated, closed, assigned, or confirmed as stable.',
    actionHref: `/admin?tab=${tab}`,
    actionLabel: 'Review records',
  };
  return { ...brief, ...shared };
}

function rankedTicketItem(tickets: Awaited<ReturnType<typeof getAllTickets>>['tickets']): RankedDecisionItem {
  const unresolved = [...tickets]
    .filter((ticket) => ticket.status.toLowerCase() !== 'resolved' && ticket.status.toLowerCase() !== 'closed')
    .sort((a, b) => new Date(a.dateSubmitted || 0).getTime() - new Date(b.dateSubmitted || 0).getTime());
  const ticket = unresolved[0];
  if (!ticket) {
    return {
      title: 'No support issue needs action right now',
      reason: 'No unresolved ticket is visible in the current queue.',
      action: 'Return to Attention and work the next highest-value decision.',
      outcome: 'Owner time stays focused on work with a clearer risk signal.',
      trigger: 'Open-ticket count is zero.',
      risk: 'Low risk; avoid creating support work when no one is waiting.',
      followUpMeasurement: 'Support queue remains at zero unresolved tickets.',
      href: '/admin?tab=tickets',
      actionLabel: 'Return to Attention',
      urgency: 'low',
    };
  }
  return {
    title: ticket.subject || `${ticket.athleteSlug} support request`,
    reason: `${ticket.athleteSlug || 'A person'} has an unresolved ${ticket.status.toLowerCase()} ticket that should be owned before lower-risk work.`,
    action: 'Open this ticket, decide the answer or owner, and record the next step.',
    outcome: 'One person knows what happens next and the trust risk is reduced.',
    trigger: `Oldest unresolved ticket submitted ${ticket.dateSubmitted || 'without a date'}.`,
    risk: 'Reduces visible support delay and prevents unanswered requests from becoming trust issues.',
    followUpMeasurement: 'Ticket status changes to resolved, closed, or has clear owner notes.',
    href: '/admin?tab=tickets',
    actionLabel: 'Review priority ticket',
    urgency: 'high',
  };
}

function rankedMessageItem(messages: Awaited<ReturnType<typeof getAllMessages>>['messages']): RankedDecisionItem {
  const unread = [...messages]
    .filter((message) => !message.readStatus)
    .sort((a, b) => new Date(a.dateSent || 0).getTime() - new Date(b.dateSent || 0).getTime());
  const message = unread[0];
  if (!message) {
    return {
      title: 'No direct reply is waiting',
      reason: 'No unread family or athlete message is visible.',
      action: 'Use the time for opportunity creation or a useful public update.',
      outcome: 'Communication stays intentional instead of reactive.',
      trigger: 'Unread-message count is zero.',
      risk: 'Low risk; avoid broadcast noise when no direct need is waiting.',
      followUpMeasurement: 'Inbox remains clear after the next decision cycle.',
      href: '/admin?tab=messages',
      actionLabel: 'Return to Attention',
      urgency: 'low',
    };
  }
  return {
    title: `${message.sender || 'Sender'} needs a reply`,
    reason: `${message.athleteSlug || 'A family'} has the oldest unread message in the inbox.`,
    action: 'Reply with the next step, or move the issue into tickets if it needs tracking.',
    outcome: 'The sender receives direction and the conversation no longer blocks progress.',
    trigger: `Unread message from ${message.dateSent || 'the queue'}.`,
    risk: 'Reduces response-time risk and prevents direct needs from being buried by broadcast work.',
    followUpMeasurement: 'Unread message count decreases or the thread has a documented next step.',
    href: '/admin?tab=messages',
    actionLabel: 'Open priority thread',
    urgency: 'high',
  };
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = (await cookies()).get('cpr_admin_session')?.value || '';
  const admin = verifyAdminSession(session);
  if (!admin) redirect('/admin/login');

  const { tab } = await searchParams;
  const activeTab = tab ?? 'dashboard';
  let mainContent: React.ReactNode;
  let decisionSignals: Array<{ label: string; value: string | number; detail: string }> = [];

  const athletesPromise = getAthletes();

  if (!tab || tab === 'dashboard') {
    const [athletes, messagesResult, ticketsResult, eventsResult, outreachResult] = await Promise.all([
      athletesPromise,
      getAllMessages(),
      getAllTickets(),
      getUpcomingEvents(),
      getOutreach(),
    ]);
    const live = athletes.live && messagesResult.live && ticketsResult.live && eventsResult.live && outreachResult.live;
    const dashboardSummary = {
      applications: athletes.rows.filter((athlete) => athlete.status.toLowerCase() === 'pending').length,
      unreadMessages: messagesResult.messages.filter((message) => !message.readStatus).length,
      unsignedAgreements: athletes.rows.filter((athlete) => !athlete.termsAgreed && !athlete.agreementSubmitted).length,
      unpaid: athletes.rows.filter((athlete) => !athlete.feeStage1).length,
      upcomingEvents: eventsResult.events.length,
    };
    decisionSignals = [
      { label: 'Players', value: athletes.rows.length, detail: `${dashboardSummary.applications} applications pending` },
      { label: 'Payments due', value: dashboardSummary.unpaid, detail: `${dashboardSummary.unsignedAgreements} unsigned agreements` },
      { label: 'Messages', value: dashboardSummary.unreadMessages, detail: 'Unread family or athlete messages' },
      { label: 'Events', value: dashboardSummary.upcomingEvents, detail: live ? 'Live services connected' : 'Sample data visible' },
    ];
    const attentionSignals =
      dashboardSummary.applications +
      dashboardSummary.unreadMessages +
      ticketsResult.tickets.filter((ticket) => ticket.status.toLowerCase() !== 'resolved').length +
      dashboardSummary.unsignedAgreements;
    const attentionContext = createExecutiveDecisionContext({
      screen: 'Executive Brief',
      signals: [
        { label: 'Active signals', value: attentionSignals, detail: 'people, messages, tickets, and agreements', urgency: attentionSignals ? 'high' : 'low' },
        { label: 'Unread messages', value: dashboardSummary.unreadMessages, detail: 'direct people waiting' },
        { label: 'Unsigned agreements', value: dashboardSummary.unsignedAgreements, detail: 'onboarding friction' },
      ],
      interpretation: attentionSignals ? 'Start with the decision carrying the clearest risk.' : 'Use the quiet window to create momentum.',
      recommendation: 'Work the Decision Workspace from top to bottom before opening secondary tools.',
      nextBestAction: 'Open the first Next Best Action',
      confidence: live ? 'High' : 'Sample data',
      expectedOutcome: 'The highest-risk item is assigned, resolved, or moved forward before reporting work begins.',
      successMetric: 'Top priority reduced or owner assigned',
      urgency: attentionSignals ? 'high' : 'low',
      reasonForPriority: 'Mission Control is ranking explicit people, trust, payment, and opportunity signals before general reporting.',
      followUpMeasurement: 'The top action should disappear, reduce count, or show a named owner after completion.',
    });
    mainContent = (
      <>
        <AdminExecutiveBrief {...briefFromDecision(attentionContext, '#needs-attention', 'Review actions')} />
        <AdminDashboard
          athletes={athletes.rows}
          messages={messagesResult.messages}
          tickets={ticketsResult.tickets}
          events={eventsResult.events}
          outreach={outreachResult.rows}
          pulseEvents={[]}
          pulseLive={false}
          live={live}
        />
      </>
    );
  } else if (tab === 'tickets') {
    const result = await getAllTickets();
    const open = result.tickets.filter((ticket) => ticket.status.toLowerCase() !== 'resolved').length;
    const priorityTicket = rankedTicketItem(result.tickets);
    decisionSignals = [
      { label: 'Tickets', value: result.tickets.length, detail: `${open} open` },
      { label: 'Data mode', value: result.live ? 'Live' : 'Sample', detail: 'Ask CPR support queue' },
    ];
    mainContent = (
      <>
        <AdminExecutiveBrief
          eyebrow="Attention"
          title="Decide which support issue needs ownership now."
          situation={`${open} open Ask CPR ${open === 1 ? 'ticket is' : 'tickets are'} waiting for a response or resolution.`}
          recommendation="Resolve or assign the oldest unresolved ticket before opening lower-risk work."
          why="Tickets represent people explicitly asking for help; delay creates the most visible trust risk."
          nextBestAction="Clear the oldest open ticket"
          expectedOutcome="A family, athlete, or staff member knows what happens next."
          confidence={result.live ? 'High' : 'Sample data'}
          successMetric="Open ticket count reduced"
          actionHref="/admin?tab=tickets"
          actionLabel="Review tickets"
        />
        <AdminRecommendedFirstItem
          {...recommendedFromDecision(priorityTicket)}
        />
        <AdminTickets tickets={result.tickets} live={result.live} showHeader={false} />
      </>
    );
  } else if (tab === 'messages') {
    const result = await getAllMessages();
    const unread = result.messages.filter((message) => !message.readStatus).length;
    const priorityMessage = rankedMessageItem(result.messages);
    decisionSignals = [
      { label: 'Messages', value: result.messages.length, detail: `${unread} unread` },
      { label: 'Latest sender', value: result.messages[0]?.sender || 'None', detail: result.live ? 'Live inbox' : 'Sample inbox' },
    ];
    mainContent = (
      <>
        <AdminExecutiveBrief
          eyebrow="People Waiting"
          title="Protect response time before creating new work."
          situation={`${unread} unread ${unread === 1 ? 'message is' : 'messages are'} waiting in the family and athlete inbox.`}
          recommendation="Answer unread messages first, then move any issue that requires tracking into tickets."
          why="Messages are the fastest signal that someone needs direction, confidence, or a next step."
          nextBestAction="Reply to the oldest unread message"
          expectedOutcome="The sender receives direction and the conversation no longer blocks progress."
          confidence={result.live ? 'High' : 'Sample data'}
          successMetric="Unread message count reduced"
          actionHref="/admin?tab=messages"
          actionLabel="Open inbox"
        />
        <AdminRecommendedFirstItem
          {...recommendedFromDecision(priorityMessage)}
        />
        <AdminMessages messages={result.messages} live={result.live} showHeader={false} />
      </>
    );
  } else if (tab === 'communication') {
    const [messagesResult, ticketsResult, announcementsResult, notificationsResult] = await Promise.all([
      getAllMessages(),
      getAllTickets(),
      getCommunicationAnnouncements(),
      getCommunicationNotifications(),
    ]);
    const unread = messagesResult.messages.filter((message) => !message.readStatus).length;
    const openTickets = ticketsResult.tickets.filter((ticket) => ticket.status.toLowerCase() !== 'resolved').length;
    decisionSignals = [
      { label: 'Messages', value: messagesResult.messages.length, detail: `${unread} unread` },
      { label: 'Tickets', value: ticketsResult.tickets.length, detail: `${openTickets} open` },
      { label: 'Announcements', value: announcementsResult.announcements.length, detail: 'Owner communication posts' },
      { label: 'Notifications', value: notificationsResult.notifications.length, detail: 'Communication center alerts' },
    ];
    mainContent = (
      <>
        <AdminExecutiveBrief
          eyebrow="Attention"
          title="Decide what needs to be communicated next."
          situation={`${unread} unread message${unread === 1 ? '' : 's'}, ${openTickets} open support item${openTickets === 1 ? '' : 's'}, and ${announcementsResult.announcements.length} announcement${announcementsResult.announcements.length === 1 ? '' : 's'} are visible.`}
          recommendation={unread || openTickets ? 'Respond to people waiting before publishing new announcements.' : 'Use announcements only when they create clarity or momentum.'}
          why="Communication health depends on resolving active needs before adding more noise."
          nextBestAction={unread ? 'Reply to the oldest unread thread' : openTickets ? 'Resolve the oldest support item' : 'Prepare the next useful update'}
          expectedOutcome="The audience knows what changed, what matters, and what to do next."
          confidence={messagesResult.live && ticketsResult.live && announcementsResult.live && notificationsResult.live ? 'High' : 'Sample data'}
          successMetric="Open communication queue reduced"
          actionHref="/admin?tab=communication"
          actionLabel="Review communication"
        />
        <AdminRecommendedFirstItem
          title={unread || openTickets ? 'People are waiting' : 'No action needed right now'}
          reason={unread ? 'Unread messages should be answered before broadcast work.' : openTickets ? 'Open support items represent unresolved trust risk.' : 'No urgent communication backlog is visible.'}
          action={unread ? 'Open Messages and reply to the oldest thread.' : openTickets ? 'Open Support Tickets and resolve the oldest item.' : 'Draft an update only if it clarifies a current priority.'}
          outcome={unread || openTickets ? 'One person gets a clear next step.' : 'Communication stays intentional instead of noisy.'}
          href={unread ? '/admin?tab=messages' : openTickets ? '/admin?tab=tickets' : '/admin?tab=site-updates'}
          actionLabel={unread ? 'Open inbox' : openTickets ? 'Open tickets' : 'Review updates'}
        />
        <CommunicationCenter
          config={{
            portalName: 'CPR Communication Center',
            primaryColor: '#0C0C0A',
            accentColor: '#A81D20',
            supportLabel: 'Coach Mike',
          }}
          messages={messagesResult.messages.map(message => ({
            id: message.id,
            subjectId: message.athleteSlug,
            sender: message.sender,
            body: message.messageBody,
            createdAt: message.dateSent,
            read: message.readStatus,
          }))}
          feedback={ticketsResult.tickets.map(ticket => ({
            id: ticket.id,
            subjectId: ticket.athleteSlug,
            subject: ticket.subject,
            body: ticket.message,
            status: ticket.status,
            createdAt: ticket.dateSubmitted,
            response: ticket.adminNotes,
          }))}
          announcements={announcementsResult.announcements}
          notifications={notificationsResult.notifications}
          live={messagesResult.live && ticketsResult.live && announcementsResult.live && notificationsResult.live}
          showHero={false}
        />
      </>
    );
  } else if (tab === 'activity') {
    const { athletes, live } = await getAthleteActivity();
    const averageEngagement = athletes.length
      ? Math.round(athletes.reduce((total, athlete) => total + athlete.engagementScore, 0) / athletes.length)
      : 0;
    const staleLogins = athletes.filter((athlete) => athlete.daysSinceLogin === null || athlete.daysSinceLogin > 14).length;
    decisionSignals = [
      { label: 'Tracked athletes', value: athletes.length, detail: `${staleLogins} need login attention` },
      { label: 'Avg engagement', value: averageEngagement, detail: 'Computed from login, onboarding, tickets, and messages' },
      { label: 'Data mode', value: live ? 'Live' : 'Sample', detail: 'Activity and report context' },
    ];
    mainContent = (
      <>
        <AdminExecutiveBrief
          eyebrow="Health"
          title="Find the engagement signal that needs intervention."
          situation={`${athletes.length} athlete${athletes.length === 1 ? '' : 's'} are tracked, with ${staleLogins} inactive for 14+ days.`}
          recommendation={staleLogins ? 'Start with the longest inactive athlete before reviewing general activity.' : 'Use reports to confirm the program is stable, then return to opportunities.'}
          why="Engagement issues become trust and readiness issues when they sit unnoticed."
          nextBestAction={staleLogins ? 'Review the most inactive athlete' : 'Confirm health and move on'}
          expectedOutcome={staleLogins ? 'One inactive athlete receives a clear outreach or support action.' : 'The owner avoids unnecessary reporting work.'}
          confidence={live ? 'High' : 'Sample data'}
          successMetric="Inactive count reduced or confirmed stable"
          actionHref="/admin?tab=activity"
          actionLabel="Review reports"
        />
        <AdminRecommendedFirstItem
          title={staleLogins ? `${staleLogins} inactive athlete${staleLogins === 1 ? '' : 's'}` : 'No action needed right now'}
          reason={staleLogins ? 'Long inactivity is the strongest report signal requiring owner action.' : 'Engagement signals do not show urgent owner intervention.'}
          action={staleLogins ? 'Sort by last login and contact the oldest inactive athlete first.' : 'Use the saved time on opportunity creation.'}
          outcome={staleLogins ? 'One engagement risk is addressed.' : 'Reports remain a confirmation layer, not a distraction.'}
          href="/admin?tab=activity"
          actionLabel="Review first signal"
        />
        <AdminActivity athletes={athletes} live={live} showHeader={false} />
      </>
    );
  } else if (tab === 'content') {
    const [resourcesResult, eventsResult, activityResult] = await Promise.all([
      getResources(),
      getUpcomingEvents(),
      getAthleteActivity(),
    ]);
    const gradYears = [
      ...new Set(activityResult.athletes.map((a) => a.gradYear).filter((y) => y > 0)),
    ].sort((a, b) => a - b);
    decisionSignals = [
      { label: 'Resources', value: resourcesResult.resources.length, detail: `${gradYears.length} grad-year groups` },
      { label: 'Events', value: eventsResult.events.length, detail: 'Upcoming event relevance' },
      { label: 'Data mode', value: resourcesResult.live ? 'Live' : 'Sample', detail: 'Content relevance context' },
    ];
    mainContent = (
      <>
        <AdminExecutiveBrief
          eyebrow="Content Readiness"
          title="Make sure the right people see the right resources."
          situation={`${resourcesResult.resources.length} resources and ${eventsResult.events.length} events are checked across ${gradYears.length} grad-year group${gradYears.length === 1 ? '' : 's'}.`}
          recommendation="Review the content bucket with the clearest gap before editing unrelated site content."
          why="Content readiness reduces repeated questions and makes family guidance feel timely."
          nextBestAction="Review the first readiness gap"
          expectedOutcome="One audience group has a clearer resource or event path."
          confidence={resourcesResult.live ? 'High' : 'Sample data'}
          successMetric="One content gap resolved"
          actionHref="/admin?tab=content"
          actionLabel="Review readiness"
        />
        <AdminRecommendedFirstItem
          title={gradYears.length ? `${gradYears.length} audience group${gradYears.length === 1 ? '' : 's'} to check` : 'No action needed right now'}
          reason={gradYears.length ? 'Each audience group should have the resources and events needed for the current season.' : 'No grad-year groups are currently active in the data.'}
          action={gradYears.length ? 'Start with the group showing a content gap.' : 'Return to the Decision Workspace until audience data appears.'}
          outcome={gradYears.length ? 'One audience group becomes easier to guide.' : 'No unnecessary content work is created.'}
          href="/admin?tab=content"
          actionLabel="Review first gap"
        />
        <AdminContentRelevance
          resources={resourcesResult.resources}
          events={eventsResult.events}
          gradYears={gradYears}
          live={resourcesResult.live}
          showHeader={false}
        />
      </>
    );
  } else if (tab === 'registrants') {
    const athletes = await athletesPromise;
    const pending = athletes.rows.filter((athlete) => athlete.status.toLowerCase() === 'pending').length;
    const pendingUpdates = athletes.rows.reduce((total, athlete) => total + athlete.pendingUpdates.length, 0);
    decisionSignals = [
      { label: 'Registrants', value: athletes.rows.length, detail: `${pending} pending review` },
      { label: 'Profile updates', value: pendingUpdates, detail: 'Family-submitted changes awaiting owner review' },
      { label: 'Data mode', value: athletes.live ? 'Live' : 'Sample', detail: 'Player application queue' },
    ];
    mainContent = (
      <>
        <AdminExecutiveBrief
          eyebrow="People"
          title="Decide who should move forward today."
          situation={`${pending} pending ${pending === 1 ? 'registrant needs' : 'registrants need'} review, with ${pendingUpdates} submitted profile ${pendingUpdates === 1 ? 'update' : 'updates'} waiting.`}
          recommendation="Review pending applicants and profile changes before outreach or reporting."
          why="Applicant decisions unlock downstream communication, payment, documents, and recruiting actions."
          nextBestAction="Review pending registrants"
          expectedOutcome="Eligible players are advanced and blocked profiles receive a clear next step."
          confidence={athletes.live ? 'High' : 'Sample data'}
          successMetric="Pending queue reduced"
          actionHref="/admin?tab=registrants"
          actionLabel="Review people"
        />
        <AdminRecommendedFirstItem
          title={pending ? `${pending} pending registrant${pending === 1 ? '' : 's'}` : 'No action needed right now'}
          reason={pending ? 'Pending applicants unlock downstream communication, payments, and recruiting actions.' : 'The registrant queue has no obvious owner decision waiting.'}
          action={pending ? 'Review the oldest pending applicant or profile update first.' : 'Use this time to strengthen the next opportunity or communication.'}
          outcome={pending ? 'One applicant is advanced, clarified, or assigned.' : 'Momentum is created without inventing unnecessary admin work.'}
          href="/admin?tab=registrants"
          actionLabel={pending ? 'Review first registrant' : 'Keep moving'}
        />
        <AdminRegistrants athletes={athletes.rows} live={athletes.live} showHeader={false} />
      </>
    );
  } else if (tab === 'outreach') {
    const [outreach, athletes, coaches] = await Promise.all([
      getOutreach(),
      getAthletes(),
      getCoaches(),
    ]);
    const followUps = outreach.rows.filter((item) => item.response === 'Follow Up' || item.status === 'Pending').length;
    decisionSignals = [
      { label: 'Outreach rows', value: outreach.rows.length, detail: `${followUps} follow-ups` },
      { label: 'Players', value: athletes.rows.length, detail: 'Recruiting profile pool' },
      { label: 'Coaches', value: coaches.rows.length, detail: 'Coach contact context' },
    ];
    mainContent = (
      <>
        <AdminExecutiveBrief
          eyebrow="Opportunity"
          title="Advance the warmest recruiting conversations."
          situation={`${followUps} coach ${followUps === 1 ? 'follow-up is' : 'follow-ups are'} ready across ${outreach.rows.length} outreach records.`}
          recommendation="Prioritize pending coach responses connected to active players before sending new cold outreach."
          why="Warm conversations decay quickly; acting on them first creates the highest chance of progress."
          nextBestAction="Move one follow-up forward"
          expectedOutcome="A coach interaction becomes a reply, next step, offer path, or documented close."
          confidence={outreach.live && athletes.live && coaches.live ? 'High' : 'Sample data'}
          successMetric="Follow-up count reduced"
          actionHref="/admin?tab=outreach"
          actionLabel="Review outreach"
        />
        <AdminRecommendedFirstItem
          title={followUps ? `${followUps} warm follow-up${followUps === 1 ? '' : 's'}` : 'Create a coach signal'}
          reason={followUps ? 'Warm coach conversations are more valuable than new cold outreach.' : 'No active follow-up is waiting, so momentum depends on creating a new signal.'}
          action={followUps ? 'Open the oldest follow-up and send the next touch.' : 'Send or prepare one high-quality coach outreach.'}
          outcome={followUps ? 'One warm opportunity advances.' : 'The pipeline has a fresh signal to measure.'}
          href="/admin?tab=outreach"
          actionLabel="Start outreach"
        />
        <AdminClient rows={outreach.rows} players={athletes.rows} coaches={coaches.rows} />
      </>
    );
  } else if (tab === 'team') {
    const team = await listAdminTeamMembers();
    decisionSignals = [
      { label: 'Team members', value: team.members.length, detail: admin.role === 'owner' ? 'Owner can invite' : 'Invite restricted' },
      { label: 'Data mode', value: team.live ? 'Live' : 'Sample', detail: 'Admin access context' },
    ];
    mainContent = (
      <>
        <AdminExecutiveBrief
          eyebrow="Platform"
          title="Keep the operating team ready and accountable."
          situation={`${team.members.length} team ${team.members.length === 1 ? 'member is' : 'members are'} configured for Mission Control.`}
          recommendation={admin.role === 'owner' ? 'Review owner and staff access before inviting another operator.' : 'Confirm your current access and ask an owner to adjust roles if needed.'}
          why="Team access determines who can see sensitive people, communication, payment, and operating data."
          nextBestAction={admin.role === 'owner' ? 'Review team access' : 'Confirm your role'}
          expectedOutcome="The right people have access and unnecessary permission risk is reduced."
          confidence={team.live ? 'High' : 'Sample data'}
          successMetric="Team access confirmed"
          actionHref="/admin?tab=team"
          actionLabel="Review team"
        />
        <AdminRecommendedFirstItem
          title={team.members.length ? 'Confirm the highest-privilege account first' : 'Recommended first item'}
          reason={team.members.length ? 'Owner and staff roles control the most sensitive operating surfaces.' : 'No team members are listed, so ownership access should be confirmed before broader use.'}
          action={team.members.length ? 'Review the owner account and remove stale access if needed.' : 'Invite or confirm the owner account before adding staff.'}
          outcome="Mission Control remains secure without slowing daily work."
          href="/admin?tab=team"
          actionLabel="Review access"
        />
        <AdminTeam
          canInvite={admin.role === 'owner'}
          initialMembers={team.members}
          live={team.live}
          showHeader={false}
        />
      </>
    );
  } else if (tab && isCollectionId(tab)) {
    const def = getCollectionDef(tab)!;
    const [athletes, items] = await Promise.all([athletesPromise, listCollection(tab)]);
    const athleteOptions = athletes.rows.map((a) => ({
      label: `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim() || a.slug,
      value: a.slug,
    }));
    const storageLive = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
    const statusCounts = items.reduce<Record<string, number>>((counts, item) => {
      if (!def.statusField) return counts;
      const status = String(item[def.statusField] || 'Unset');
      counts[status] = (counts[status] ?? 0) + 1;
      return counts;
    }, {});
    const topStatus = Object.entries(statusCounts).sort((a, b) => b[1] - a[1])[0];
    decisionSignals = [
      { label: def.label, value: items.length, detail: def.description },
      { label: 'Player options', value: athleteOptions.length, detail: 'Available for owner-managed records' },
      { label: 'Publishing', value: storageLive ? 'Live' : 'Setup needed', detail: 'Collection publishing readiness' },
      ...(topStatus ? [{ label: 'Top status', value: topStatus[0], detail: `${topStatus[1]} records` }] : []),
    ];
    const collectionContent = (
      <AdminCollection def={def} initialItems={items} athleteOptions={athleteOptions} live={storageLive} showHeader={false} />
    );
    const recommendedFirst = (
      <AdminRecommendedFirstItem
        {...recommendedFromDecision(collectionDecisionItem(def, items, `/admin?tab=${tab}`))}
      />
    );
    if (tab === 'fee-agreements') {
      mainContent = (
        <>
          <AdminExecutiveBrief
            eyebrow="Health"
            title="Remove financial and agreement friction."
            situation={`${items.length} payment or agreement ${items.length === 1 ? 'record is' : 'records are'} available for review.`}
            recommendation="Start with unsigned, unpaid, or unclear agreements before adding new records."
            why="Agreement friction blocks onboarding, trust, and service delivery more than general reporting does."
            nextBestAction="Review the riskiest agreement"
            expectedOutcome="The next person knows whether to sign, pay, correct, or proceed."
            confidence={storageLive ? 'High' : 'Publishing setup needed'}
            successMetric="Blocked agreement count reduced"
            actionHref="/admin?tab=fee-agreements"
            actionLabel="Review agreements"
          />
          {recommendedFirst}
          {collectionContent}
        </>
      );
    } else if (tab === 'documents') {
      mainContent = (
        <>
          <AdminExecutiveBrief
            eyebrow="Health"
            title="Clear the documents that block readiness."
            situation={`${items.length} document ${items.length === 1 ? 'record is' : 'records are'} available across ${athleteOptions.length} people.`}
            recommendation="Review missing, unsigned, or stale documents before low-risk uploads."
            why="Document gaps quietly block eligibility, onboarding, agreements, and family confidence."
            nextBestAction="Resolve one blocking document"
            expectedOutcome="A person or program becomes measurably closer to ready."
            confidence={storageLive ? 'High' : 'Publishing setup needed'}
            successMetric="Blocking document count reduced"
            actionHref="/admin?tab=documents"
            actionLabel="Review documents"
          />
          {recommendedFirst}
          {collectionContent}
        </>
      );
    } else {
      const genericBrief = collectionBrief(tab, items.length, storageLive, topStatus);
      mainContent = (
        <>
          <AdminExecutiveBrief {...genericBrief} />
          {recommendedFirst}
          {collectionContent}
        </>
      );
    }
  } else {
    const athletes = await athletesPromise;
    const pending = athletes.rows.filter((athlete) => athlete.status.toLowerCase() === 'pending').length;
    decisionSignals = [
      { label: 'Players', value: athletes.rows.length, detail: `${pending} pending review` },
      { label: 'Data mode', value: athletes.live ? 'Live' : 'Sample', detail: 'Fallback admin registrants context' },
    ];
    mainContent = (
      <>
        <AdminExecutiveBrief
          eyebrow="Attention"
          title="Decide who needs your attention first."
          situation={`${athletes.rows.length} people are visible, with ${pending} pending ${pending === 1 ? 'registrant' : 'registrants'} waiting for review.`}
          recommendation={pending ? 'Start with pending registrants before browsing the full list.' : 'No registrant decision is waiting; return to the Decision Workspace.'}
          why="People decisions unlock communication, payments, documents, and recruiting momentum."
          nextBestAction={pending ? 'Review pending registrants' : 'Return to Attention'}
          expectedOutcome={pending ? 'One person advances or receives a clear next step.' : 'The owner avoids unnecessary list work.'}
          confidence={athletes.live ? 'High' : 'Sample data'}
          successMetric="Pending queue reduced or confirmed clear"
          actionHref="/admin?tab=registrants"
          actionLabel="Review people"
        />
        <AdminRecommendedFirstItem
          title={pending ? `${pending} pending registrant${pending === 1 ? '' : 's'}` : 'No action needed right now'}
          reason={pending ? 'Pending records represent the clearest owner decision in this workspace.' : 'The people list has no obvious owner decision waiting.'}
          action={pending ? 'Open the pending queue and resolve the oldest record first.' : 'Use the saved time on communication or opportunity work.'}
          outcome={pending ? 'One person receives a decision or next step.' : 'Mission Control stays focused on decisions, not browsing.'}
          href="/admin?tab=registrants"
          actionLabel={pending ? 'Review first person' : 'Keep moving'}
        />
        <AdminRegistrants athletes={athletes.rows} live={athletes.live} showHeader={false} />
      </>
    );
  }

  void decisionSignals;

  return (
    <div className="admin-shell">
      <AdminEosSidebar activeTab={activeTab} />
      <main className="amain">
        <AdminCommandPalette permissions={[admin.role || 'admin']} />
        {mainContent}
      </main>
    </div>
  );
}
