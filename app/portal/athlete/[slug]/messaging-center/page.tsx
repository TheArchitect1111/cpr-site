import '../../../portal.css';
import '../../../resources/resources.css';
import '../../../sections/sections.css';
import { getAthlete } from '@/lib/athletes';
import { site } from '@/config/site';
import { notFound } from 'next/navigation';
import PortalSubpageLayout from '@/app/portal/components/PortalSubpageLayout';
import MessagingSection from '@/app/portal/sections/MessagingSection';
import { getMessagesBySlug } from '@/lib/sections-data';

export const dynamic = 'force-dynamic';

export default async function AthleteMessagingCenterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const athlete = await getAthlete(slug);
  if (!athlete) notFound();

  const { messages } = await getMessagesBySlug(slug);

  return (
    <PortalSubpageLayout portalType="athlete" slug={slug} active="messages">
      <MessagingSection portalType="athlete" initialMessages={messages} />
    </PortalSubpageLayout>
  );
}
