import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/admin-auth';
import { site } from '@/config/site';
import '../../landing.css';
import '../admin.css';
import './amplifi-admin.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Amplifi | CPR Admin',
  robots: { index: false, follow: false },
};

export default async function AmplifiAdminPage() {
  const session = (await cookies()).get('cpr_admin_session')?.value || '';
  const admin = verifyAdminSession(session);
  if (!admin) redirect('/admin/login?next=/admin/amplifi');

  const automaticPublishingConfigured = Boolean(process.env.AMPLIFI_PUBLISH_WEBHOOK_URL);

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
          <h1>Create and publish CPR social content</h1>
          <p>
            Turn a player update, event, announcement, or success story into content for the CPR portal and social media.
          </p>
          <div className="amplifi-admin-actions">
            <a className="amplifi-admin-primary" href="/admin/update-portal">Create a social post</a>
            <span className={automaticPublishingConfigured ? 'amplifi-status ready' : 'amplifi-status manual'}>
              {automaticPublishingConfigured ? 'Automatic publishing connected' : 'Manual social handoff active'}
            </span>
          </div>
        </section>

        <section className="amplifi-admin-guide" aria-labelledby="amplifi-guide-title">
          <p className="admin-kicker">How to use it</p>
          <h2 id="amplifi-guide-title">From update to published post</h2>
          <ol>
            <li><strong>Open Create a social post.</strong><span>Select the athlete and enter the update title and message.</span></li>
            <li><strong>Select Social media (Amplifi).</strong><span>You can also select the CPR website to publish the same update in both places.</span></li>
            <li><strong>Add the social caption.</strong><span>Use the short version you want CPR followers to read.</span></li>
            <li><strong>Publish the update.</strong><span>Amplifi prepares the social post and sends it through the configured publishing connection.</span></li>
            <li><strong>Review the result.</strong><span>If automatic publishing is not connected, use the Facebook handoff or copy the prepared caption.</span></li>
          </ol>
        </section>

        <aside className="amplifi-admin-note">
          <strong>Before posting</strong>
          <p>Confirm player or parent permission for every photo, video, name, statistic, and recruiting update.</p>
        </aside>
      </main>
    </div>
  );
}
