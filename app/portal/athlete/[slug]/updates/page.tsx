import '../../../portal.css';
import '../../../parent/parent-portal.css';
import '../../../updates.css';
import { getParentPortalData } from '@/lib/portal-data';
import { getPortalUpdates } from '@/lib/portal-updates';
import { site } from '@/config/site';
import { notFound } from 'next/navigation';
import PortalShell from '@/app/portal/components/PortalShell';
import UpdatePortalFeed from '@/app/portal/components/UpdatePortalFeed';
import PortalOwnerFab from '@/app/portal/components/PortalOwnerFab';
import { getPortalOwner } from '@/lib/portal-owner';

export const dynamic = 'force-dynamic';

export default async function AthleteUpdatesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const portalData = await getParentPortalData(slug);
  if (!portalData) notFound();

  const { updates, live } = await getPortalUpdates(slug);
  const owner = await getPortalOwner();
  const athleteName = portalData.firstName
    ? `${portalData.firstName} ${portalData.lastName}`.trim()
    : portalData.slug;

  return (
    <div className="portal-page">
      <PortalShell portalType="athlete" slug={slug} active="updates" />
      <main className="portal-main pp-main">
        <UpdatePortalFeed
          updates={updates}
          athleteName={athleteName}
          live={live}
          ownerPostUrl={owner ? `/portal/athlete/${slug}/updates/new` : undefined}
        />
      </main>
      <footer className="portal-footer">
        <p>
          CPR Global Prospects &middot;{' '}
          <a href={`mailto:${site.footer.email}`}>{site.footer.email}</a>
        </p>
      </footer>
      {owner && <PortalOwnerFab href={`/portal/athlete/${slug}/updates/new`} />}
    </div>
  );
}
