export type PortalHubModule = {
  href: string;
  tag: string;
  title: string;
  description: string;
  variant?: 'amplifi' | 'updates' | 'default';
};

export function getPortalHubModules(base: string): PortalHubModule[] {
  return [
    {
      href: base,
      tag: 'Command Center',
      title: 'Recruiting dashboard',
      description: 'Onboarding, school interest, roadmap, and opportunity tracking.',
    },
    {
      href: `${base}/amplifi`,
      tag: 'Amplifi™',
      title: 'Your future, visualized',
      description: 'Cinematic vision of your recruiting journey — potential through success.',
      variant: 'amplifi',
    },
    {
      href: `${base}/updates`,
      tag: 'Update Portal',
      title: 'Real-time recruiting feed',
      description: 'Coach outreach, school interest, messages, and CPR activity in one timeline.',
      variant: 'updates',
    },
    {
      href: `${base}/recruiting-timeline`,
      tag: 'Learning Center',
      title: 'Recruiting timeline',
      description: 'Grade-by-grade guide for academics, film, camps, and coach outreach.',
    },
    {
      href: `${base}/eligibility-center`,
      tag: 'Learning Center',
      title: 'Eligibility center',
      description: 'NCAA, NAIA, NJCAA, and U SPORTS requirements in plain language.',
    },
    {
      href: `${base}/scholarship-center`,
      tag: 'Learning Center',
      title: 'Scholarship center',
      description: 'Athletic scholarships, academic aid, and walk-on opportunities explained.',
    },
    {
      href: `${base}/video-learning-center`,
      tag: 'Training Transformation™',
      title: 'Training & learning',
      description: 'Upload materials, watch modules, and track progress — chassis training pack.',
    },
    {
      href: `${base}/video-learning-center`,
      tag: 'Athlete Services',
      title: 'Video learning center',
      description: 'Coach-curated videos on film, recruiting strategy, and skill development.',
    },
    {
      href: `${base}/resource-library`,
      tag: 'Athlete Services',
      title: 'Resource library',
      description: 'Videos, PDFs, articles, and links for your journey.',
    },
    {
      href: `${base}/ask-cpr`,
      tag: 'Athlete Services',
      title: 'Ask CPR',
      description: 'Submit questions directly to Coach Mike.',
    },
    {
      href: `${base}/messaging-center`,
      tag: 'Communication',
      title: 'Messaging center',
      description: 'Direct messages with the CPR team.',
    },
    {
      href: `${base}/document-vault`,
      tag: 'Documents',
      title: 'Document vault',
      description: 'Recruiting profile, transcripts, and eligibility documents.',
    },
    {
      href: `${base}/upcoming-events`,
      tag: 'Events',
      title: 'Upcoming events',
      description: 'Showcases, camps, and workshops curated for CPR athletes.',
    },
  ];
}
