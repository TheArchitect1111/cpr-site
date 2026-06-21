import '../../landing.css';
import '../admin.css';
import { site } from '@/config/site';
import { adminNonce } from '@/lib/hash';
import CreateClientForm from '../CreateClientForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Create New Client | CPR Admin',
  robots: { index: false, follow: false },
};

export default async function CreateClientPage() {
  const pw = process.env.ADMIN_PASSWORD || '';
  const nonce = adminNonce(pw);

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
          <a className="aitem" href="/admin">&#128226; Coach Outreach</a>
          <span className="aitem coming-soon" title="Coming soon">&#127979; Schools</span>
          <span className="aitem coming-soon" title="Coming soon">&#128202; Recruitment Tracker</span>
          <span className="aitem coming-soon" title="Coming soon">&#128172; Responses</span>
          <span className="aitem coming-soon" title="Coming soon">&#127942; Offers</span>
        </nav>
        <div className="aside-sec">MANAGEMENT</div>
        <nav>
          <a className="aitem active" href="/admin/create-client">&#43; Create New Client</a>
          <span className="aitem coming-soon" title="Coming soon">&#128196; Documents</span>
          <span className="aitem coming-soon" title="Coming soon">&#128221; Fee Agreements</span>
          <span className="aitem coming-soon" title="Coming soon">&#9993; Email Templates</span>
        </nav>
        <a className="aitem back" href="/">&#8592; Back to Site</a>
      </aside>
      <main className="amain">
        <header className="ahead">
          <div>
            <h1 className="display">CREATE NEW CLIENT</h1>
            <p>Enroll a new athlete in the CPR system and send welcome credentials.</p>
          </div>
        </header>
        <CreateClientForm adminNonce={nonce} />
      </main>
    </div>
  );
}
