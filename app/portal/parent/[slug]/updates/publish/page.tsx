import '../../../../portal.css';
import '../../../../parent/parent-portal.css';
import '../../../../updates.css';
import { getParentPortalData } from '@/lib/portal-data';
import { getPortalOwner } from '@/lib/portal-owner';
import { notFound, redirect } from 'next/navigation';
import PortalSubpageLayout from '@/app/portal/components/PortalSubpageLayout';
import PortalUpdateForm from '@/app/portal/components/PortalUpdateForm';

export const dynamic = 'force-dynamic';

/** Staff / owner immediate publish — coexists with client request form at /updates/new */
export default async function ParentUpdatesPublishPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const owner = await getPortalOwner();
  if (!owner) redirect(`/admin/login?next=/portal/parent/${slug}/updates/publish`);

  const portalData = await getParentPortalData(slug);
  if (!portalData) notFound();

  const athleteName = portalData.firstName
    ? `${portalData.firstName} ${portalData.lastName}`.trim()
    : portalData.slug;
  const base = `/portal/parent/${slug}`;

  return (
    <PortalSubpageLayout portalType="parent" slug={slug} active="updates" pageTitle="Staff publish">
      <PortalUpdateForm
        slug={slug}
        portalType="parent"
        ownerName={owner.name}
        athleteName={athleteName}
        updatesUrl={`${base}/updates`}
        showSocialOption={false}
      />
    </PortalSubpageLayout>
  );
}
