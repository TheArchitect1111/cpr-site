import '../../landing.css';
import '../admin.css';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/admin-auth';
import AdminCRM from '../AdminCRM';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'CPR CRM & Opportunity Center',
  robots: { index: false, follow: false },
};

export default async function AdminCrmPage() {
  const session = (await cookies()).get('cpr_admin_session')?.value || '';
  const admin = verifyAdminSession(session);
  if (!admin) redirect('/admin/login');

  return (
    <main style={{ minHeight: '100vh', background: '#f4f4f2' }}>
      <div style={{ padding: '14px 22px 0', maxWidth: 1500, margin: '0 auto' }}>
        <a href="/admin" style={{ color: '#555', fontSize: 13, fontWeight: 800, textDecoration: 'none' }}>
          ← Back to CPR Admin
        </a>
      </div>
      <AdminCRM />
    </main>
  );
}
