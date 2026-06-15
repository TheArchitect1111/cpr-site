import '../landing.css';
import './admin.css';
import { getOutreach } from '@/lib/outreach';
import { getAllTickets, getAllMessages } from '@/lib/sections-data';
import { site } from '@/config/site';
import AdminClient from './AdminClient';
import AdminTickets from './AdminTickets';
import AdminMessages from './AdminMessages';

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
  const { tab } = await searchParams;

  let mainContent: React.ReactNode;
  let liveOutreach = true;

  if (tab === 'tickets') {
    const result = await getAllTickets();
    mainContent = <AdminTickets tickets={result.tickets} live={result.live} />;
  } else if (tab === 'messages') {
    const result = await getAllMessages();
    mainContent = <AdminMessages messages={result.messages} live={result.live} />;
  } else {
    const { rows, live } = await getOutreach();
    liveOutreach = live;
    mainContent = (
      <>
        <header className="ahead">
          <div>
            <h1 className="display">COACH OUTREACH &amp; RECRUITMENT TRACKER</h1>
            <p>Send profiles to college coaches and track responses and results.</p>
          </div>
          {!liveOutreach && (
            <span className="demo-pill">SAMPLE DATA &middot; connect Airtable to go live</span>
          )}
        </header>
        <AdminClient rows={rows} />
      </>
    );
  }

  const activeTab = tab ?? 'outreach';

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
        <div className="aside-sec">RECRUITMENT</div>
        <nav>
          <a
            className={`aitem${activeTab === 'outreach' ? ' active' : ''}`}
            href="/admin"
          >
            &#128226; Coach Outreach
          </a>
          <span className="aitem">&#127979; Schools</span>
          <span className="aitem">&#128202; Recruitment Tracker</span>
          <span className="aitem">&#128172; Responses</span>
          <span className="aitem">&#127942; Offers</span>
        </nav>
        <div className="aside-sec">PORTAL</div>
        <nav>
          <a
            className={`aitem${activeTab === 'tickets' ? ' active' : ''}`}
            href="/admin?tab=tickets"
          >
            &#10067; Ask CPR Tickets
          </a>
          <a
            className={`aitem${activeTab === 'messages' ? ' active' : ''}`}
            href="/admin?tab=messages"
          >
            &#128172; Messaging Center
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
