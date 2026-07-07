import '../../../portal.css';
import '../../../resources/resources.css';
import '../../../sections/sections.css';
import { getParentPortalData } from '@/lib/portal-data';
import { notFound } from 'next/navigation';
import PortalSubpageLayout from '@/app/portal/components/PortalSubpageLayout';
import AskCprSection from '@/app/portal/sections/AskCprSection';
import { getTicketsBySlug } from '@/lib/sections-data';

export const dynamic = 'force-dynamic';

export default async function ParentAskCprPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const portalData = await getParentPortalData(slug);
  if (!portalData) notFound();

  const { tickets } = await getTicketsBySlug(slug);

  return (
    <PortalSubpageLayout portalType="parent" slug={slug} active="messages">
      <AskCprSection initialTickets={tickets} />
    </PortalSubpageLayout>
  );
}
