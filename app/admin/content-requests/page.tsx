import '../../landing.css';
import '../admin.css';
import './content-requests.css';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/admin-auth';
import { site } from '@/config/site';
import { listAdminQueue } from '@/lib/content-requests';
import ContentRequestsQueue from './ContentRequestsQueue';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Content Requests - CPR Admin',
  robots: { index: false, follow: false },
};

export default async function AdminContentRequestsPage() {
  const session = (await cookies()).get('cpr_admin_session')?.value || '';
  const admin = verifyAdminSession(session);
  if (!admin) redirect('/admin/login?next=/admin/content-requests');

  const result = await listAdminQueue();

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
        <div className="aside-sec">OWNER TOOLS</div>
        <nav>
          <a className="aitem" href="/admin/update-portal">Update Portal</a>
          <a className="aitem active" href="/admin/content-requests">Content Requests</a>
          <a className="aitem" href="/admin/landing">Edit Homepage</a>
          <a className="aitem" href="/admin?tab=communication">Communication Center</a>
          <a className="aitem" href="/portal/owner">Family Portal Owner</a>
        </nav>
        <a className="aitem back" href="/admin">Back to Admin</a>
        <a className="aitem back" href="/">View public site</a>
      </aside>
      <main className="amain">
        <header className="ahead">
          <div>
            <p className="admin-kicker">Signed in as {admin.name || admin.email}</p>
            <h1 className="display">Update Hub™ queue</h1>
            <p>
              Review family content requests, set status, and publish to the athlete Update Hub.
              {!result.live && result.error ? ` ${result.error}` : ''}
            </p>
          </div>
          <a className="admin-logout" href="/api/admin/logout">Sign Out</a>
        </header>
        <ContentRequestsQueue initialData={result.records} />
      </main>
    </div>
  );
}
