import '../../../portal.css';
import '../../../resources/resources.css';
import '../../../sections/sections.css';
import { getParentPortalData } from '@/lib/portal-data';
import { notFound } from 'next/navigation';
import PortalSubpageLayout from '@/app/portal/components/PortalSubpageLayout';
import UpcomingEvents from '@/app/portal/sections/UpcomingEvents';
import { getUpcomingEvents } from '@/lib/sections-data';

export const dynamic = 'force-dynamic';

export default async function ParentUpcomingEventsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const portalData = await getParentPortalData(slug);
  if (!portalData) notFound();

  const { events } = await getUpcomingEvents();

  return (
    <PortalSubpageLayout portalType="parent" slug={slug} active="home">
      <UpcomingEvents events={events} />
    </PortalSubpageLayout>
  );
}
