import type { AthleteAdmin } from '@/lib/athletes';
import type { Message, PortalEvent, Ticket } from '@/lib/sections-data';
import type { Outreach } from '@/lib/outreach';

type DashboardPulseEvent = {
  product: string;
  title: string;
  detail?: string;
  type: string;
  createdAt: string;
};

type Props = {
  athletes: AthleteAdmin[];
  messages: Message[];
  tickets: Ticket[];
  events: PortalEvent[];
  outreach: Outreach[];
  pulseEvents: DashboardPulseEvent[];
  pulseLive: boolean;
  live: boolean;
};

type DashboardItem = {
  label: string;
  title: string;
  detail: string;
  href: string;
  tone: 'red' | 'amber' | 'blue' | 'green' | 'ink';
};

type HealthSignal = {
  label: string;
  status: string;
  detail: string;
  href: string;
  tone: DashboardItem['tone'];
};

function personName(athlete: AthleteAdmin) {
  return `${athlete.firstName || ''} ${athlete.lastName || ''}`.trim() || athlete.slug || 'Player';
}

function shortDate(value: string) {
  if (!value) return 'No date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function daysSince(value: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.max(0, Math.round((Date.now() - date.getTime()) / 86400000));
}

function isToday(value: string) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.toDateString() === new Date().toDateString();
}

function plural(value: number, singular: string, pluralLabel = `${singular}s`) {
  return `${value} ${value === 1 ? singular : pluralLabel}`;
}

function healthStatus(score: number) {
  if (score >= 86) return 'Strong';
  if (score >= 70) return 'Watch';
  return 'Act';
}

function actionLabel(tone: DashboardItem['tone']) {
  if (tone === 'red') return 'Act now';
  if (tone === 'amber') return 'Stabilize';
  if (tone === 'blue') return 'Follow up';
  if (tone === 'green') return 'Keep moving';
  return 'Review';
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="chassis-section-head">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
    </div>
  );
}

function DecisionHero({
  eyebrow,
  title,
  detail,
  actionHref,
  actionLabel: label,
  actionValue,
  tone,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  actionHref: string;
  actionLabel: string;
  actionValue: string;
  tone: DashboardItem['tone'];
}) {
  return (
    <section className={`chassis-decision-hero tone-${tone}`}>
      <div>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{detail}</p>
      </div>
      <a href={actionHref}>
        <span>{label}</span>
        <strong>{actionValue}</strong>
      </a>
    </section>
  );
}

function ActionStack({ children }: { children: React.ReactNode }) {
  return <div className="chassis-action-stack">{children}</div>;
}

function ActionCard({ href, index, tone, label, title, detail }: DashboardItem & { index: number }) {
  return (
    <a className={`chassis-action-card tone-${tone}`} href={href}>
      <span>{String(index).padStart(2, '0')}</span>
      <div>
        <small>{label}</small>
        <strong>{title}</strong>
        <p>{detail}</p>
      </div>
    </a>
  );
}

function DecisionGrid({ children }: { children: React.ReactNode }) {
  return <div className="chassis-decision-grid">{children}</div>;
}

function DecisionPanel({ children, id }: { children: React.ReactNode; id?: string }) {
  return <section id={id} className="chassis-decision-panel">{children}</section>;
}

function CompactList({ children }: { children: React.ReactNode }) {
  return <div className="chassis-compact-list">{children}</div>;
}

function CompactItem({ href, tone = 'ink', meta, title, detail }: { href: string; tone?: DashboardItem['tone']; meta: string; title: string; detail: string }) {
  return (
    <a className={`chassis-compact-item tone-${tone}`} href={href}>
      <span>{meta}</span>
      <strong>{title}</strong>
      <p>{detail}</p>
    </a>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="chassis-empty-state">{children}</div>;
}

function PanelAction({ href, children }: { href: string; children: React.ReactNode }) {
  return <a className="chassis-panel-action" href={href}>{children}</a>;
}

function HealthStrip({ children }: { children: React.ReactNode }) {
  return <div className="chassis-health-strip">{children}</div>;
}

function HealthCard({ href, tone, label, status, detail }: HealthSignal) {
  return (
    <a className={`chassis-health-card tone-${tone}`} href={href}>
      <span>{label}</span>
      <strong>{status}</strong>
      <p>{detail}</p>
    </a>
  );
}

export default function AdminDashboard({
  athletes,
  messages,
  tickets,
  events,
  outreach,
  pulseEvents,
  pulseLive,
  live,
}: Props) {
  const applications = athletes.filter((athlete) => athlete.status.toLowerCase() === 'pending');
  const unsigned = athletes.filter((athlete) => !athlete.termsAgreed && !athlete.agreementSubmitted);
  const missingDocs = athletes.filter((athlete) => !athlete.transcriptUrl || !athlete.gameplayVideoUrl);
  const unpaid = athletes.filter((athlete) => !athlete.feeStage1);
  const unreadMessages = messages.filter((message) => !message.readStatus);
  const openTickets = tickets.filter((ticket) => ticket.status.toLowerCase() !== 'resolved');
  const followUps = outreach.filter((item) => item.response === 'Follow Up' || item.status === 'Pending');
  const interested = outreach.filter((item) => item.response === 'Interested');
  const viewedProfiles = outreach.filter((item) => item.viewed);
  const completedToday = athletes.filter((athlete) => isToday(athlete.submittedAt)).length;
  const communicationQueue = unreadMessages.length + openTickets.length;
  const familyRisk = unsigned.length + unpaid.length;
  const operatingSignals = applications.length + familyRisk + missingDocs.length + communicationQueue + followUps.length;
  const nextEvent = events[0];
  const campCapacity = athletes.length ? Math.min(98, Math.round((athletes.length / Math.max(athletes.length + 6, 12)) * 100)) : 0;

  const oldestUnsigned = unsigned
    .map((athlete) => ({ athlete, days: daysSince(athlete.submittedAt) ?? 0 }))
    .sort((a, b) => b.days - a.days)[0];

  const topAction: DashboardItem = oldestUnsigned
    ? {
        label: 'Highest-value action',
        title: `Call ${oldestUnsigned.athlete.parentName || personName(oldestUnsigned.athlete)}`,
        detail: `${oldestUnsigned.days} days since registration without a signed agreement.`,
        href: '/admin?tab=fee-agreements',
        tone: 'amber',
      }
    : applications.length
      ? {
          label: 'Highest-value action',
          title: `Decide on ${plural(applications.length, 'application')}`,
          detail: 'Clear approvals, archives, or requests before new family communication goes out.',
          href: '/admin?tab=registrants',
          tone: 'red',
        }
      : missingDocs.length
        ? {
            label: 'Highest-value action',
            title: `Request files for ${plural(missingDocs.length, 'player')}`,
            detail: 'Film or transcript gaps are slowing player readiness.',
            href: '/admin?tab=documents',
            tone: 'blue',
          }
        : {
            label: 'Highest-value action',
            title: 'Publish a short recruiting update',
            detail: 'Use the quiet window to create momentum for families and coaches.',
            href: '/admin?tab=communication',
            tone: 'green',
          };

  const nextBestActions: DashboardItem[] = [
    topAction,
    {
      label: 'Protect trust',
      title: communicationQueue ? `Resolve ${plural(communicationQueue, 'family conversation')}` : 'Keep the family inbox clear',
      detail: communicationQueue ? 'Unread messages and Ask CPR tickets are the fastest trust wins today.' : 'No communication backlog is visible.',
      href: '/admin?tab=messages',
      tone: communicationQueue ? 'blue' : 'green',
    },
    {
      label: 'Create opportunity',
      title: followUps.length ? `Send ${plural(followUps.length, 'coach follow-up')}` : 'Refresh coach outreach',
      detail: followUps.length ? 'Coach conversations need the next touch before interest cools.' : 'Add new coach contacts or profile sends to keep the pipeline warm.',
      href: '/admin?tab=outreach',
      tone: followUps.length ? 'amber' : 'ink',
    },
  ];

  const needsAttention: DashboardItem[] = [
    ...applications.slice(0, 2).map((athlete) => ({
      label: 'Decision needed',
      title: personName(athlete),
      detail: `${athlete.position || 'Player'} ${athlete.gradYear ? `Class of ${athlete.gradYear}` : ''}`.trim(),
      href: '/admin?tab=registrants',
      tone: 'red' as const,
    })),
    ...unsigned.slice(0, 2).map((athlete) => ({
      label: 'Commitment risk',
      title: personName(athlete),
      detail: 'Agreement is not signed yet.',
      href: '/admin?tab=fee-agreements',
      tone: 'amber' as const,
    })),
    ...openTickets.slice(0, 1).map((ticket) => ({
      label: 'Family question',
      title: ticket.subject || 'Open ticket',
      detail: ticket.athleteSlug || 'Family portal',
      href: '/admin?tab=tickets',
      tone: 'blue' as const,
    })),
  ].slice(0, 5);

  const activitySource = pulseLive
    ? pulseEvents.map((event) => ({
        type: event.product.toUpperCase(),
        title: event.title,
        detail: event.detail || event.type,
        date: event.createdAt,
      }))
    : [
        ...athletes.map((athlete) => ({
          type: 'Player',
          title: `${personName(athlete)} registered`,
          detail: athlete.status || 'Application received',
          date: athlete.submittedAt,
        })),
        ...messages.map((message) => ({
          type: 'Message',
          title: `${message.sender || 'Portal'} message`,
          detail: message.athleteSlug,
          date: message.dateSent,
        })),
        ...outreach.map((item) => ({
          type: 'Recruiting',
          title: item.school || item.coach || 'Coach outreach',
          detail: item.response || item.status,
          date: item.dateSent,
        })),
      ]
        .filter((item) => item.date)
        .sort((a, b) => String(b.date).localeCompare(String(a.date)));

  const changedItems = activitySource.filter((item) => isToday(item.date)).slice(0, 3);
  const fallbackChanges = activitySource.slice(0, 3);
  const visibleChanges = changedItems.length ? changedItems : fallbackChanges;

  const readinessScore = Math.max(0, 100 - Math.min(54, missingDocs.length * 9) - Math.min(24, applications.length * 4));
  const responseScore = Math.max(0, 100 - Math.min(70, communicationQueue * 12));
  const momentumScore = Math.max(0, 72 + Math.min(18, interested.length * 3) - Math.min(22, followUps.length * 4));

  const healthSignals: HealthSignal[] = [
    {
      label: 'Readiness',
      status: healthStatus(readinessScore),
      detail: `${readinessScore}% / ${plural(missingDocs.length, 'file gap')}`,
      href: '/admin?tab=documents',
      tone: readinessScore >= 86 ? 'green' : readinessScore >= 70 ? 'amber' : 'red',
    },
    {
      label: 'Family Trust',
      status: healthStatus(responseScore),
      detail: `${responseScore}% / ${plural(communicationQueue, 'open thread')}`,
      href: '/admin?tab=messages',
      tone: responseScore >= 86 ? 'green' : responseScore >= 70 ? 'amber' : 'blue',
    },
    {
      label: 'Momentum',
      status: healthStatus(momentumScore),
      detail: `${interested.length} interested / ${viewedProfiles.length} views`,
      href: '/admin?tab=outreach',
      tone: momentumScore >= 86 ? 'green' : momentumScore >= 70 ? 'ink' : 'amber',
    },
  ];

  const opportunities: DashboardItem[] = [
    {
      label: 'Coach opportunity',
      title: interested.length ? `${plural(interested.length, 'interested coach')}` : 'Create a coach signal',
      detail: interested.length ? 'Turn interest into a scheduled follow-up today.' : 'Send a profile or update to restart coach activity.',
      href: '/admin?tab=outreach',
      tone: interested.length ? 'green' : 'ink',
    },
    {
      label: 'Event opportunity',
      title: nextEvent ? `Build toward ${shortDate(nextEvent.date)}` : 'Set the next event anchor',
      detail: nextEvent ? `${campCapacity}% capacity signal. Use the event date to focus outreach.` : 'A calendar anchor will make family and coach follow-up sharper.',
      href: '/admin?tab=site-events',
      tone: nextEvent ? 'blue' : 'amber',
    },
  ];

  return (
    <div className="ea-dashboard ea-decision-workspace">
      <DecisionHero
        eyebrow="Decision Workspace"
        title={topAction.title}
        detail={`${topAction.detail} ${operatingSignals} operating signals are active, and ${completedToday} profiles were completed today.`}
        actionHref={topAction.href}
        actionLabel="Next Best Action"
        actionValue={actionLabel(topAction.tone)}
        tone={topAction.tone}
      />

      {!live && (
        <div className="ea-demo-note">
          Sample data is showing because one or more live services are unavailable in this environment.
        </div>
      )}

      <section className="ea-next-actions" aria-label="Three highest-value actions">
        <SectionHead eyebrow="What should I do next?" title="Next Best Actions" />
        <ActionStack>
          {nextBestActions.map((item, index) => (
            <ActionCard
              href={item.href}
              index={index + 1}
              tone={item.tone}
              label={item.label}
              title={item.title}
              detail={item.detail}
              key={`${item.label}-${item.title}`}
            />
          ))}
        </ActionStack>
      </section>

      <DecisionGrid>
        <DecisionPanel>
          <SectionHead eyebrow="What changed?" title="Since Last Visit" />
          <CompactList>
            {visibleChanges.map((item) => (
              <CompactItem
                href="/admin"
                meta={`${shortDate(item.date)} / ${item.type}`}
                title={item.title}
                detail={item.detail || 'Updated'}
                key={`${item.type}-${item.title}-${item.date}`}
              />
            ))}
            {visibleChanges.length === 0 && <EmptyState>No meaningful changes are visible yet.</EmptyState>}
          </CompactList>
          <PanelAction href={visibleChanges.length ? '/admin?tab=messages' : topAction.href}>
            {visibleChanges.length ? 'Act on the newest signal' : 'Use the top action instead'}
          </PanelAction>
        </DecisionPanel>

        <DecisionPanel id="needs-attention">
          <SectionHead eyebrow="What needs attention?" title="Decision Queue" />
          <CompactList>
            {needsAttention.map((item) => (
              <CompactItem
                href={item.href}
                tone={item.tone}
                meta={item.label}
                title={item.title}
                detail={item.detail}
                key={`${item.label}-${item.title}`}
              />
            ))}
            {needsAttention.length === 0 && <EmptyState>No urgent decision is waiting right now.</EmptyState>}
          </CompactList>
          <PanelAction href={needsAttention[0]?.href || topAction.href}>
            {needsAttention.length ? 'Resolve the first decision' : 'Create momentum today'}
          </PanelAction>
        </DecisionPanel>

        <DecisionPanel>
          <SectionHead eyebrow="How healthy is the program?" title="Program Health" />
          <HealthStrip>
            {healthSignals.map((signal) => (
              <HealthCard
                href={signal.href}
                tone={signal.tone}
                label={signal.label}
                status={signal.status}
                detail={signal.detail}
                key={signal.label}
              />
            ))}
          </HealthStrip>
          <PanelAction href={healthSignals.find((signal) => signal.status !== 'Strong')?.href || '/admin?tab=outreach'}>
            {healthSignals.some((signal) => signal.status !== 'Strong') ? 'Stabilize the weakest signal' : 'Invest in recruiting momentum'}
          </PanelAction>
        </DecisionPanel>

        <DecisionPanel>
          <SectionHead eyebrow="What opportunities can I act on?" title="Opportunities" />
          <CompactList>
            {opportunities.map((item) => (
              <CompactItem
                href={item.href}
                tone={item.tone}
                meta={item.label}
                title={item.title}
                detail={item.detail}
                key={`${item.label}-${item.title}`}
              />
            ))}
          </CompactList>
          <PanelAction href={opportunities[0].href}>Act on the warmest opportunity</PanelAction>
        </DecisionPanel>
      </DecisionGrid>
    </div>
  );
}
