import { Fragment, type ReactNode } from 'react';
import { eaChassis } from '@/config/ea-chassis';
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

  const learningTitle = sectionLabel(content, 'learning-center', 'Resources');
  const servicesTitle = sectionLabel(content, 'athlete-services', eaChassis.portalCopy.servicesEyebrow);
  const serviceCards = [
    {
      href: `${base}/video-learning-center`,
      title: 'Video Learning Center',
      description: 'Curated videos, lessons, and owner-selected learning resources.',
    },
    {
      href: `${base}/resource-library`,
      title: 'Resource Library',
      description: 'Videos, PDFs, articles, and links for the journey.',
    },
    {
      href: `${base}/ask-cpr`,
      title: eaChassis.portalCopy.askGuideTitle,
      description: eaChassis.portalCopy.askGuideDescription,
    },
    {
      href: `${base}/messaging-center`,
      title: eaChassis.portalCopy.messagingTitle,
      description: eaChassis.portalCopy.messagingDescription,
    },
    {
      href: `${base}/document-vault`,
      title: eaChassis.portalCopy.documentsTitle,
      description: eaChassis.portalCopy.documentsDescription,
    },
    {
      href: `${base}/upcoming-events`,
      title: eaChassis.portalCopy.eventsTitle,
      description: eaChassis.portalCopy.eventsDescription,
    },
  ];

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
        <p className="pp-section-eyebrow">{eaChassis.portalCopy.learningEyebrow}</p>
        <h2 className="pp-section-title">{learningTitle}</h2>
        <div className="res-nav-grid">
          {eaChassis.portalCopy.resourceCards.map((card, index) => (
          <a key={card.href} href={`${base}/${card.href}`} className="res-nav-card">
            <div className="res-nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                {index === 0 ? (
                  <>
                    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                  </>
                ) : index === 1 ? (
                  <>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </>
                ) : (
                  <>
                    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                  </>
                )}
              </svg>
            </div>
            <div className="res-nav-title">{card.title}</div>
            <div className="res-nav-desc">{card.description}</div>
            <div className="res-nav-arrow">View &#8594;</div>
          </a>
          ))}
        </div>
      </section>
    ),
    'athlete-services': (
      <section className="pp-section" data-portal-section="athlete-services">
        <p className="pp-section-eyebrow">{eaChassis.portalCopy.servicesEyebrow}</p>
        <h2 className="pp-section-title">{servicesTitle}</h2>
        <div className="res-nav-grid">
          {serviceCards.map((card) => (
          <a key={card.href} href={card.href} className="res-nav-card">
            <div className="res-nav-title">{card.title}</div>
            <div className="res-nav-desc">{card.description}</div>
            <div className="res-nav-arrow">View &#8594;</div>
          </a>
          ))}
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
