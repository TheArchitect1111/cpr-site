import '../../landing.css';
import '../admin.css';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/admin-auth';
import { getAthletes } from '@/lib/athletes';
import { getLandingContent } from '@/lib/landing-content';
import { getCollectionDef, type CollectionId } from '@/lib/admin-collections-schema';
import { listCollection } from '@/lib/admin-collections';
import AdminUpdatePortal from './AdminUpdatePortal';
import AdminCommandPalette from '@/app/admin/AdminCommandPalette';
import AdminEosSidebar from '@/app/admin/AdminEosSidebar';
import AdminExecutiveBrief from '@/app/admin/AdminExecutiveBrief';
import AdminRecommendedFirstItem from '@/app/admin/AdminRecommendedFirstItem';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Update Portal - CPR Admin',
  robots: { index: false, follow: false },
};

const OWNER_COLLECTIONS: CollectionId[] = [
  'site-updates',
  'site-events',
  'site-quotes',
  'media-library',
  'site-text',
];

export default async function AdminUpdatePortalPage() {
  const session = (await cookies()).get('cpr_admin_session')?.value || '';
  const admin = verifyAdminSession(session);
  if (!admin) redirect('/admin/login?next=/admin/update-portal');

  const [landing, athletes, collectionItems] = await Promise.all([
    getLandingContent(),
    getAthletes(),
    Promise.all(OWNER_COLLECTIONS.map(async (id) => ({ id, items: await listCollection(id) }))),
  ]);

  const collections = collectionItems.map(({ id, items }) => ({
    def: getCollectionDef(id)!,
    items,
  }));

  const athleteOptions = athletes.rows.map((athlete) => ({
    label: `${athlete.firstName ?? ''} ${athlete.lastName ?? ''}`.trim() || athlete.slug,
    value: athlete.slug,
  }));

  return (
    <div className="admin-shell">
      <AdminEosSidebar activeRoute="update-portal" />
      <main className="amain">
        <AdminCommandPalette permissions={[admin.role || 'admin']} />
        <AdminExecutiveBrief
          eyebrow="Creation"
          title="Decide what changed enough to publish."
          situation={`${collections.reduce((total, collection) => total + collection.items.length, 0)} content records are available across updates, events, quotes, media, and site text.`}
          recommendation="Start with the update or content item that will reduce the most uncertainty for families and coaches."
          why="Publishing should create clarity, not just add more public content."
          nextBestAction="Review the most useful update"
          expectedOutcome="The public portal reflects the next thing people need to know."
          confidence={process.env.BLOB_READ_WRITE_TOKEN ? 'High' : 'Publishing setup needed'}
          successMetric="One publish-ready item reviewed or updated"
          actionHref="/admin/update-portal"
          actionLabel="Review updates"
        />
        <AdminRecommendedFirstItem
          title={landing.updatedAt ? 'Confirm homepage and portal alignment' : 'Recommended first item'}
          reason={landing.updatedAt ? `Homepage content was last saved ${landing.updatedAt.slice(0, 10)}, so public updates should match the current promise.` : 'The homepage has no owner override yet, so publishing updates before the core message is confirmed can create mixed signals.'}
          action="Review the highest-visibility update before editing lower-impact content."
          outcome="Families and coaches see one coherent public message."
          href="/admin/update-portal"
          actionLabel="Review first update"
        />
        <AdminUpdatePortal
          landing={landing}
          collections={collections}
          athleteOptions={athleteOptions}
          storageConfigured={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}
        />
      </main>
    </div>
  );
}
