import { Fragment, type ReactNode } from 'react';
import PortalHubCards from '@/app/portal/components/PortalHubCards';
import CprPortalHomeExperience from '@/app/portal/components/CprPortalHomeExperience';
import OnboardingTracker from '@/app/portal/parent/[slug]/OnboardingTracker';
import RecruitingRoadmap from '@/app/portal/parent/[slug]/RecruitingRoadmap';
import MonthlyActionPlan from '@/app/portal/parent/[slug]/MonthlyActionPlan';
import OpportunityTracker from '@/app/portal/parent/[slug]/OpportunityTracker';
import {
  visibleSections,
  sectionLabel,
  type PortalContent,
  type PortalSectionId,
} from '@/lib/portal-content';
import type { OnboardingData, Opportunity } from '@/lib/portal-data';

type Props = {
  portalType: 'athlete' | 'parent';
  slug: string;
  content: PortalContent;
  onboarding: OnboardingData;
  opportunities: Opportunity[];
  opportunityCount: number;
  gradYear: number;
  currentYear: number;
  athleteName: string;
};

export default function PortalHomeSections({
  portalType,
  slug,
  content,
  onboarding,
  opportunities,
  opportunityCount,
  gradYear,
  currentYear,
  athleteName,
}: Props) {
  const base = `/portal/${portalType}/${slug}`;

  const learningTitle = sectionLabel(content, 'learning-center', 'Recruiting Resources');
  const servicesTitle = sectionLabel(content, 'athlete-services', 'Portal Tools');

  const blocks: Record<PortalSectionId, ReactNode> = {
    'hub-cards': (
      <div data-tour="hub-cards" data-portal-section="hub-cards">
        <PortalHubCards portalType={portalType} slug={slug} />
      </div>
    ),
    'action-center': (
      <div data-tour="action-center" data-portal-section="action-center">
        <CprPortalHomeExperience
          slug={slug}
          portalType={portalType}
          onboarding={onboarding}
          opportunityCount={opportunityCount}
        />
      </div>
    ),
    onboarding: (
      <div data-tour="onboarding" data-portal-section="onboarding">
        <OnboardingTracker onboarding={onboarding} athleteName={athleteName} />
      </div>
    ),
    roadmap: (
      <div data-tour="roadmap" data-portal-section="roadmap">
        <RecruitingRoadmap gradYear={gradYear} currentYear={currentYear} />
      </div>
    ),
    'action-plan': (
      <div data-portal-section="action-plan">
        <MonthlyActionPlan gradYear={gradYear} currentYear={currentYear} />
      </div>
    ),
    opportunities: (
      <div data-portal-section="opportunities">
        <OpportunityTracker opportunities={opportunities} />
      </div>
    ),
    'learning-center': (
      <section className="pp-section" data-tour="learning-center" data-portal-section="learning-center">
        <p className="pp-section-eyebrow">Learning Center</p>
        <h2 className="pp-section-title">{learningTitle}</h2>
        <div className="res-nav-grid">
          <a href={`${base}/recruiting-timeline`} className="res-nav-card">
            <div className="res-nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </div>
            <div className="res-nav-title">Recruiting Timeline</div>
            <div className="res-nav-desc">Grade-by-grade guide covering academics, film, camps, and coach outreach timing.</div>
            <div className="res-nav-arrow">View &#8594;</div>
          </a>
          <a href={`${base}/eligibility-center`} className="res-nav-card">
            <div className="res-nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="res-nav-title">Eligibility Center</div>
            <div className="res-nav-desc">NCAA, NAIA, NJCAA, and U SPORTS eligibility requirements explained in plain language.</div>
            <div className="res-nav-arrow">View &#8594;</div>
          </a>
          <a href={`${base}/scholarship-center`} className="res-nav-card">
            <div className="res-nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="res-nav-title">Scholarship Center</div>
            <div className="res-nav-desc">Athletic scholarships, academic aid, and walk-on opportunities explained.</div>
            <div className="res-nav-arrow">View &#8594;</div>
          </a>
        </div>
      </section>
    ),
    'athlete-services': (
      <section className="pp-section" data-portal-section="athlete-services">
        <p className="pp-section-eyebrow">Athlete Services</p>
        <h2 className="pp-section-title">{servicesTitle}</h2>
        <div className="res-nav-grid">
          <a href={`${base}/video-learning-center`} className="res-nav-card">
            <div className="res-nav-title">Video Learning Center</div>
            <div className="res-nav-desc">Coach-curated videos covering film, recruiting strategy, and skill development.</div>
            <div className="res-nav-arrow">View &#8594;</div>
          </a>
          <a href={`${base}/resource-library`} className="res-nav-card">
            <div className="res-nav-title">Resource Library</div>
            <div className="res-nav-desc">Videos, PDFs, articles, and links for your journey.</div>
            <div className="res-nav-arrow">View &#8594;</div>
          </a>
          <a href={`${base}/ask-cpr`} className="res-nav-card">
            <div className="res-nav-title">Ask CPR</div>
            <div className="res-nav-desc">Submit questions directly to Coach Mike.</div>
            <div className="res-nav-arrow">View &#8594;</div>
          </a>
          <a href={`${base}/messaging-center`} className="res-nav-card">
            <div className="res-nav-title">Messaging Center</div>
            <div className="res-nav-desc">Direct messages with the CPR team.</div>
            <div className="res-nav-arrow">View &#8594;</div>
          </a>
          <a href={`${base}/document-vault`} className="res-nav-card">
            <div className="res-nav-title">Document Vault</div>
            <div className="res-nav-desc">Recruiting profile and eligibility documents.</div>
            <div className="res-nav-arrow">View &#8594;</div>
          </a>
          <a href={`${base}/upcoming-events`} className="res-nav-card">
            <div className="res-nav-title">Upcoming Events</div>
            <div className="res-nav-desc">Showcases, camps, and workshops curated for CPR athletes.</div>
            <div className="res-nav-arrow">View &#8594;</div>
          </a>
        </div>
      </section>
    ),
  };

  return (
    <>
      {visibleSections(content).map((s) => (
        <Fragment key={s.id}>{blocks[s.id]}</Fragment>
      ))}
    </>
  );
}
