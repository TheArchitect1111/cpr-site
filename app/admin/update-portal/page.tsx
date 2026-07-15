import '../../landing.css';
import '../admin.css';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/admin-auth';
import { site } from '@/config/site';
import { getAthletes } from '@/lib/athletes';
import { getLandingContent } from '@/lib/landing-content';
import { getCollectionDef, type CollectionId } from '@/lib/admin-collections-schema';
import { listCollection } from '@/lib/admin-collections';
import AdminUpdatePortal from './AdminUpdatePortal';

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
          <a className="aitem active" href="/admin/update-portal">Update Portal</a>
          <a className="aitem" href="/admin/content-requests">Content Requests</a>
          <a className="aitem" href="/admin/landing">Edit Homepage</a>
          <a className="aitem" href="/admin?tab=communication">Communication Center</a>
          <a className="aitem" href="/portal/owner">Family Portal Owner</a>
        </nav>
        <div className="aside-sec">CONTENT</div>
        <nav>
          <a className="aitem" href="/admin?tab=site-events">Events</a>
          <a className="aitem" href="/admin?tab=site-quotes">Quotes</a>
          <a className="aitem" href="/admin?tab=media-library">Images</a>
          <a className="aitem" href="/admin?tab=site-text">Site Text</a>
        </nav>
        <a className="aitem back" href="/admin">Back to Admin</a>
        <a className="aitem back" href="/">View public site</a>
      </aside>
      <main className="amain">
        <header className="ahead">
          <div>
            <p className="admin-kicker">Signed in as {admin.name || admin.email}</p>
            <h1 className="display">Update Portal</h1>
            <p>Premium owner controls for public site, portal updates, announcements, events, quotes, images, and reusable text.</p>
          </div>
          <a className="admin-logout" href="/api/admin/logout">Sign Out</a>
        </header>
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
