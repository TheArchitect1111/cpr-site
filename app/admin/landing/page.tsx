import '../../landing.css';
import '../admin.css';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/admin-auth';
import { landingConfig } from '@/config/landing';
import { getLandingContent } from '@/lib/landing-content';
import AdminCommandPalette from '@/app/admin/AdminCommandPalette';
import AdminEosSidebar from '@/app/admin/AdminEosSidebar';
import AdminExecutiveBrief from '@/app/admin/AdminExecutiveBrief';
import AdminRecommendedFirstItem from '@/app/admin/AdminRecommendedFirstItem';
import AdminLandingEditor from './AdminLandingEditor';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Edit Homepage - CPR Admin',
  robots: { index: false, follow: false },
};

export default async function AdminLandingPage() {
  const session = (await cookies()).get('cpr_admin_session')?.value || '';
  const admin = verifyAdminSession(session);
  if (!admin) redirect('/admin/login?next=/admin/landing');

  const content = await getLandingContent();

  return (
    <div className="admin-shell">
      <AdminEosSidebar activeRoute="homepage" />
      <main className="amain">
        <AdminCommandPalette permissions={[admin.role || 'admin']} />
        <AdminExecutiveBrief
          eyebrow="Creation"
          title="Make the homepage answer the next public decision."
          situation={content.updatedAt ? `Homepage content was last saved ${content.updatedAt.slice(0, 10)}.` : 'The homepage is using default content until an owner saves a first version.'}
          recommendation="Review the hero promise and primary call to action before editing secondary sections."
          why="The homepage should reduce hesitation for families and coaches before they explore details."
          nextBestAction="Review the hero and primary CTA"
          expectedOutcome="Visitors understand who CPR serves, why it matters, and what to do next."
          confidence={process.env.BLOB_READ_WRITE_TOKEN ? 'High' : 'Publishing setup needed'}
          successMetric="Homepage message confirmed or saved"
          actionHref="/admin/landing"
          actionLabel="Review homepage"
        />
        <AdminRecommendedFirstItem
          title="Start with the first-screen promise"
          reason="The hero section carries the highest decision weight for a first-time visitor."
          action="Confirm the headline, supporting copy, image, and CTA before changing lower-page content."
          outcome="The public site creates trust and a clear next step in the first few seconds."
          href="/admin/landing"
          actionLabel="Improve homepage"
        />
        <AdminLandingEditor
          initialContent={content}
          defaults={landingConfig}
          storageConfigured={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}
        />
      </main>
    </div>
  );
}
