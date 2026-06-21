import '../../../portal.css';
import '../../../resources/resources.css';
import '../../../sections/sections.css';
import { getAthlete } from '@/lib/athletes';
import { site } from '@/config/site';
import { notFound } from 'next/navigation';
import PortalSubpageLayout from '@/app/portal/components/PortalSubpageLayout';
import AskCprSection from '@/app/portal/sections/AskCprSection';
import { getTicketsBySlug } from '@/lib/sections-data';

export const dynamic = 'force-dynamic';

export default async function AthleteAskCprPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const athlete = await getAthlete(slug);
  if (!athlete) notFound();

  const { tickets } = await getTicketsBySlug(slug);

  return (
    <PortalSubpageLayout portalType="athlete" slug={slug} active="messages">
      <AskCprSection initialTickets={tickets} />
    </PortalSubpageLayout>
  );
}
