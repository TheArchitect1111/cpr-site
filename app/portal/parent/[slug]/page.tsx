import '../../portal.css';
import '../parent-portal.css';
import '../../resources/resources.css';
import { getParentPortalData, getOpportunities } from '@/lib/portal-data';
import { site } from '@/config/site';
import { notFound } from 'next/navigation';
import PortalShell from '@/app/portal/components/PortalShell';
import PortalHubCards from '@/app/portal/components/PortalHubCards';
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
      <PortalShell portalType="parent" slug={slug} active="home" />

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

        <PortalHubCards portalType="parent" slug={slug} />

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

        <section className="pp-section">
          <p className="pp-section-eyebrow">Athlete Services</p>
          <h2 className="pp-section-title">Portal Tools</h2>
          <div className="res-nav-grid">
            <a href={`/portal/parent/${slug}/video-learning-center`} className="res-nav-card">
              <div className="res-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
                </svg>
              </div>
              <div className="res-nav-title">Video Learning Center</div>
              <div className="res-nav-desc">Coach-curated videos covering film, recruiting strategy, and skill development.</div>
              <div className="res-nav-arrow">View &#8594;</div>
            </a>
            <a href={`/portal/parent/${slug}/resource-library`} className="res-nav-card">
              <div className="res-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
              <div className="res-nav-title">Resource Library</div>
              <div className="res-nav-desc">All resources in one place: videos, PDFs, articles, and links for your journey.</div>
              <div className="res-nav-arrow">View &#8594;</div>
            </a>
            <a href={`/portal/parent/${slug}/ask-cpr`} className="res-nav-card">
              <div className="res-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div className="res-nav-title">Ask CPR</div>
              <div className="res-nav-desc">Submit questions directly to Coach Mike and get answers within 1 business day.</div>
              <div className="res-nav-arrow">View &#8594;</div>
            </a>
            <a href={`/portal/parent/${slug}/messaging-center`} className="res-nav-card">
              <div className="res-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div className="res-nav-title">Messaging Center</div>
              <div className="res-nav-desc">Direct messages with the CPR team. Stay connected throughout the recruiting process.</div>
              <div className="res-nav-arrow">View &#8594;</div>
            </a>
            <a href={`/portal/parent/${slug}/document-vault`} className="res-nav-card">
              <div className="res-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div className="res-nav-title">Document Vault</div>
              <div className="res-nav-desc">Your athlete's recruiting profile, eligibility docs, and files from the CPR team.</div>
              <div className="res-nav-arrow">View &#8594;</div>
            </a>
            <a href={`/portal/parent/${slug}/upcoming-events`} className="res-nav-card">
              <div className="res-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div className="res-nav-title">Upcoming Events</div>
              <div className="res-nav-desc">Showcases, camps, webinars, and workshops curated for CPR athletes.</div>
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
