import '../../../portal.css';
import '../../../login/portal-login.css';
import PortalShell from '@/app/portal/components/PortalShell';
import ChangePasswordForm from '@/app/portal/components/ChangePasswordForm';

export const metadata = {
  title: 'Account Settings · CPR Parent Portal',
  robots: { index: false, follow: false },
};

export default async function ParentAccountPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="portal-page">
      <PortalShell portalType="parent" slug={slug} active="account" />
      <main className="portal-main account-main">
        <ChangePasswordForm action="/api/portal/change-password" />
      </main>
    </div>
  );
}
