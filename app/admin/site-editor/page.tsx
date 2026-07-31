import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/admin-auth';
import { EDITABLE_SURFACES } from '@/lib/surface-editor/registry';
import { getEditableSurfaceDocument } from '@/lib/surface-editor/store';
import { site } from '@/config/site';
import SurfaceEditorClient from './SurfaceEditorClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Edit Website — CPR Admin', robots: { index: false, follow: false } };

export default async function SiteEditorPage() {
  const session = (await cookies()).get('cpr_admin_session')?.value || '';
  if (!verifyAdminSession(session)) redirect('/admin/login?next=/admin/site-editor');
  const surfaces = await Promise.all(EDITABLE_SURFACES.map(async (manifest) => ({ manifest, document: await getEditableSurfaceDocument(manifest) })));

  return (
    <div className="admin-shell">
      <aside className="aside">
        <div className="aside-brand"><img src={site.brand.logo} alt="CPR" /><div><div className="ab1 display">CPR GLOBAL PROSPECTS</div><div className="ab2 display">RECRUITMENT</div></div></div>
        <div className="aside-sec">WEBSITE</div>
        <nav>
          <a className="aitem active" href="/admin/site-editor">Edit Entire Website</a>
          <a className="aitem" href="/admin/landing">Edit Homepage</a>
          <a className="aitem" href="/admin/update-portal">Update Hub</a>
          <a className="aitem" href="/admin">← Admin Console</a>
        </nav>
        <a className="aitem back" href="/">← View public site</a>
      </aside>
      <main className="amain">
        <header className="ahead"><div><p className="admin-kicker">Website editor</p><h1 className="display">Edit your entire website</h1><p>Edit page sections, images, links and visibility. Application, payment, login and portal workflows remain protected.</p></div><a className="admin-logout" href="/api/admin/logout">Sign Out</a></header>
        <SurfaceEditorClient surfaces={surfaces} />
      </main>
    </div>
  );
}
