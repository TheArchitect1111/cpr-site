import '../../../portal.css';
import '../../parent-portal.css';
import '../../../resources/resources.css';
import { getParentPortalData } from '@/lib/portal-data';
import { site } from '@/config/site';
import { notFound } from 'next/navigation';
import PortalSubpageLayout from '@/app/portal/components/PortalSubpageLayout';
import RecruitingTimeline from '@/app/portal/resources/RecruitingTimeline';

export const dynamic = 'force-dynamic';

export default async function ParentRecruitingTimelinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const portalData = await getParentPortalData(slug);
  if (!portalData) notFound();

  const currentYear = new Date().getFullYear();

  return (
    <PortalSubpageLayout portalType="parent" slug={slug} active="resources">
      <RecruitingTimeline
          gradYear={portalData.gradYear}
          currentYear={currentYear}
        />
    </PortalSubpageLayout>
  );
}
