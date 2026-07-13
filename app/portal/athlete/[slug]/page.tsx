import '../../portal.css';
import '../../parent/parent-portal.css';
import '../../resources/resources.css';
import { getParentPortalData, getOpportunities } from '@/lib/portal-data';
import { site } from '@/config/site';
import { notFound } from 'next/navigation';
import PortalShell from '@/app/portal/components/PortalShell';
import PortalHomeSections from '@/app/portal/components/PortalHomeSections';
import PortalAnnouncements from '@/app/portal/components/PortalAnnouncements';
import GuidedTour from '@/app/portal/components/GuidedTour';
import PortalOwnerFab from '@/app/portal/components/PortalOwnerFab';
import { getPortalContent } from '@/lib/portal-content';
import { getPortalOwner } from '@/lib/portal-owner';
import { portalHomeTour } from '@/lib/portal-tours';

export const dynamic = 'force-dynamic';

export default async function AthletePortalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const portalData = await getParentPortalData(slug);
  if (!portalData) notFound();

  const [opportunities, content, owner] = await Promise.all([
    getOpportunities(portalData.recordId),
    getPortalContent(),
    getPortalOwner(),
  ]);
  const currentYear = new Date().getFullYear();
  const name = portalData.firstName || portalData.slug;
  const athleteName = portalData.firstName
    ? `${portalData.firstName} ${portalData.lastName}`.trim()
    : portalData.slug;

  const customHeading = content.hero.title.trim();
  const customSub = content.hero.subtitle.trim();

  return (
    <PortalShell portalType="athlete" slug={slug} active="home" firstName={name}>
      <main className="portal-main pp-main">
        <div className="pp-welcome">
          <div className="pp-welcome-top">
            <span className="pp-portal-label">ATHLETE PORTAL</span>
            <GuidedTour tourId="portal-athlete-home" steps={portalHomeTour('athlete', name)} />
          </div>
          {content.hero.imageUrl && (
            <img className="pp-hero-banner" src={content.hero.imageUrl} alt="" />
          )}
          <h1 className="pp-welcome-heading">
            {customHeading ? (
              customHeading
            ) : (
              <>Welcome back, <span className="pp-name">{name}</span>.</>
            )}
          </h1>
          <p className="pp-welcome-sub">
            {customSub || (
              <>
                Your recruiting command center — onboarding, school interest, Amplifi™, and live updates.
                {portalData.sport ? ` Sport: ${portalData.sport}.` : ''}
                {portalData.gradYear ? ` Class of ${portalData.gradYear}.` : ''}
              </>
            )}
          </p>
        </div>

        <PortalAnnouncements />

        <PortalHomeSections
          portalType="athlete"
          slug={slug}
          content={content}
          onboarding={portalData.onboarding}
          opportunities={opportunities}
          opportunityCount={opportunities.length}
          gradYear={portalData.gradYear}
          currentYear={currentYear}
          athleteName={athleteName}
        />
      </main>

      <footer className="portal-footer">
        <p>
          CPR Global Prospects &middot;{' '}
          <a href={`mailto:${site.footer.email}`}>{site.footer.email}</a>
        </p>
      </footer>

      {owner && <PortalOwnerFab href={`/portal/athlete/${slug}/updates/new`} />}
    </PortalShell>
  );
}


