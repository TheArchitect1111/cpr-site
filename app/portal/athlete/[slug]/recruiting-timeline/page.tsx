import '../../../portal.css';
import '../../../resources/resources.css';
import { getAthlete } from '@/lib/athletes';
import { notFound } from 'next/navigation';
import PortalSubpageLayout from '@/app/portal/components/PortalSubpageLayout';
import RecruitingTimeline from '@/app/portal/resources/RecruitingTimeline';

export const dynamic = 'force-dynamic';

export default async function AthleteRecruitingTimelinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const athlete = await getAthlete(slug);
  if (!athlete) notFound();

  const currentYear = new Date().getFullYear();
  const gradYear = Number(athlete.gradYear) || 0;

  return (
    <PortalSubpageLayout portalType="athlete" slug={slug} active="resources">
      <RecruitingTimeline gradYear={gradYear} currentYear={currentYear} />
    </PortalSubpageLayout>
  );
}
