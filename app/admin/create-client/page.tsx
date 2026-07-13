import '../../landing.css';
import '../admin.css';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { site } from '@/config/site';
import { verifyAdminSession } from '@/lib/admin-auth';
import CreateClientForm from '../CreateClientForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Create New Client | CPR Admin',
  robots: { index: false, follow: false },
};

export default async function CreateClientPage() {
  const session = (await cookies()).get('cpr_admin_session')?.value || '';
  if (!verifyAdminSession(session)) redirect('/admin/login?next=/admin/create-client');

  return (
    <div className="admin-shell">
      <aside className="aside">
        <a className="aside-brand" href="/admin">
          <img src={site.brand.logo} alt="CPR" />
          <div>
            <div className="ab1 display">CPR GLOBAL PROSPECTS</div>
            <div className="ab2 display">RECRUITMENT</div>
          </div>
        </a>
        <div className="aside-sec">RECRUITMENT</div>
        <nav>
          <a className="aitem" href="/admin">&#128100; Registrants &amp; Progress</a>
          <a className="aitem" href="/admin?tab=outreach">&#128226; Coach Outreach</a>
          <a className="aitem" href="/admin?tab=outreach#players">&#127936; Player Profiles</a>
        </nav>
        <div className="aside-sec">MANAGEMENT</div>
        <nav>
          <a className="aitem active" href="/admin/create-client">&#43; Create New Client</a>
          <a className="aitem" href="/admin/account">Account Settings</a>
        </nav>
        <a className="aitem back" href="/admin">&#8592; Back to Admin</a>
      </aside>
      <main className="amain">
        <header className="ahead">
          <div>
            <h1 className="display">CREATE NEW CLIENT</h1>
            <p>Enroll a new athlete in the CPR system and send welcome credentials.</p>
          </div>
        </header>
        <CreateClientForm />
      </main>
    </div>
  );
}
