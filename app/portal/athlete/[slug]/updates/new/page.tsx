import '../../../../portal.css';
import '../../../../parent/parent-portal.css';
import '../../../../updates.css';
import { getParentPortalData } from '@/lib/portal-data';
import { getPortalOwner } from '@/lib/portal-owner';
import { notFound, redirect } from 'next/navigation';
import PortalSubpageLayout from '@/app/portal/components/PortalSubpageLayout';
import PortalUpdateForm from '@/app/portal/components/PortalUpdateForm';

export const dynamic = 'force-dynamic';

export default async function AthleteUpdatesNewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const owner = await getPortalOwner();
  if (!owner) redirect(`/admin/login?next=/portal/athlete/${slug}/updates/new`);

  const portalData = await getParentPortalData(slug);
  if (!portalData) notFound();

  const athleteName = portalData.firstName
    ? `${portalData.firstName} ${portalData.lastName}`.trim()
    : portalData.slug;
  const base = `/portal/athlete/${slug}`;

  return (
    <PortalSubpageLayout portalType="athlete" slug={slug} active="updates">
      <PortalUpdateForm
        slug={slug}
        portalType="athlete"
        ownerName={owner.name}
        athleteName={athleteName}
        updatesUrl={`${base}/updates`}
        showSocialOption
      />
    </PortalSubpageLayout>
  );
}
