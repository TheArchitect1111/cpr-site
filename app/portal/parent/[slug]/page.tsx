import '../../portal.css';
import '../parent-portal.css';
import { getParentPortalData, getOpportunities } from '@/lib/portal-data';
import { site } from '@/config/site';
import { notFound } from 'next/navigation';
import OnboardingTracker from './OnboardingTracker';
import RecruitingRoadmap from './RecruitingRoadmap';
import MonthlyActionPlan from './MonthlyActionPlan';
import OpportunityTracker from './OpportunityTracker';

export const dynamic = 'force-dynamic';

export default async function ParentPortalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const portalData = await getParentPortalData(slug);
  if (!portalData) notFound();

  const opportunities = await getOpportunities(portalData.recordId);
  const currentYear = new Date().getFullYear();

  const parentName = portalData.parentName || 'Parent';
  const athleteName = portalData.firstName
    ? `${portalData.firstName} ${portalData.lastName}`.trim()
    : portalData.slug;

  return (
    <div className="portal-page">
      <header className="portal-header">
        <div className="portal-header-inner">
          <div className="portal-logo-row">
            <img src={site.brand.logo} alt="CPR" className="portal-logo-img" />
            <div>
              <div className="display b1">CANADIAN PROSPECTS</div>
              <div className="display b2">RECRUITMENT</div>
            </div>
          </div>
        </div>
      </header>

      <main className="portal-main pp-main">
        <div className="pp-welcome">
          <span className="pp-portal-label">PARENT PORTAL</span>
          <h1 className="pp-welcome-heading">
            Welcome, <span className="pp-name">{parentName}</span>.
          </h1>
          <p className="pp-welcome-sub">
            Tracking progress for <strong>{athleteName}</strong>.
            {portalData.sport ? ` Sport: ${portalData.sport}.` : ''}
            {portalData.gradYear ? ` Class of ${portalData.gradYear}.` : ''}
          </p>
        </div>

        <OnboardingTracker
          onboarding={portalData.onboarding}
          athleteName={athleteName}
        />

        <RecruitingRoadmap
          gradYear={portalData.gradYear}
          currentYear={currentYear}
        />

        <MonthlyActionPlan
          gradYear={portalData.gradYear}
          currentYear={currentYear}
        />

        <OpportunityTracker opportunities={opportunities} />
      </main>

      <footer className="portal-footer">
        <p>
          Canadian Prospects Recruitment &middot;{' '}
          <a href={`mailto:${site.footer.email}`}>{site.footer.email}</a>
        </p>
      </footer>
    </div>
  );
}
