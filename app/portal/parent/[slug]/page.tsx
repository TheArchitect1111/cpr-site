import '../../portal.css';
import '../parent-portal.css';
import '../../resources/resources.css';
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

        <section className="pp-section">
          <p className="pp-section-eyebrow">Learning Center</p>
          <h2 className="pp-section-title">Recruiting Resources</h2>
          <div className="res-nav-grid">
            <a href={`/portal/parent/${slug}/recruiting-timeline`} className="res-nav-card">
              <div className="res-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </div>
              <div className="res-nav-title">Recruiting Timeline</div>
              <div className="res-nav-desc">Grade-by-grade guide covering academics, film, camps, and coach outreach timing.</div>
              <div className="res-nav-arrow">View &#8594;</div>
            </a>
            <a href={`/portal/parent/${slug}/eligibility-center`} className="res-nav-card">
              <div className="res-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div className="res-nav-title">Eligibility Center</div>
              <div className="res-nav-desc">NCAA D1, D2, NAIA, NJCAA, and U SPORTS eligibility requirements explained in plain language.</div>
              <div className="res-nav-arrow">View &#8594;</div>
            </a>
            <a href={`/portal/parent/${slug}/scholarship-center`} className="res-nav-card">
              <div className="res-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className="res-nav-title">Scholarship Center</div>
              <div className="res-nav-desc">Athletic scholarships, academic aid, need-based grants, and walk-on opportunities explained.</div>
              <div className="res-nav-arrow">View &#8594;</div>
            </a>
          </div>
        </section>
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
