import '../landing.css';
import './admin.css';
import { getOutreach } from '@/lib/outreach';
import { site } from '@/config/site';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Coach Outreach & Recruitment Tracker · CPR Admin',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const { rows, live } = await getOutreach();
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
          <span className="aitem active">&#128226; Coach Outreach</span>
          <span className="aitem">&#127979; Schools</span>
          <span className="aitem">&#128202; Recruitment Tracker</span>
          <span className="aitem">&#128172; Responses</span>
          <span className="aitem">&#127942; Offers</span>
        </nav>
        <div className="aside-sec">MANAGEMENT</div>
        <nav>
          <span className="aitem">&#128196; Documents</span>
          <span className="aitem">&#128221; Fee Agreements</span>
          <span className="aitem">&#9993; Email Templates</span>
        </nav>
        <a className="aitem back" href="/">&#8592; Back to Site</a>
      </aside>
      <main className="amain">
        <header className="ahead">
          <div>
            <h1 className="display">COACH OUTREACH &amp; RECRUITMENT TRACKER</h1>
            <p>Send profiles to college coaches and track responses and results.</p>
          </div>
          {!live && <span className="demo-pill">SAMPLE DATA &middot; connect Airtable to go live</span>}
        </header>
        <AdminClient rows={rows} />
      </main>
    </div>
  );
}
