import '../../../../portal.css';
import '../../../../parent/parent-portal.css';
import '../../../../updates.css';
import { cookies } from 'next/headers';
import { getParentPortalData } from '@/lib/portal-data';
import { PORTAL_COOKIE, verifySession } from '@/lib/portal-auth';
import { notFound, redirect } from 'next/navigation';
import PortalSubpageLayout from '@/app/portal/components/PortalSubpageLayout';
import ContentRequestForm from '@/app/portal/components/ContentRequestForm';

export const dynamic = 'force-dynamic';

export default async function AthleteUpdatesNewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const token = (await cookies()).get(PORTAL_COOKIE)?.value ?? '';
  const session = token ? await verifySession(token) : null;
  if (!session || session.slug !== slug) {
    redirect(`/portal/login?next=/portal/athlete/${slug}/updates/new`);
  }

  const portalData = await getParentPortalData(slug);
  if (!portalData) notFound();

  const athleteName = portalData.firstName
    ? `${portalData.firstName} ${portalData.lastName}`.trim()
    : portalData.slug;
  const base = `/portal/athlete/${slug}`;

  return (
    <PortalSubpageLayout portalType="athlete" slug={slug} active="updates" pageTitle="Request update">
      <ContentRequestForm
        slug={slug}
        portalType="athlete"
        athleteName={athleteName}
        updatesUrl={`${base}/updates`}
      />
    </PortalSubpageLayout>
  );
}
