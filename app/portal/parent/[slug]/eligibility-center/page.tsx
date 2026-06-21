import '../../../portal.css';
import '../../parent-portal.css';
import '../../../resources/resources.css';
import PortalSubpageLayout from '@/app/portal/components/PortalSubpageLayout';
import EligibilityCenter from '@/app/portal/resources/EligibilityCenter';

export const dynamic = 'force-dynamic';

export default async function ParentEligibilityCenterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <PortalSubpageLayout portalType="parent" slug={slug} active="resources">
      <EligibilityCenter />
    </PortalSubpageLayout>
  );
}
