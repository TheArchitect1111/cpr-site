import '../../../portal.css';
import '../../../parent/parent-portal.css';
import '../../../updates.css';
import { getParentPortalData } from '@/lib/portal-data';
import { getPortalUpdates } from '@/lib/portal-updates';
import { listForAthlete } from '@/lib/content-requests';
import { getPublishedFeedItems, getPendingRequests } from '@/lib/update-hub-feed';
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

  const [{ updates, live: activityLive }, contentResult, owner] = await Promise.all([
    getPortalUpdates(slug),
    listForAthlete(slug),
    getPortalOwner(),
  ]);

  const publishedFeed = getPublishedFeedItems(contentResult.records);
  const pendingRequests = getPendingRequests(contentResult.records);
  const athleteName = portalData.firstName
    ? `${portalData.firstName} ${portalData.lastName}`.trim()
    : portalData.slug;
  const base = `/portal/athlete/${slug}`;

  return (
    <PortalShell portalType="athlete" slug={slug} active="updates">
      <main className="portal-main pp-main">
        <UpdatePortalFeed
          publishedFeed={publishedFeed}
          pendingRequests={pendingRequests}
          activityUpdates={updates}
          athleteName={athleteName}
          live={contentResult.live || activityLive}
          requestUrl={`${base}/updates/new`}
          ownerPostUrl={owner ? `${base}/updates/publish` : undefined}
        />
      </main>
      <footer className="portal-footer">
        <p>
          CPR Global Prospects &middot;{' '}
          <a href={`mailto:${site.footer.email}`}>{site.footer.email}</a>
        </p>
      </footer>
      {owner && <PortalOwnerFab href={`${base}/updates/publish`} />}
    </PortalShell>
  );
}
