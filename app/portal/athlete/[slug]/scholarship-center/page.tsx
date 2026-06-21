import '../../../portal.css';
import '../../../resources/resources.css';
import PortalSubpageLayout from '@/app/portal/components/PortalSubpageLayout';
import ScholarshipCenter from '@/app/portal/resources/ScholarshipCenter';

export const dynamic = 'force-dynamic';

export default async function AthleteScholarshipCenterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <PortalSubpageLayout portalType="athlete" slug={slug} active="resources">
      <ScholarshipCenter />
    </PortalSubpageLayout>
  );
}
