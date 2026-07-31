import '../../landing.css';
import '../admin.css';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/admin-auth';
import { site } from '@/config/site';
import AdminSharedCalendar from './AdminSharedCalendar';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Shared Calendar - CPR Admin', robots: { index: false, follow: false } };

export default async function AdminCalendarPage() {
  const session = (await cookies()).get('cpr_admin_session')?.value || '';
  const admin = verifyAdminSession(session);
  if (!admin) redirect('/admin/login?next=/admin/calendar');
  return (
    <div className="admin-shell">
      <aside className="aside">
        <div className="aside-brand"><img src={site.brand.logo} alt="CPR" /><div><div className="ab1 display">CPR GLOBAL PROSPECTS</div><div className="ab2 display">RECRUITMENT</div></div></div>
        <div className="aside-sec">OWNER TOOLS</div>
        <nav>
          <a className="aitem" href="/admin/update-portal">Update Portal</a>
          <a className="aitem active" href="/admin/calendar">Shared Calendar</a>
          <a className="aitem" href="/admin/content-requests">Content Requests</a>
          <a className="aitem" href="/portal/owner">Family Portal Owner</a>
        </nav>
        <a className="aitem back" href="/admin">Back to Admin</a>
      </aside>
      <main className="amain">
        <header className="ahead"><div><p className="admin-kicker">Signed in as {admin.name || admin.email}</p><h1 className="display">SHARED CALENDAR</h1><p>Create and manage events shown in the athlete and parent portals.</p></div><a className="admin-logout" href="/api/admin/logout">Sign Out</a></header>
        <AdminSharedCalendar />
      </main>
    </div>
  );
}
