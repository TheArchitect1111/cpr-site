import '../../../portal.css';
import '../../../parent/parent-portal.css';
import { getParentPortalData } from '@/lib/portal-data';
import { getPortalContent } from '@/lib/portal-content';
import { getPortalOwner } from '@/lib/portal-owner';
import { site } from '@/config/site';
import { notFound, redirect } from 'next/navigation';
import PortalShell from '@/app/portal/components/PortalShell';
import PortalOwnerHub from '@/app/portal/components/PortalOwnerHub';
import PortalOwnerFab from '@/app/portal/components/PortalOwnerFab';

export const dynamic = 'force-dynamic';

export default async function AthleteOwnerToolsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const owner = await getPortalOwner();
  if (!owner) redirect(`/admin/login?next=/portal/athlete/${slug}/owner`);

  const portalData = await getParentPortalData(slug);
  if (!portalData) notFound();

  const content = await getPortalContent();
  const athleteName = portalData.firstName
    ? `${portalData.firstName} ${portalData.lastName}`.trim()
    : portalData.slug;
  const base = `/portal/athlete/${slug}`;

  return (
    <PortalShell portalType="athlete" slug={slug} active="home">
      <main className="portal-main pp-main">
        <a href={base} className="res-back">&#8592; Back to Dashboard</a>
        <p className="owner-eyebrow">Owner Mode</p>
        <h1 className="pp-section-title">Advanced owner tools</h1>
        <p className="pp-section-sub">
          Sections, profiles, announcements, and Amplifi settings. For quick publishes, use{' '}
          <a href={`${base}/updates/publish`}>Update Hub</a>.
        </p>
        <PortalOwnerHub
          slug={slug}
          portalType="athlete"
          ownerName={owner.name}
          content={content}
          amplifiUrl={`${base}/amplifi`}
          athleteName={athleteName}
          defaultOpen
          hideFab
        />
      </main>
      <footer className="portal-footer">
        <p>
          CPR Global Prospects &middot;{' '}
          <a href={`mailto:${site.footer.email}`}>{site.footer.email}</a>
        </p>
      </footer>
      <PortalOwnerFab href={`${base}/updates/publish`} />
    </PortalShell>
  );
}



