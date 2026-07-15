import '../../../portal.css';
import '../../parent-portal.css';
import '../../../../forms.css';
import { notFound } from 'next/navigation';
import PortalSubpageLayout from '@/app/portal/components/PortalSubpageLayout';
import PortalPaymentsPanel from '@/app/portal/components/PortalPaymentsPanel';
import { getPortalPaymentsSnapshot } from '@/lib/portal-payments';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Payments · CPR Parent Portal',
  robots: { index: false, follow: false },
};

export default async function ParentPaymentsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const snapshot = await getPortalPaymentsSnapshot(slug);
  if (!snapshot) notFound();

  return (
    <PortalSubpageLayout portalType="parent" slug={slug} active="payments" pageTitle="Payments">
      <PortalPaymentsPanel snapshot={snapshot} portalType="parent" />
    </PortalSubpageLayout>
  );
}
