import '../../../portal.css';
import '../../../resources/resources.css';
import '../../../sections/sections.css';
import { getParentPortalData } from '@/lib/portal-data';
import { site } from '@/config/site';
import { notFound } from 'next/navigation';
import PortalSubpageLayout from '@/app/portal/components/PortalSubpageLayout';
import VideoLearningCenter from '@/app/portal/sections/VideoLearningCenter';
import { getResources } from '@/lib/sections-data';

export const dynamic = 'force-dynamic';

export default async function ParentVideoLearningCenterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const portalData = await getParentPortalData(slug);
  if (!portalData) notFound();

  const { resources } = await getResources();
  const videos = resources.filter((r) => r.type === 'Video');

  return (
    <PortalSubpageLayout portalType="parent" slug={slug} active="resources">
      <VideoLearningCenter resources={videos} />
    </PortalSubpageLayout>
  );
}
