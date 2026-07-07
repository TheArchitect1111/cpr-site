import '../../../portal.css';
import '../../../resources/resources.css';
import '../../../sections/sections.css';
import { getAthlete } from '@/lib/athletes';
import { notFound } from 'next/navigation';
import PortalSubpageLayout from '@/app/portal/components/PortalSubpageLayout';
import UpcomingEvents from '@/app/portal/sections/UpcomingEvents';
import { getUpcomingEvents } from '@/lib/sections-data';

export const dynamic = 'force-dynamic';

export default async function AthleteUpcomingEventsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const athlete = await getAthlete(slug);
  if (!athlete) notFound();

  const { events } = await getUpcomingEvents();

  return (
    <PortalSubpageLayout portalType="athlete" slug={slug} active="home">
      <UpcomingEvents events={events} />
    </PortalSubpageLayout>
  );
}
