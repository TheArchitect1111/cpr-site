import '../../../portal.css';
import '../../parent-portal.css';
import '../../../updates.css';
import { getParentPortalData } from '@/lib/portal-data';
import { getPortalUpdates } from '@/lib/portal-updates';
import { site } from '@/config/site';
import { notFound } from 'next/navigation';
import PortalShell from '@/app/portal/components/PortalShell';
import UpdatePortalFeed from '@/app/portal/components/UpdatePortalFeed';
import WebsiteUpdateRequestForm from '@/app/portal/components/WebsiteUpdateRequestForm';

export const dynamic = 'force-dynamic';

export default async function ParentUpdatesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const portalData = await getParentPortalData(slug);
  if (!portalData) notFound();

  const { updates, live } = await getPortalUpdates(slug);
  const athleteName = portalData.firstName
    ? `${portalData.firstName} ${portalData.lastName}`.trim()
    : portalData.slug;

  return (
    <div className="portal-page">
      <PortalShell portalType="parent" slug={slug} active="updates" />
      <main className="portal-main pp-main">
        <WebsiteUpdateRequestForm portalType="parent" slug={slug} />
        <UpdatePortalFeed updates={updates} athleteName={athleteName} live={live} />
      </main>
      <footer className="portal-footer">
        <p>
          Canadian Prospects Recruitment &middot;{' '}
          <a href={`mailto:${site.footer.email}`}>{site.footer.email}</a>
        </p>
      </footer>
    </div>
  );
}
