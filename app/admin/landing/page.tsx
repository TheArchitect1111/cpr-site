import '../../landing.css';
import '../admin.css';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/admin-auth';
import { landingConfig } from '@/config/landing';
import { getLandingContent } from '@/lib/landing-content';
import { EDITABLE_SURFACES } from '@/lib/surface-editor/registry';
import { getEditableSurfaceDocument } from '@/lib/surface-editor/store';
import { site } from '@/config/site';
import AdminLandingEditor from './AdminLandingEditor';
import SurfaceEditorClient from '../site-editor/SurfaceEditorClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Edit Homepage — CPR Admin',
  robots: { index: false, follow: false },
};

type Scope = 'homepage' | 'pages' | 'players' | 'portal';

export default async function AdminLandingPage({
  searchParams,
}: {
  searchParams?: Promise<{ scope?: string }>;
}) {
  const session = (await cookies()).get('cpr_admin_session')?.value || '';
  const admin = verifyAdminSession(session);
  if (!admin) redirect('/admin/login?next=/admin/landing');

  const requestedScope = (await searchParams)?.scope;
  const scope: Scope = ['pages', 'players', 'portal'].includes(requestedScope || '')
    ? (requestedScope as Scope)
    : 'homepage';

  const [content, surfaces] = await Promise.all([
    getLandingContent(),
    scope === 'pages'
      ? Promise.all(
          EDITABLE_SURFACES.map(async (manifest) => ({
            manifest,
            document: await getEditableSurfaceDocument(manifest),
          })),
        )
      : Promise.resolve([]),
  ]);

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
        <div className="aside-sec">EDIT CONTENT</div>
        <nav>
          <a className={`aitem${scope === 'homepage' ? ' active' : ''}`} href="/admin/landing">
            &#127760; Edit Homepage
          </a>
          <a className={`aitem${scope === 'pages' ? ' active' : ''}`} href="/admin/landing?scope=pages">
            Website Pages
          </a>
          <a className={`aitem${scope === 'players' ? ' active' : ''}`} href="/admin/landing?scope=players">
            Player Pages
          </a>
          <a className={`aitem${scope === 'portal' ? ' active' : ''}`} href="/admin/landing?scope=portal">
            Portal
          </a>
          <a className="aitem" href="/admin?tab=media-library">
            &#128247; Photo gallery
          </a>
          <a className="aitem" href="/admin">
            &#8592; Admin Console
          </a>
        </nav>
        <a className="aitem back" href="/">
          &#8592; View public site
        </a>
      </aside>
      <main className="amain">
        <header className="ahead">
          <div>
            <p className="admin-kicker">Guided CPR editor</p>
            <h1 className="display">Edit Homepage</h1>
            <p>
              This is the single editing workspace for the CPR website, player pages, and portal. Choose a content area, make the change, preview it, and save.
            </p>
          </div>
          <a className="admin-logout" href="/api/admin/logout">
            Sign Out
          </a>
        </header>

        {scope === 'homepage' ? (
          <AdminLandingEditor
            initialContent={content}
            defaults={landingConfig}
            storageConfigured={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}
          />
        ) : null}

        {scope === 'pages' && surfaces.length ? <SurfaceEditorClient surfaces={surfaces} /> : null}

        {scope === 'players' ? (
          <section className="admin-card">
            <p className="admin-kicker">Player pages</p>
            <h2>Edit player profiles</h2>
            <p>Choose a player, update their profile information and images, then submit the changes for review.</p>
            <a className="btn" href="/admin?tab=outreach#players">Open player list</a>
          </section>
        ) : null}

        {scope === 'portal' ? (
          <section className="admin-card">
            <p className="admin-kicker">Portal</p>
            <h2>Edit portal content</h2>
            <p>Post portal updates, manage announcements, events, images, reusable wording, and family-facing information.</p>
            <a className="btn" href="/admin/update-portal">Open portal content</a>
          </section>
        ) : null}
      </main>
    </div>
  );
}
