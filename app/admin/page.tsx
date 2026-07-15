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
import { site } from '@/config/site';
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

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'CPR Admin',
  robots: { index: false, follow: false },
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = (await cookies()).get('cpr_admin_session')?.value || '';
  const admin = verifyAdminSession(session);
  if (!admin) redirect('/admin/login');

  const { tab } = await searchParams;
  const activeTab = tab ?? 'registrants';
  let mainContent: React.ReactNode;

  const athletesPromise = getAthletes();

  if (tab === 'tickets') {
    const result = await getAllTickets();
    mainContent = <AdminTickets tickets={result.tickets} live={result.live} />;
  } else if (tab === 'messages') {
    const result = await getAllMessages();
    mainContent = <AdminMessages messages={result.messages} live={result.live} />;
  } else if (tab === 'communication') {
    const [messagesResult, ticketsResult, announcementsResult, notificationsResult] = await Promise.all([
      getAllMessages(),
      getAllTickets(),
      getCommunicationAnnouncements(),
      getCommunicationNotifications(),
    ]);
    mainContent = (
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
      />
    );
  } else if (tab === 'activity') {
    const { athletes, live } = await getAthleteActivity();
    mainContent = <AdminActivity athletes={athletes} live={live} />;
  } else if (tab === 'content') {
    const [resourcesResult, eventsResult, activityResult] = await Promise.all([
      getResources(),
      getUpcomingEvents(),
      getAthleteActivity(),
    ]);
    const gradYears = [
      ...new Set(activityResult.athletes.map((a) => a.gradYear).filter((y) => y > 0)),
    ].sort((a, b) => a - b);
    mainContent = (
      <AdminContentRelevance
        resources={resourcesResult.resources}
        events={eventsResult.events}
        gradYears={gradYears}
        live={resourcesResult.live}
      />
    );
  } else if (tab === 'registrants' || !tab) {
    const athletes = await athletesPromise;
    mainContent = (
      <>
        <header className="ahead ahead-compact">
          <div>
            <p className="admin-kicker">CPR Admin Portal</p>
          </div>
          <a className="admin-logout" href="/api/admin/logout">Sign Out</a>
        </header>
        <AdminRegistrants athletes={athletes.rows} live={athletes.live} />
      </>
    );
  } else if (tab === 'outreach') {
    const [outreach, athletes, coaches] = await Promise.all([
      getOutreach(),
      getAthletes(),
      getCoaches(),
    ]);
    mainContent = (
      <>
        <header className="ahead">
          <div>
            <h1 className="display">COACH OUTREACH &amp; RECRUITMENT TRACKER</h1>
            <p>Send profiles to college coaches and track responses and results.</p>
          </div>
          <a className="admin-logout" href="/api/admin/logout">Sign Out</a>
          {(!outreach.live || !athletes.live || !coaches.live) && (
            <span className="demo-pill">SAMPLE DATA &middot; connect Airtable to go live</span>
          )}
        </header>
        <AdminClient rows={outreach.rows} players={athletes.rows} coaches={coaches.rows} />
      </>
    );
  } else if (tab === 'team') {
    const team = await listAdminTeamMembers();
    mainContent = (
      <>
        <header className="ahead">
          <div>
            <h1 className="display">ADMIN TEAM</h1>
            <p>One login for admin, portal owner tools, and Pulse across devices.</p>
          </div>
          <a className="admin-logout" href="/api/admin/logout">Sign Out</a>
        </header>
        <AdminTeam
          canInvite={admin.role === 'owner'}
          initialMembers={team.members}
          live={team.live}
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
    mainContent = (
      <AdminCollection def={def} initialItems={items} athleteOptions={athleteOptions} live={storageLive} />
    );
  } else {
    const athletes = await athletesPromise;
    mainContent = (
      <>
        <header className="ahead">
          <div>
            <h1 className="display">CPR ADMIN PORTAL</h1>
            <p>Registrants, progress, and recruiting operations in one place.</p>
          </div>
          <a className="admin-logout" href="/api/admin/logout">Sign Out</a>
        </header>
        <AdminRegistrants athletes={athletes.rows} live={athletes.live} />
      </>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="aside">
        <div className="aside-brand">
          <img src={site.brand.logo} alt="CPR" />
          <div>
            <div className="ab1 display">CPR GLOBAL PROSPECTS</div>
            <div className="ab2 display">RECRUITMENT</div>
          </div>
        </div>
        <div className="aside-sec">REGISTRANTS</div>
        <nav>
          <a className={`aitem${activeTab === 'registrants' ? ' active' : ''}`} href="/admin">
            &#128100; Registrants &amp; Progress
          </a>
        </nav>
        <div className="aside-sec">RECRUITMENT</div>
        <nav>
          <a className={`aitem${activeTab === 'outreach' ? ' active' : ''}`} href="/admin?tab=outreach">
            &#128226; Coach Outreach
          </a>
          <a className={`aitem${activeTab === 'outreach' ? ' active' : ''}`} href="/admin?tab=outreach#players">
            &#127936; Player Profiles
          </a>
          <a className={`aitem${activeTab === 'schools' ? ' active' : ''}`} href="/admin?tab=schools">
            &#127979; Schools
          </a>
          <a className={`aitem${activeTab === 'recruitment-tracker' ? ' active' : ''}`} href="/admin?tab=recruitment-tracker">
            &#128202; Recruitment Tracker
          </a>
          <a className={`aitem${activeTab === 'responses' ? ' active' : ''}`} href="/admin?tab=responses">
            &#128172; Responses
          </a>
          <a className={`aitem${activeTab === 'offers' ? ' active' : ''}`} href="/admin?tab=offers">
            &#127942; Offers
          </a>
        </nav>
        <div className="aside-sec">PORTAL</div>
        <nav>
          <a className="aitem" href="/admin/update-portal">&#9889; Update Portal</a>
          <a className="aitem" href="/admin/content-requests">&#128196; Content Requests</a>
          <a className="aitem" href="/admin/landing">&#127760; Edit Homepage</a>
          <a className="aitem" href="/portal/owner">&#127968; Family Portal (Owner)</a>
          <a className={`aitem${activeTab === 'communication' ? ' active' : ''}`} href="/admin?tab=communication">
            &#128227; Communication Center
          </a>
          <a className={`aitem${activeTab === 'tickets' ? ' active' : ''}`} href="/admin?tab=tickets">
            &#10067; Ask CPR Tickets
          </a>
          <a className={`aitem${activeTab === 'messages' ? ' active' : ''}`} href="/admin?tab=messages">
            &#128172; Messaging Center
          </a>
        </nav>
        <div className="aside-sec">ANALYTICS</div>
        <nav>
          <a className={`aitem${activeTab === 'activity' ? ' active' : ''}`} href="/admin?tab=activity">
            &#128200; Athlete Activity
          </a>
          <a className={`aitem${activeTab === 'content' ? ' active' : ''}`} href="/admin?tab=content">
            &#128203; Content Relevance
          </a>
        </nav>
        <div className="aside-sec">MANAGEMENT</div>
        <nav>
          <a className={`aitem${activeTab === 'team' ? ' active' : ''}`} href="/admin?tab=team">
            &#128101; Admin Team
          </a>
          <a className="aitem" href="/admin/create-client">&#43; Create New Client</a>
          <a className={`aitem${activeTab === 'documents' ? ' active' : ''}`} href="/admin?tab=documents">
            &#128196; Documents
          </a>
          <a className={`aitem${activeTab === 'fee-agreements' ? ' active' : ''}`} href="/admin?tab=fee-agreements">
            &#128221; Fee Agreements
          </a>
          <a className={`aitem${activeTab === 'email-templates' ? ' active' : ''}`} href="/admin?tab=email-templates">
            &#9993; Email Templates
          </a>
          <a className={`aitem${activeTab === 'site-updates' ? ' active' : ''}`} href="/admin?tab=site-updates">
            &#128221; Site Updates
          </a>
          <a className={`aitem${activeTab === 'site-events' ? ' active' : ''}`} href="/admin?tab=site-events">
            &#128197; Site Events
          </a>
          <a className={`aitem${activeTab === 'site-quotes' ? ' active' : ''}`} href="/admin?tab=site-quotes">
            &#10077; Quotes
          </a>
          <a className={`aitem${activeTab === 'media-library' ? ' active' : ''}`} href="/admin?tab=media-library">
            &#128247; Image Library
          </a>
          <a className={`aitem${activeTab === 'site-text' ? ' active' : ''}`} href="/admin?tab=site-text">
            &#9997; Site Text
          </a>
        </nav>
        <a className="aitem back" href="/">&#8592; Back to Site</a>
      </aside>
      <main className="amain">{mainContent}</main>
    </div>
  );
}
