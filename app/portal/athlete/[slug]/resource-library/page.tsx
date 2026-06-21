import '../../../portal.css';
import '../../../resources/resources.css';
import '../../../sections/sections.css';
import { getAthlete } from '@/lib/athletes';
import { site } from '@/config/site';
import { notFound } from 'next/navigation';
import PortalSubpageLayout from '@/app/portal/components/PortalSubpageLayout';
import ResourceLibrary from '@/app/portal/sections/ResourceLibrary';
import { getResources } from '@/lib/sections-data';

export const dynamic = 'force-dynamic';

export default async function AthleteResourceLibraryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const athlete = await getAthlete(slug);
  if (!athlete) notFound();

  const { resources } = await getResources();

  return (
    <PortalSubpageLayout portalType="athlete" slug={slug} active="resources">
      <ResourceLibrary resources={resources} />
    </PortalSubpageLayout>
  );
}
