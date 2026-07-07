import '../../landing.css';
import '../admin.css';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/admin-auth';
import CreateClientForm from '../CreateClientForm';
import AdminCommandPalette from '@/app/admin/AdminCommandPalette';
import AdminEosSidebar from '@/app/admin/AdminEosSidebar';
import AdminExecutiveBrief from '@/app/admin/AdminExecutiveBrief';
import AdminRecommendedFirstItem from '@/app/admin/AdminRecommendedFirstItem';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Create New Client | CPR Admin',
  robots: { index: false, follow: false },
};

export default async function CreateClientPage() {
  const session = (await cookies()).get('cpr_admin_session')?.value || '';
  const admin = verifyAdminSession(session);
  if (!admin) redirect('/admin/login?next=/admin/create-client');

  return (
    <div className="admin-shell">
      <AdminEosSidebar activeRoute="forms" />
      <main className="amain">
        <AdminCommandPalette permissions={[admin.role || 'admin']} />
        <AdminExecutiveBrief
          eyebrow="Operations"
          title="Create a client only when enrollment is ready to move."
          situation="This form creates a new athlete/client record and welcome path."
          recommendation="Confirm the person, contact details, and next owner action before submitting."
          why="A clean first record prevents downstream confusion across messaging, documents, payments, and guidance."
          nextBestAction="Confirm enrollment details"
          expectedOutcome="The new client enters the operating system with a clear next step."
          confidence="High"
          successMetric="Client created with complete required details"
          actionHref="/admin/create-client"
          actionLabel="Create client"
        />
        <AdminRecommendedFirstItem
          title="Recommended first item"
          reason="The highest-value action is verifying that the client belongs in the system before creating work for the team."
          action="Confirm name, email, program fit, and welcome responsibility before submitting."
          outcome="The client record starts clean and immediately supports follow-up."
          href="/admin/create-client"
          actionLabel="Review form"
        />
        <CreateClientForm />
      </main>
    </div>
  );
}
