import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/admin-auth';
import { site } from '@/config/site';
import AmplifiCampaignBuilder from './AmplifiCampaignBuilder';
import '../../landing.css';
import '../admin.css';
import './amplifi-admin.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Amplifi Conversion Engine | CPR Admin',
  robots: { index: false, follow: false },
};

export default async function AmplifiAdminPage() {
  const session = (await cookies()).get('cpr_admin_session')?.value || '';
  const admin = verifyAdminSession(session);
  if (!admin) redirect('/admin/login?next=/admin/amplifi');

  return (
    <div className="amplifi-admin-shell">
      <header className="amplifi-admin-topbar">
        <a href="/admin" className="amplifi-admin-back">← CPR Admin</a>
        <a className="admin-logout" href="/api/admin/logout">Sign Out</a>
      </header>

      <main className="amplifi-admin-main">
        <section className="amplifi-admin-hero">
          <img src={site.brand.logo} alt="CPR" />
          <p className="admin-kicker">CPR Admin · Amplifi™</p>
          <h1>Build content that moves families to a useful next step.</h1>
          <p>
            The CPR strategy pack creates a balanced conversion campaign—not repeated captions.
            It attracts attention, teaches something useful, builds trust, answers objections, and makes one clear invitation.
          </p>
        </section>

        <section className="amplifi-admin-guide" aria-labelledby="amplifi-builder-title">
          <p className="admin-kicker">Conversion Content Engine</p>
          <h2 id="amplifi-builder-title">Create a CPR campaign</h2>
          <AmplifiCampaignBuilder />
        </section>

        <aside className="amplifi-admin-note">
          <strong>Built-in CPR safeguards</strong>
          <p>No scholarship or recruiting guarantees. No invented athlete facts or results. Proof-based posts remain unavailable unless facts and permission are explicitly verified.</p>
        </aside>
      </main>
    </div>
  );
}
