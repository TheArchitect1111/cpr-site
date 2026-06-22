import '../../portal.css';
import '../../parent/parent-portal.css';
import '../../resources/resources.css';
import { getParentPortalData, getOpportunities } from '@/lib/portal-data';
import { site } from '@/config/site';
import { notFound } from 'next/navigation';
import PortalShell from '@/app/portal/components/PortalShell';
import PortalHubCards from '@/app/portal/components/PortalHubCards';
import OnboardingTracker from '../../parent/[slug]/OnboardingTracker';
import RecruitingRoadmap from '../../parent/[slug]/RecruitingRoadmap';
import MonthlyActionPlan from '../../parent/[slug]/MonthlyActionPlan';
import OpportunityTracker from '../../parent/[slug]/OpportunityTracker';
import CprPortalHomeExperience from '@/app/portal/components/CprPortalHomeExperience';

export const dynamic = 'force-dynamic';

export default async function AthletePortalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const portalData = await getParentPortalData(slug);
  if (!portalData) notFound();

  const opportunities = await getOpportunities(portalData.recordId);
  const currentYear = new Date().getFullYear();
  const name = portalData.firstName || portalData.slug;
  const athleteName = portalData.firstName
    ? `${portalData.firstName} ${portalData.lastName}`.trim()
    : portalData.slug;

  return (
    <div className="portal-page">
      <PortalShell portalType="athlete" slug={slug} active="home" />

      <main className="portal-main pp-main">
        <div className="pp-welcome">
          <span className="pp-portal-label">ATHLETE PORTAL</span>
          <h1 className="pp-welcome-heading">
            Welcome back, <span className="pp-name">{name}</span>.
          </h1>
          <p className="pp-welcome-sub">
            Your recruiting command center — onboarding, school interest, Amplifi™, and live updates.
            {portalData.sport ? ` Sport: ${portalData.sport}.` : ''}
            {portalData.gradYear ? ` Class of ${portalData.gradYear}.` : ''}
          </p>
        </div>

        <PortalHubCards portalType="athlete" slug={slug} />

        <CprPortalHomeExperience
          slug={slug}
          portalType="athlete"
          onboarding={portalData.onboarding}
          opportunityCount={opportunities.length}
        />

        <OnboardingTracker onboarding={portalData.onboarding} athleteName={athleteName} />

        <RecruitingRoadmap gradYear={portalData.gradYear} currentYear={currentYear} />

        <MonthlyActionPlan gradYear={portalData.gradYear} currentYear={currentYear} />

        <OpportunityTracker opportunities={opportunities} />

        <section className="pp-section">
          <p className="pp-section-eyebrow">Learning Center</p>
          <h2 className="pp-section-title">Recruiting Resources</h2>
          <div className="res-nav-grid">
            <a href={`/portal/athlete/${slug}/recruiting-timeline`} className="res-nav-card">
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
            <a href={`/portal/athlete/${slug}/eligibility-center`} className="res-nav-card">
              <div className="res-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div className="res-nav-title">Eligibility Center</div>
              <div className="res-nav-desc">NCAA, NAIA, NJCAA, and U SPORTS eligibility requirements explained in plain language.</div>
              <div className="res-nav-arrow">View &#8594;</div>
            </a>
            <a href={`/portal/athlete/${slug}/scholarship-center`} className="res-nav-card">
              <div className="res-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className="res-nav-title">Scholarship Center</div>
              <div className="res-nav-desc">Athletic scholarships, academic aid, and walk-on opportunities explained.</div>
              <div className="res-nav-arrow">View &#8594;</div>
            </a>
          </div>
        </section>

        <section className="pp-section">
          <p className="pp-section-eyebrow">Athlete Services</p>
          <h2 className="pp-section-title">Portal Tools</h2>
          <div className="res-nav-grid">
            <a href={`/portal/athlete/${slug}/video-learning-center`} className="res-nav-card">
              <div className="res-nav-title">Video Learning Center</div>
              <div className="res-nav-desc">Coach-curated videos covering film, recruiting strategy, and skill development.</div>
              <div className="res-nav-arrow">View &#8594;</div>
            </a>
            <a href={`/portal/athlete/${slug}/resource-library`} className="res-nav-card">
              <div className="res-nav-title">Resource Library</div>
              <div className="res-nav-desc">Videos, PDFs, articles, and links for your journey.</div>
              <div className="res-nav-arrow">View &#8594;</div>
            </a>
            <a href={`/portal/athlete/${slug}/ask-cpr`} className="res-nav-card">
              <div className="res-nav-title">Ask CPR</div>
              <div className="res-nav-desc">Submit questions directly to Coach Mike.</div>
              <div className="res-nav-arrow">View &#8594;</div>
            </a>
            <a href={`/portal/athlete/${slug}/messaging-center`} className="res-nav-card">
              <div className="res-nav-title">Messaging Center</div>
              <div className="res-nav-desc">Direct messages with the CPR team.</div>
              <div className="res-nav-arrow">View &#8594;</div>
            </a>
            <a href={`/portal/athlete/${slug}/document-vault`} className="res-nav-card">
              <div className="res-nav-title">Document Vault</div>
              <div className="res-nav-desc">Recruiting profile and eligibility documents.</div>
              <div className="res-nav-arrow">View &#8594;</div>
            </a>
            <a href={`/portal/athlete/${slug}/upcoming-events`} className="res-nav-card">
              <div className="res-nav-title">Upcoming Events</div>
              <div className="res-nav-desc">Showcases, camps, and workshops curated for CPR athletes.</div>
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
