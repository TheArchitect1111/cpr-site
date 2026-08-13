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

  const playersOpen = ['registrants', 'activity'].includes(activeTab);
  const recruitingOpen = ['outreach', 'schools', 'recruitment-tracker', 'responses', 'offers'].includes(activeTab);
  const messagesOpen = ['communication', 'tickets', 'messages', 'email-templates'].includes(activeTab);
  const websiteOpen = ['content', 'site-updates', 'site-quotes', 'media-library', 'site-text'].includes(activeTab);
  const documentsOpen = ['documents', 'fee-agreements'].includes(activeTab);
  const campsOpen = ['camps', 'camp-registrations'].includes(activeTab);
  const settingsOpen = activeTab === 'team';

  return (
    <div className="admin-shell">
      <aside className="aside">
        <style>{`
          .admin-menu-group { margin: 0 0 5px; }
          .admin-menu-group summary { list-style: none; cursor: pointer; padding: 10px; border-radius: 7px; color: #fff; font-size: 13px; font-weight: 800; }
          .admin-menu-group summary::-webkit-details-marker { display: none; }
          .admin-menu-group summary::after { content: '+'; float: right; color: #8a8a8a; }
          .admin-menu-group[open] summary { background: rgba(255,255,255,.08); }
          .admin-menu-group[open] summary::after { content: '\\2212'; color: #fff; }
          .admin-menu-group nav { padding: 4px 0 5px 9px; border-left: 1px solid rgba(255,255,255,.14); margin-left: 10px; }
          .admin-menu-group .aitem { font-size: 12px; padding: 8px 9px; }
          .admin-menu-help { margin: 4px 8px 14px; color: #9b9b9b; font-size: 11px; line-height: 1.4; }
        `}</style>
        <div className="aside-brand">
          <img src={site.brand.logo} alt="CPR" />
          <div>
            <div className="ab1 display">CPR GLOBAL PROSPECTS</div>
            <div className="ab2 display">RECRUITMENT</div>
          </div>
        </div>
        <p className="admin-menu-help">Choose a category, then select the task you need.</p>

        <details className="admin-menu-group" open={playersOpen}>
          <summary>&#x1F464; Players</summary>
          <nav>
            <a className={`aitem${activeTab === 'registrants' ? ' active' : ''}`} href="/admin">Player List &amp; Progress</a>
            <a className={`aitem${activeTab === 'outreach' ? ' active' : ''}`} href="/admin?tab=outreach#players">Edit Player Profiles</a>
            <a className="aitem" href="/admin/create-client">Add New Player</a>
            <a className={`aitem${activeTab === 'activity' ? ' active' : ''}`} href="/admin?tab=activity">Player Activity</a>
          </nav>
        </details>

        <details className="admin-menu-group" open={recruitingOpen}>
          <summary>&#x1F3C0; Recruiting</summary>
          <nav>
            <a className={`aitem${activeTab === 'outreach' ? ' active' : ''}`} href="/admin?tab=outreach">Coach Outreach</a>
            <a className={`aitem${activeTab === 'schools' ? ' active' : ''}`} href="/admin?tab=schools">Schools</a>
            <a className={`aitem${activeTab === 'recruitment-tracker' ? ' active' : ''}`} href="/admin?tab=recruitment-tracker">Recruitment Tracker</a>
            <a className={`aitem${activeTab === 'responses' ? ' active' : ''}`} href="/admin?tab=responses">Coach Responses</a>
            <a className={`aitem${activeTab === 'offers' ? ' active' : ''}`} href="/admin?tab=offers">Offers</a>
          </nav>
        </details>

        <details className="admin-menu-group" open={campsOpen}>
          <summary>&#x1F3D5;&#xFE0F; Camps</summary>
          <nav>
            <a className={`aitem${activeTab === 'camps' ? ' active' : ''}`} href="/admin?tab=camps">Manage Camps</a>
            <a className={`aitem${activeTab === 'camp-registrations' ? ' active' : ''}`} href="/admin?tab=camp-registrations">Camp Registrations</a>
            <a className="aitem" href="/camps" target="_blank" rel="noopener noreferrer">View Camp Page</a>
          </nav>
        </details>

        <details className="admin-menu-group" open={messagesOpen}>
          <summary>&#x1F4AC; Messages</summary>
          <nav>
            <a className={`aitem${activeTab === 'communication' ? ' active' : ''}`} href="/admin?tab=communication">Announcements &amp; Communication</a>
            <a className={`aitem${activeTab === 'messages' ? ' active' : ''}`} href="/admin?tab=messages">Direct Messages</a>
            <a className={`aitem${activeTab === 'tickets' ? ' active' : ''}`} href="/admin?tab=tickets">Questions &amp; Support</a>
            <a className={`aitem${activeTab === 'email-templates' ? ' active' : ''}`} href="/admin?tab=email-templates">Saved Email Templates</a>
          </nav>
        </details>

        <details className="admin-menu-group">
          <summary>&#x1F4C5; Calendar</summary>
          <nav>
            <a className="aitem" href="/admin/calendar">Shared Portal Calendar</a>
            <a className={`aitem${activeTab === 'site-events' ? ' active' : ''}`} href="/admin?tab=site-events">Website Events</a>
          </nav>
        </details>

        <details className="admin-menu-group" open={websiteOpen}>
          <summary>&#x1F310; Website</summary>
          <nav>
            <a className="aitem" href="/admin/landing">Edit Homepage</a>
            <a className={`aitem${activeTab === 'site-updates' ? ' active' : ''}`} href="/admin?tab=site-updates">Website Announcements</a>
            <a className={`aitem${activeTab === 'site-quotes' ? ' active' : ''}`} href="/admin?tab=site-quotes">Testimonials &amp; Quotes</a>
            <a className={`aitem${activeTab === 'media-library' ? ' active' : ''}`} href="/admin?tab=media-library">Image Library</a>
            <a className={`aitem${activeTab === 'site-text' ? ' active' : ''}`} href="/admin?tab=site-text">Edit Website Wording</a>
            <a className={`aitem${activeTab === 'content' ? ' active' : ''}`} href="/admin?tab=content">Content Performance</a>
          </nav>
        </details>

        <details className="admin-menu-group">
          <summary>&#x1F3E0; Portal</summary>
          <nav>
            <a className="aitem" href="/admin/update-portal">Post Portal Update</a>
            <a className="aitem" href="/admin/amplifi">Amplifi™ Search &amp; Campaigns</a>
            <a className="aitem" href="/admin/content-requests">Review Content Requests</a>
            <a className="aitem" href="/portal/owner">Preview Family Portal</a>
          </nav>
        </details>

        <details className="admin-menu-group" open={documentsOpen}>
          <summary>&#x1F4C4; Documents &amp; Agreements</summary>
          <nav>
            <a className={`aitem${activeTab === 'documents' ? ' active' : ''}`} href="/admin?tab=documents">Documents</a>
            <a className={`aitem${activeTab === 'fee-agreements' ? ' active' : ''}`} href="/admin?tab=fee-agreements">Fee Agreements</a>
          </nav>
        </details>

        <details className="admin-menu-group" open={settingsOpen}>
          <summary>&#x2699;&#xFE0F; Settings</summary>
          <nav>
            <a className={`aitem${activeTab === 'team' ? ' active' : ''}`} href="/admin?tab=team">Admin Team &amp; Access</a>
          </nav>
        </details>

        <a className="aitem back" href="/">&#8592; Back to Site</a>
      </aside>
      <main className="amain">{mainContent}</main>
    </div>
  );
}
