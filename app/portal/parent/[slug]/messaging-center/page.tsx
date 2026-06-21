import '../../../portal.css';
import '../../../resources/resources.css';
import '../../../sections/sections.css';
import { getParentPortalData } from '@/lib/portal-data';
import { site } from '@/config/site';
import { notFound } from 'next/navigation';
import PortalSubpageLayout from '@/app/portal/components/PortalSubpageLayout';
import MessagingSection from '@/app/portal/sections/MessagingSection';
import { getMessagesBySlug } from '@/lib/sections-data';

export const dynamic = 'force-dynamic';

export default async function ParentMessagingCenterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const portalData = await getParentPortalData(slug);
  if (!portalData) notFound();

  const { messages } = await getMessagesBySlug(slug);

  return (
    <PortalSubpageLayout portalType="parent" slug={slug} active="messages">
      <MessagingSection portalType="parent" initialMessages={messages} />
    </PortalSubpageLayout>
  );
}
