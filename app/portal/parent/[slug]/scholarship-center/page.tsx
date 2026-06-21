import '../../../portal.css';
import '../../parent-portal.css';
import '../../../resources/resources.css';
import PortalSubpageLayout from '@/app/portal/components/PortalSubpageLayout';
import ScholarshipCenter from '@/app/portal/resources/ScholarshipCenter';

export const dynamic = 'force-dynamic';

export default async function ParentScholarshipCenterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <PortalSubpageLayout portalType="parent" slug={slug} active="resources">
      <ScholarshipCenter />
    </PortalSubpageLayout>
  );
}
