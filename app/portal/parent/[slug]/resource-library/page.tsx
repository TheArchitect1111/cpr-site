import '../../../portal.css';
import '../../../resources/resources.css';
import '../../../sections/sections.css';
import { getParentPortalData } from '@/lib/portal-data';
import { notFound } from 'next/navigation';
import PortalSubpageLayout from '@/app/portal/components/PortalSubpageLayout';
import ResourceLibrary from '@/app/portal/sections/ResourceLibrary';
import { getResources } from '@/lib/sections-data';

export const dynamic = 'force-dynamic';

export default async function ParentResourceLibraryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const portalData = await getParentPortalData(slug);
  if (!portalData) notFound();

  const { resources } = await getResources();

  return (
    <PortalSubpageLayout portalType="parent" slug={slug} active="resources">
      <ResourceLibrary resources={resources} />
    </PortalSubpageLayout>
  );
}
