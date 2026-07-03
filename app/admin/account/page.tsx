import '../admin.css';
import ChangePasswordForm from '@/app/portal/components/ChangePasswordForm';
import { verifyAdminSession } from '@/lib/admin-auth';
import { isOpenStaging } from '@/lib/staging';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Account Settings · CPR Admin',
  robots: { index: false, follow: false },
};

export default async function AdminAccountPage() {
  const session = (await cookies()).get('cpr_admin_session')?.value || '';
  const admin = verifyAdminSession(session);
  if (!isOpenStaging() && !admin) redirect('/admin/login');

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="sidebar-brand display">CPR ADMIN</div>
        <nav className="sidebar-nav">
          <a className="aitem" href="/admin">Dashboard</a>
          <a className="aitem active" href="/admin/account">Account Settings</a>
        </nav>
      </aside>
      <main className="admin-main">
        <ChangePasswordForm
          action="/api/admin/change-password"
          description="Update your CPR admin password. After saving, use the new password the next time you sign in."
        />
      </main>
    </div>
  );
}
