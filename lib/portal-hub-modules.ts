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
    tag: 'Command Center',
    title: activeTenant.id === 'family-hub' ? 'Family dashboard' : 'Recruiting dashboard',
    description:
      activeTenant.id === 'family-hub'
        ? 'Onboarding, family milestones, and what deserves attention today.'
        : 'Onboarding, school interest, roadmap, and opportunity tracking.',
  },
  amplifi: {
    path: '/amplifi',
    tag: 'Amplifi™',
    title: activeTenant.id === 'family-hub' ? 'Your story, visualized' : 'Your future, visualized',
    description:
      activeTenant.id === 'family-hub'
        ? 'Share your family journey with cinematic clarity.'
        : 'Cinematic vision of your recruiting journey — potential through success.',
    variant: 'amplifi',
  },
  updates: {
    path: '/updates',
    tag: 'Update Portal',
    title: activeTenant.id === 'family-hub' ? 'Family activity feed' : 'Real-time recruiting feed',
    description:
      activeTenant.id === 'family-hub'
        ? 'Announcements, milestones, and team updates in one timeline.'
        : 'Coach outreach, school interest, messages, and CPR activity in one timeline.',
    variant: 'updates',
  },
  'recruiting-timeline': {
    path: '/recruiting-timeline',
    tag: 'Learning Center',
    title: 'Recruiting timeline',
    description: 'Grade-by-grade guide for academics, film, camps, and coach outreach.',
  },
  'eligibility-center': {
    path: '/eligibility-center',
    tag: 'Learning Center',
    title: 'Eligibility center',
    description: 'NCAA, NAIA, NJCAA, and U SPORTS requirements in plain language.',
  },
  'scholarship-center': {
    path: '/scholarship-center',
    tag: 'Learning Center',
    title: 'Scholarship center',
    description: 'Athletic scholarships, academic aid, and walk-on opportunities explained.',
  },
  training: {
    path: '/video-learning-center',
    tag: 'Training Transformation™',
    title: 'Training & learning',
    description: 'Upload materials, complete modules, and track progress.',
  },
  'video-learning': {
    path: '/video-learning-center',
    tag: activeTenant.id === 'family-hub' ? 'Family Learning' : 'Athlete Services',
    title: 'Video learning center',
    description:
      activeTenant.id === 'family-hub'
        ? 'Curated videos for family growth, planning, and development.'
        : 'Coach-curated videos on film, recruiting strategy, and skill development.',
  },
  'resource-library': {
    path: '/resource-library',
    tag: activeTenant.id === 'family-hub' ? 'Resources' : 'Athlete Services',
    title: 'Resource library',
    description: 'Videos, PDFs, articles, and links for your journey.',
  },
  'ask-guide': {
    path: '/ask-cpr',
    tag: activeTenant.id === 'family-hub' ? 'Guide™' : 'Athlete Services',
    title: activeTenant.id === 'family-hub' ? 'Ask your guide' : 'Ask CPR',
    description:
      activeTenant.id === 'family-hub'
        ? 'Submit questions to your family success guide.'
        : 'Submit questions directly to Coach Mike.',
  },
  messaging: {
    path: '/messaging-center',
    tag: 'Communication',
    title: 'Messaging center',
    description: activeTenant.id === 'family-hub' ? 'Direct messages with your team.' : 'Direct messages with the CPR team.',
  },
  documents: {
    path: '/document-vault',
    tag: 'Documents',
    title: 'Document vault',
    description:
      activeTenant.id === 'family-hub'
        ? 'Family documents, forms, and shared files.'
        : 'Recruiting profile, transcripts, and eligibility documents.',
  },
  events: {
    path: '/upcoming-events',
    tag: 'Events',
    title: 'Upcoming events',
    description:
      activeTenant.id === 'family-hub'
        ? 'Family events, workshops, and gatherings.'
        : 'Showcases, camps, and workshops curated for CPR athletes.',
  },
  'family-calendar': {
    path: '/upcoming-events',
    tag: 'Family Hub',
    title: 'Family calendar',
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
    eyebrow: activeTenant.id === 'family-hub' ? 'Your Family Hub' : 'Your CPR Portals',
    title: activeTenant.hubTitle,
    intro: activeTenant.hubIntro,
  };
}