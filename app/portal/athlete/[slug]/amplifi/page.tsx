import '../../../portal.css';
import '../../../parent/parent-portal.css';
import '../../../amplifi.css';
import { getParentPortalData, getOpportunities, onboardingProgress } from '@/lib/portal-data';
import { site } from '@/config/site';
import { notFound } from 'next/navigation';
import PortalShell from '@/app/portal/components/PortalShell';
import AmplifiExperience from '@/app/portal/components/AmplifiExperience';

export const dynamic = 'force-dynamic';

export default async function AthleteAmplifiPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const portalData = await getParentPortalData(slug);
  if (!portalData) notFound();

  const opportunities = await getOpportunities(portalData.recordId);

  return (
    <PortalShell portalType="athlete" slug={slug} active="amplifi">
      <main className="portal-main pp-main">
        <AmplifiExperience
          firstName={portalData.firstName}
          lastName={portalData.lastName}
          gradYear={portalData.gradYear}
          sport={portalData.sport}
          onboardingPct={onboardingProgress(portalData.onboarding)}
          opportunityCount={opportunities.length}
          portalType="athlete"
          slug={slug}
        />
      </main>
      <footer className="portal-footer">
        <p>
          CPR Global Prospects &middot;{' '}
          <a href={`mailto:${site.footer.email}`}>{site.footer.email}</a>
        </p>
      </footer>
    </PortalShell>
  );
}



