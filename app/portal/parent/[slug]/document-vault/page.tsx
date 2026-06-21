import '../../../portal.css';
import '../../../resources/resources.css';
import '../../../sections/sections.css';
import { getParentPortalData } from '@/lib/portal-data';
import { site } from '@/config/site';
import { notFound } from 'next/navigation';
import PortalSubpageLayout from '@/app/portal/components/PortalSubpageLayout';
import DocumentVault from '@/app/portal/sections/DocumentVault';
import { getDocumentsBySlug } from '@/lib/sections-data';

export const dynamic = 'force-dynamic';

export default async function ParentDocumentVaultPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const portalData = await getParentPortalData(slug);
  if (!portalData) notFound();

  const { docs } = await getDocumentsBySlug(slug, 'parent');

  return (
    <PortalSubpageLayout portalType="parent" slug={slug} active="home">
      <DocumentVault docs={docs} />
    </PortalSubpageLayout>
  );
}
