import '../../../portal.css';
import '../../../login/portal-login.css';
import PortalShell from '@/app/portal/components/PortalShell';
import ChangePasswordForm from '@/app/portal/components/ChangePasswordForm';
import { getAthletes } from '@/lib/athletes';

export const metadata = {
  title: 'Account Settings · CPR Portal',
  robots: { index: false, follow: false },
};

export default async function AthleteAccountPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { rows } = await getAthletes();
  const athlete = rows.find((row) => row.slug === slug);
  const editUrl = athlete?.editToken
    ? `/profile/edit?id=${encodeURIComponent(athlete.id)}&token=${encodeURIComponent(athlete.editToken)}`
    : '';

  return (
    <PortalShell portalType="athlete" slug={slug} active="account">
      <main className="portal-main account-main">
        {editUrl ? (
          <section className="account-card">
            <p className="pp-section-eyebrow">Player Profile</p>
            <h1>Manage Profile Images</h1>
            <p>Add, replace, or remove your profile photo. Changes are sent to CPR for review before publishing.</p>
            <a className="account-primary-link" href={editUrl}>Manage Profile Images</a>
          </section>
        ) : null}
        <ChangePasswordForm action="/api/portal/change-password" />
      </main>
    </PortalShell>
  );
}
