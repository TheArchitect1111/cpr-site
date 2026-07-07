import '../admin.css';
import ChangePasswordForm from '@/app/portal/components/ChangePasswordForm';
import { verifyAdminSession } from '@/lib/admin-auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminCommandPalette from '@/app/admin/AdminCommandPalette';
import AdminEosSidebar from '@/app/admin/AdminEosSidebar';
import AdminExecutiveBrief from '@/app/admin/AdminExecutiveBrief';
import AdminRecommendedFirstItem from '@/app/admin/AdminRecommendedFirstItem';

export const metadata = {
  title: 'Account Settings - CPR Admin',
  robots: { index: false, follow: false },
};

export default async function AdminAccountPage() {
  const session = (await cookies()).get('cpr_admin_session')?.value || '';
  const admin = verifyAdminSession(session);
  if (!admin) redirect('/admin/login');

  return (
    <div className="admin-shell">
      <AdminEosSidebar activeRoute="settings" />
      <main className="amain">
        <AdminCommandPalette permissions={[admin.role || 'admin']} />
        <AdminExecutiveBrief
          eyebrow="Platform"
          title="Keep account access secure without slowing operations."
          situation={`${admin.name || admin.email} is signed in with ${admin.role || 'admin'} access.`}
          recommendation="Update credentials when access has been shared, rotated, or feels uncertain."
          why="A secure owner account protects people, payments, communication, and platform settings."
          nextBestAction="Review password readiness"
          expectedOutcome="Account access remains controlled and the operator can continue daily work confidently."
          confidence="High"
          successMetric="Password status confirmed or updated"
          actionHref="/admin/account"
          actionLabel="Review settings"
        />
        <AdminRecommendedFirstItem
          title="Recommended first item"
          reason="Credential health is the highest-impact setting because it protects every owner-facing workspace."
          action="Change the password if it was shared, temporary, or reused."
          outcome="Mission Control remains secure without changing any operating data."
          href="/admin/account"
          actionLabel="Review credentials"
        />
        <ChangePasswordForm
          action="/api/admin/change-password"
          description="Update your CPR admin password. After saving, use the new password the next time you sign in."
        />
      </main>
    </div>
  );
}
