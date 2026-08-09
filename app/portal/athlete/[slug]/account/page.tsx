import '../../../portal.css';
import '../../../login/portal-login.css';
import PortalShell from '@/app/portal/components/PortalShell';
import ChangePasswordForm from '@/app/portal/components/ChangePasswordForm';
import PortalProfileEditCard from '@/app/portal/components/PortalProfileEditCard';
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

  return (
    <PortalShell portalType="athlete" slug={slug} active="account">
      <main className="portal-main account-main">
        <PortalProfileEditCard athlete={athlete} />
        <ChangePasswordForm action="/api/portal/change-password" />
      </main>
    </PortalShell>
  );
}
