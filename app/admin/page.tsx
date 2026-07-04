import '../landing.css';
import './admin.css';
import '../portal/website-builder.css';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getOutreach } from '@/lib/outreach';
import { getAllTickets, getAllMessages, getResources, getUpcomingEvents } from '@/lib/sections-data';
import { getAthleteActivity } from '@/lib/activity-data';
import { getAthletes } from '@/lib/athletes';
import { getCoaches } from '@/lib/coaches';
import { verifyAdminSession } from '@/lib/admin-auth';
import { site } from '@/config/site';
import { isOpenStaging } from '@/lib/staging';
import { getWebsiteUpdateRequests } from '@/lib/website-update-requests';
import AdminClient from './AdminClient';
import AdminTickets from './AdminTickets';
import AdminMessages from './AdminMessages';
import AdminActivity from './AdminActivity';
import AdminContentRelevance from './AdminContentRelevance';
import AdminRegistrants from './AdminRegistrants';
import AdminWebsiteManager from './AdminWebsiteManager';

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
  const openStaging = isOpenStaging();
  if (!openStaging && !admin) redirect('/admin/login');

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
  } else if (tab === 'website') {
    const athletes = await athletesPromise;
    const result = await getWebsiteUpdateRequests(athletes.rows);
    mainContent = <AdminWebsiteManager requests={result.requests} live={result.live} />;
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
        <div className="aside-orbie" data-orbie-target="admin-orbie-rail">
          <div className="aside-orbie-head">
            <span className="aside-orbie-orb" aria-hidden="true" />
            <span>Next Action</span>
          </div>
          <a className="aside-orbie-primary" href={activeTab === 'website' ? '/admin?tab=website' : '/admin'}>
            <strong>{activeTab === 'website' ? 'Review website requests' : 'Review current registrants'}</strong>
            <span>{activeTab === 'website' ? 'Approve the next portal update' : 'Orbie can walk the next applicant forward'}</span>
          </a>
        </div>
        <div className="aside-sec">TODAY</div>
        <nav>
          <a className={`aitem${activeTab === 'registrants' ? ' active' : ''}`} href="/admin">
            <span>01</span> Registrants &amp; Progress
          </a>
          <a className={`aitem${activeTab === 'website' ? ' active' : ''}`} href="/admin?tab=website">
            <span>02</span> Website Update Hub
          </a>
        </nav>
        <div className="aside-sec">BUILD</div>
        <nav>
          <a className={`aitem${activeTab === 'outreach' ? ' active' : ''}`} href="/admin?tab=outreach">
            <span>03</span> Coach Outreach
          </a>
          <a className={`aitem${activeTab === 'outreach' ? ' active' : ''}`} href="/admin?tab=outreach#players">
            <span>04</span> Player Profiles
          </a>
          <a className="aitem" href="/admin?tab=website#builder"><span>05</span> Website Builder</a>
        </nav>
        <div className="aside-sec">COMMUNICATE</div>
        <nav>
          <a className={`aitem${activeTab === 'tickets' ? ' active' : ''}`} href="/admin?tab=tickets">
            <span>06</span> Ask CPR Tickets
          </a>
          <a className={`aitem${activeTab === 'messages' ? ' active' : ''}`} href="/admin?tab=messages">
            <span>07</span> Messaging Center
          </a>
        </nav>
        <div className="aside-sec">INTELLIGENCE</div>
        <nav>
          <a className={`aitem${activeTab === 'activity' ? ' active' : ''}`} href="/admin?tab=activity">
            <span>08</span> Athlete Activity
          </a>
          <a className={`aitem${activeTab === 'content' ? ' active' : ''}`} href="/admin?tab=content">
            <span>09</span> Content Relevance
          </a>
        </nav>
        <div className="aside-sec">OPERATIONS</div>
        <nav>
          <a className="aitem" href="/admin/create-client"><span>+</span> Create New Client</a>
        </nav>
        <a className="aitem back" href="/"><span>&lt;</span> Back to Site</a>
      </aside>
      <main className="amain">{mainContent}</main>
    </div>
  );
}
