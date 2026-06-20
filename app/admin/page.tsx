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
            <div className="ab1 display">CANADIAN PROSPECTS</div>
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
          <span className="aitem">&#127979; Schools</span>
          <span className="aitem">&#128202; Recruitment Tracker</span>
          <span className="aitem">&#128172; Responses</span>
          <span className="aitem">&#127942; Offers</span>
        </nav>
        <div className="aside-sec">PORTAL</div>
        <nav>
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
          <a className="aitem" href="/admin/create-client">&#43; Create New Client</a>
          <span className="aitem">&#128196; Documents</span>
          <span className="aitem">&#128221; Fee Agreements</span>
          <span className="aitem">&#9993; Email Templates</span>
        </nav>
        <a className="aitem back" href="/">&#8592; Back to Site</a>
      </aside>
      <main className="amain">{mainContent}</main>
    </div>
  );
}
