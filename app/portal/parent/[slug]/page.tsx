import '../../portal.css';
import '../parent-portal.css';
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

export default async function ParentPortalPage({
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

  const parentName = portalData.parentName || 'Parent';
  const athleteName = portalData.firstName
    ? `${portalData.firstName} ${portalData.lastName}`.trim()
    : portalData.slug;

  const customHeading = content.hero.title.trim();
  const customSub = content.hero.subtitle.trim();

  return (
    <PortalShell portalType="parent" slug={slug} active="home" firstName={parentName}>
      <main className="portal-main pp-main">
        <div className="pp-welcome">
          <div className="pp-welcome-top">
            <span className="pp-portal-label">PARENT PORTAL</span>
            <GuidedTour tourId="portal-parent-home" steps={portalHomeTour('parent', parentName)} />
          </div>
          {content.hero.imageUrl && (
            <img className="pp-hero-banner" src={content.hero.imageUrl} alt="" />
          )}
          <h1 className="pp-welcome-heading">
            {customHeading ? (
              customHeading
            ) : (
              <>Welcome, <span className="pp-name">{parentName}</span>.</>
            )}
          </h1>
          <p className="pp-welcome-sub">
            {customSub || (
              <>
                Tracking progress for <strong>{athleteName}</strong>.
                {portalData.sport ? ` Sport: ${portalData.sport}.` : ''}
                {portalData.gradYear ? ` Class of ${portalData.gradYear}.` : ''}
              </>
            )}
          </p>
        </div>

        <PortalAnnouncements />

        <PortalHomeSections
          portalType="parent"
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

      {owner && <PortalOwnerFab href={`/portal/parent/${slug}/updates/publish`} />}
    </PortalShell>
  );
}


