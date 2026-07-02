import { eaChassis } from '@/config/ea-chassis';
import { activeTenant, type HubModuleId } from '@/config/tenant';

export type PortalHubModule = {
  href: string;
  tag: string;
  title: string;
  description: string;
  variant?: 'amplifi' | 'updates' | 'default';
};

const MODULE_CATALOG: Record<
  HubModuleId,
  Omit<PortalHubModule, 'href'> & { path: string }
> = {
  dashboard: {
    path: '',
    tag: eaChassis.portalCopy.dashboardTag,
    title: eaChassis.portalCopy.dashboardTitle,
    description: eaChassis.portalCopy.dashboardDescription,
  },
  amplifi: {
    path: '/amplifi',
    tag: 'Amplifi',
    title: 'Your story, visualized',
    description: 'A cinematic view of progress, context, and what comes next.',
    variant: 'amplifi',
  },
  updates: {
    path: '/updates',
    tag: eaChassis.portalCopy.updatesTag,
    title: eaChassis.portalCopy.updatesTitle,
    description: eaChassis.portalCopy.updatesDescription,
    variant: 'updates',
  },
  'recruiting-timeline': {
    path: '/recruiting-timeline',
    tag: eaChassis.portalCopy.learningEyebrow,
    title: 'Timeline',
    description: 'A step-by-step guide for milestones, preparation, and next actions.',
  },
  'eligibility-center': {
    path: '/eligibility-center',
    tag: eaChassis.portalCopy.learningEyebrow,
    title: 'Requirements',
    description: 'Rules, requirements, and readiness checkpoints explained clearly.',
  },
  'scholarship-center': {
    path: '/scholarship-center',
    tag: eaChassis.portalCopy.learningEyebrow,
    title: 'Opportunities',
    description: 'Options, support paths, offers, and next decisions explained clearly.',
  },
  training: {
    path: '/video-learning-center',
    tag: 'Training',
    title: 'Training and learning',
    description: 'Upload materials, complete modules, and track progress.',
  },
  'video-learning': {
    path: '/video-learning-center',
    tag: eaChassis.portalCopy.servicesEyebrow,
    title: 'Video learning center',
    description: 'Curated videos, lessons, and owner-selected learning resources.',
  },
  'resource-library': {
    path: '/resource-library',
    tag: eaChassis.portalCopy.servicesEyebrow,
    title: 'Resource library',
    description: 'Videos, PDFs, articles, and links for the journey.',
  },
  'ask-guide': {
    path: '/ask-cpr',
    tag: eaChassis.portalCopy.askGuideTag,
    title: eaChassis.portalCopy.askGuideTitle,
    description: eaChassis.portalCopy.askGuideDescription,
  },
  messaging: {
    path: '/messaging-center',
    tag: 'Communication',
    title: eaChassis.portalCopy.messagingTitle,
    description: eaChassis.portalCopy.messagingDescription,
  },
  documents: {
    path: '/document-vault',
    tag: 'Documents',
    title: eaChassis.portalCopy.documentsTitle,
    description: eaChassis.portalCopy.documentsDescription,
  },
  events: {
    path: '/upcoming-events',
    tag: 'Events',
    title: eaChassis.portalCopy.eventsTitle,
    description: eaChassis.portalCopy.eventsDescription,
  },
  'opportunities-resources': {
    path: '/opportunities-resources',
    tag: 'Opportunities and Resources',
    title: 'Curated opportunities',
    description: 'Recommended partners, resources, benefits, and support options.',
  },
  'family-calendar': {
    path: '/upcoming-events',
    tag: 'Calendar',
    title: 'Shared calendar',
    description: 'Shared dates, reminders, and what is coming next.',
  },
};

export function getPortalHubModules(base: string): PortalHubModule[] {
  return activeTenant.hubModuleIds
    .map((id) => {
      const mod = MODULE_CATALOG[id];
      if (!mod) return null;
      const { path, ...rest } = mod;
      return { ...rest, href: `${base}${path}` };
    })
    .filter(Boolean) as PortalHubModule[];
}

export function getHubCopy() {
  return {
    eyebrow: eaChassis.organization.shortName,
    title: activeTenant.hubTitle,
    intro: activeTenant.hubIntro,
  };
}
