export type CprSpecialistId =
  | 'research'
  | 'communications'
  | 'relationship'
  | 'operations'
  | 'knowledge'
  | 'analytics'
  | 'website';

export interface CprSpecialist {
  id: CprSpecialistId;
  name: string;
  role: string;
}

export interface CprPossibility {
  id: string;
  title: string;
  detail: string;
  href: string;
  actionLabel: string;
  specialistId: CprSpecialistId;
}

export interface CprOrbieContext {
  area: string;
  status: string;
  primary: CprPossibility;
  secondary: CprPossibility[];
  specialists: CprSpecialist[];
  helpTopics: string[];
  memorySignals: string[];
  smartchitectureChecks: string[];
}

const SPECIALISTS: Record<CprSpecialistId, CprSpecialist> = {
  research: {
    id: 'research',
    name: 'Research Specialist',
    role: 'Tracks recruiting rules, school fit, exposure events, and opportunities.',
  },
  communications: {
    id: 'communications',
    name: 'Communications Specialist',
    role: 'Turns recruiting status into clear updates for athletes, families, and coaches.',
  },
  relationship: {
    id: 'relationship',
    name: 'Relationship Specialist',
    role: 'Protects coach, family, partner, and school follow-up momentum.',
  },
  operations: {
    id: 'operations',
    name: 'Operations Specialist',
    role: 'Keeps deadlines, tasks, documents, and portal actions connected.',
  },
  knowledge: {
    id: 'knowledge',
    name: 'Knowledge Specialist',
    role: 'Remembers athlete details, family preferences, and successful recruiting patterns.',
  },
  analytics: {
    id: 'analytics',
    name: 'Analytics Specialist',
    role: 'Watches engagement, profile completeness, and recruiting activity trends.',
  },
  website: {
    id: 'website',
    name: 'Website Specialist',
    role: 'Keeps public profiles, landing pages, and update requests current.',
  },
};

const HELP_TOPICS = [
  'What should I do next?',
  'Walk me through this page',
  'Explain recruiting milestones',
  'Help me contact CPR',
  'Show family portal guidance',
];

const SMARTCHITECTURE_CHECKS = [
  'Reduce work',
  'Reduce decisions',
  'Reuse athlete knowledge',
  'Connect portal modules',
  'Identify the next possibility',
  'Increase recruiting capacity',
];

export function resolveCprOrbieContext(pathname: string): CprOrbieContext {
  if (pathname.includes('/admin')) return adminContext();
  if (pathname.includes('/apply')) return applyContext();
  if (pathname.includes('/staging')) return stagingContext();
  if (pathname.includes('/portal/athlete')) return athletePortalContext(pathname);
  if (pathname.includes('/portal/parent')) return parentPortalContext(pathname);
  if (pathname.includes('/portal/login') || pathname.includes('/portal/forgot-password')) return loginContext();
  return publicContext();
}

function publicContext(): CprOrbieContext {
  return context({
    area: 'CPR public site',
    status: 'Visitors need a clear path into recruiting support.',
    primary: possibility('public-primary', 'Start the athlete application', 'The application creates the first real recruiting record and gives CPR the context to help.', '/apply', 'Start application', 'operations'),
    secondary: [
      possibility('public-staging', 'Open the CPR test workspace', 'Use staging to verify the portal, admin, and approval paths.', '/staging', 'Open staging', 'website'),
      possibility('public-login', 'Access an existing portal', 'Families with credentials can continue from their athlete or parent workspace.', '/portal/login', 'Portal login', 'relationship'),
    ],
    specialistIds: ['operations', 'research', 'relationship'],
    memorySignals: ['CPR recruiting journey', 'athlete application', 'family portal'],
  });
}

function applyContext(): CprOrbieContext {
  return context({
    area: 'Athlete application',
    status: 'The next best step is to complete enough profile detail for CPR to review fit.',
    primary: possibility('apply-primary', 'Complete the athlete application', 'Application data becomes the recruiting profile and admin review record.', '/apply', 'Continue application', 'knowledge'),
    secondary: [
      possibility('apply-login', 'Return to portal login', 'Existing families should continue from their current portal instead of applying again.', '/portal/login', 'Portal login', 'operations'),
      possibility('apply-help', 'Ask CPR for help', 'If a family is unsure what to submit, route them to the support workflow.', '/portal/athlete/jayden-thompson/ask-cpr', 'Ask CPR', 'communications'),
    ],
    specialistIds: ['knowledge', 'operations', 'communications'],
    memorySignals: ['application fields', 'athlete profile', 'family contact preferences'],
  });
}

function adminContext(): CprOrbieContext {
  return context({
    area: 'CPR admin',
    status: 'Admin should focus on the highest-value applicant, portal update, or family request.',
    primary: possibility('admin-primary', 'Review current registrants', 'Start with active applications and portal readiness before making website changes.', '/admin', 'Open admin', 'analytics'),
    secondary: [
      possibility('admin-staging', 'Verify test flows', 'Use staging links to confirm admin, athlete, parent, and approval paths.', '/staging', 'Open staging', 'operations'),
      possibility('admin-updates', 'Check website update requests', 'Pending portal updates should be reviewed before new public content is published.', '/admin?tab=website', 'Review updates', 'website'),
    ],
    specialistIds: ['analytics', 'operations', 'website', 'relationship'],
    memorySignals: ['registrants', 'portal status', 'website approvals', 'family support'],
  });
}

function stagingContext(): CprOrbieContext {
  return context({
    area: 'CPR test workspace',
    status: 'This page should prove the test site is navigable and ready for smoke testing.',
    primary: possibility('staging-primary', 'Open the athlete portal test path', 'The athlete portal confirms profile, resources, updates, messaging, and next-step guidance.', '/portal/athlete/jayden-thompson', 'Test athlete portal', 'operations'),
    secondary: [
      possibility('staging-parent', 'Open the parent portal test path', 'Parent view confirms family guidance and communication access.', '/portal/parent/jayden-thompson', 'Test parent portal', 'relationship'),
      possibility('staging-admin', 'Open admin test path', 'Admin confirms registrants, website approvals, and portal operations.', '/admin', 'Test admin', 'analytics'),
    ],
    specialistIds: ['operations', 'analytics', 'relationship', 'website'],
    memorySignals: ['test routes', 'portal smoke test', 'approval flow'],
  });
}

function athletePortalContext(pathname: string): CprOrbieContext {
  const base = portalBase(pathname, 'athlete');
  return context({
    area: 'Athlete portal',
    status: 'Athletes need one clear next action tied to recruiting progress.',
    primary: possibility('athlete-primary', 'Review the next recruiting milestone', 'Milestones keep profile proof, outreach, deadlines, and follow-up connected.', `${base}/recruiting-timeline`, 'Review timeline', 'research'),
    secondary: [
      possibility('athlete-message', 'Send or review a message', 'Communication keeps the family and CPR aligned around the next step.', `${base}/messaging-center`, 'Open messages', 'communications'),
      possibility('athlete-docs', 'Check document readiness', 'Documents and proof should be ready before outreach moments.', `${base}/document-vault`, 'Open documents', 'operations'),
    ],
    specialistIds: ['research', 'communications', 'operations', 'knowledge'],
    memorySignals: ['athlete profile', 'recruiting timeline', 'documents', 'family messages'],
  });
}

function parentPortalContext(pathname: string): CprOrbieContext {
  const base = portalBase(pathname, 'parent');
  return context({
    area: 'Parent portal',
    status: 'Parents need clarity, confidence, and a simple path to support the athlete.',
    primary: possibility('parent-primary', 'Review upcoming recruiting actions', 'Parents can reduce confusion by checking the next milestone and support items.', `${base}/upcoming-events`, 'Review actions', 'relationship'),
    secondary: [
      possibility('parent-message', 'Message CPR', 'Questions should become trackable support requests instead of getting lost.', `${base}/messaging-center`, 'Open messages', 'communications'),
      possibility('parent-resources', 'Open recruiting resources', 'Resources help families understand requirements before decisions are urgent.', `${base}/resource-library`, 'Open resources', 'research'),
    ],
    specialistIds: ['relationship', 'communications', 'research', 'knowledge'],
    memorySignals: ['parent questions', 'family preferences', 'recruiting resources'],
  });
}

function loginContext(): CprOrbieContext {
  return context({
    area: 'Portal access',
    status: 'Families should either sign in, reset access, or start a new application.',
    primary: possibility('login-primary', 'Sign in to the portal', 'Existing families continue from their saved recruiting workspace.', '/portal/login', 'Sign in', 'operations'),
    secondary: [
      possibility('login-reset', 'Reset portal access', 'Password reset keeps the family moving without admin intervention.', '/portal/forgot-password', 'Reset password', 'operations'),
      possibility('login-apply', 'Start a new application', 'New athletes should begin with an application instead of trying to sign in.', '/apply', 'Apply now', 'knowledge'),
    ],
    specialistIds: ['operations', 'knowledge', 'communications'],
    memorySignals: ['portal credentials', 'family access', 'application status'],
  });
}

function context(input: {
  area: string;
  status: string;
  primary: CprPossibility;
  secondary: CprPossibility[];
  specialistIds: CprSpecialistId[];
  memorySignals: string[];
}): CprOrbieContext {
  return {
    ...input,
    specialists: input.specialistIds.map((id) => SPECIALISTS[id]),
    helpTopics: HELP_TOPICS,
    smartchitectureChecks: SMARTCHITECTURE_CHECKS,
  };
}

function possibility(
  id: string,
  title: string,
  detail: string,
  href: string,
  actionLabel: string,
  specialistId: CprSpecialistId,
): CprPossibility {
  return { id, title, detail, href, actionLabel, specialistId };
}

function portalBase(pathname: string, type: 'athlete' | 'parent') {
  const match = pathname.match(new RegExp(`/portal/${type}/([^/]+)`));
  return `/portal/${type}/${match?.[1] ?? 'jayden-thompson'}`;
}
