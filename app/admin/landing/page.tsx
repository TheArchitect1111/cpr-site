import '../../landing.css';
import '../admin.css';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/admin-auth';
import { landingConfig } from '@/config/landing';
import { getLandingContent } from '@/lib/landing-content';
import { site } from '@/config/site';
import AdminLandingEditor from './AdminLandingEditor';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Edit Homepage — CPR Admin',
  robots: { index: false, follow: false },
};

export default async function AdminLandingPage() {
  const session = (await cookies()).get('cpr_admin_session')?.value || '';
  const admin = verifyAdminSession(session);
  if (!admin) redirect('/admin/login?next=/admin/landing');

  const content = await getLandingContent();

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
        <div className="aside-sec">WEBSITE</div>
        <nav>
          <a className="aitem active" href="/admin/landing">
            &#127760; Edit Homepage
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
            <p className="admin-kicker">Public website</p>
            <h1 className="display">Edit your homepage</h1>
            <p>Update each homepage section — hero, testimonials, process, results, and more — then save.</p>
          </div>
          <a className="admin-logout" href="/api/admin/logout">
            Sign Out
          </a>
        </header>
        <AdminLandingEditor
          initialContent={content}
          defaults={landingConfig}
          storageConfigured={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}
        />
      </main>
    </div>
  );
}
