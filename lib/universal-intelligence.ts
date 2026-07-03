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
  targetSelector: string;
  targetLabel: string;
  steps: CprGuidanceStep[];
  urgency?: 'low' | 'medium' | 'high';
  completionMessage: string;
}

export interface CprGuidanceStep {
  title: string;
  reason: string;
  outcome: string;
  actionLabel: string;
  href?: string;
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
  if (pathname.includes('/admin') && pathname.includes('tab=website')) return adminWebsiteContext();
  if (pathname.includes('/admin')) return adminContext();
  if (pathname.includes('/apply')) return applyContext();
  if (pathname.includes('/staging')) return stagingContext();
  if (pathname.includes('/portal/athlete') && pathname.includes('/updates')) return portalUpdateContext(pathname, 'athlete');
  if (pathname.includes('/portal/parent') && pathname.includes('/updates')) return portalUpdateContext(pathname, 'parent');
  if (pathname.includes('/portal/athlete')) return athletePortalContext(pathname);
  if (pathname.includes('/portal/parent')) return parentPortalContext(pathname);
  if (pathname.includes('/portal/login') || pathname.includes('/portal/forgot-password')) return loginContext();
  return publicContext();
}

function publicContext(): CprOrbieContext {
  return context({
    area: 'CPR public site',
    status: 'Visitors need a clear path into recruiting support.',
    primary: possibility(
      'public-primary',
      'Start the athlete application',
      'The application creates the first real recruiting record and gives CPR the context to help.',
      '/apply',
      'Start application',
      'operations',
      '[href="/apply"]',
      'athlete application',
      ['Open the application', 'Complete the required profile fields', 'Submit for CPR review'],
      'Application path is ready for the next athlete.',
    ),
    secondary: [
      possibility('public-staging', 'Open the CPR test workspace', 'Use staging to verify the portal, admin, and approval paths.', '/staging', 'Open staging', 'website', '[href="/staging"]', 'staging workspace', ['Open staging', 'Run the portal smoke paths', 'Confirm admin approvals'], 'Staging workspace checked.'),
      possibility('public-login', 'Access an existing portal', 'Families with credentials can continue from their athlete or parent workspace.', '/portal/login', 'Portal login', 'relationship', '[href="/portal/login"]', 'portal login', ['Open portal login', 'Continue from saved workspace', 'Review next family action'], 'Portal access path checked.'),
    ],
    specialistIds: ['operations', 'research', 'relationship'],
    memorySignals: ['CPR recruiting journey', 'athlete application', 'family portal'],
  });
}

function applyContext(): CprOrbieContext {
  return context({
    area: 'Athlete application',
    status: 'The next best step is to complete enough profile detail for CPR to review fit.',
    primary: possibility('apply-primary', 'Complete the athlete application', 'Application data becomes the recruiting profile and admin review record.', '/apply', 'Continue application', 'knowledge', 'form, [href="/apply"]', 'application form', ['Complete required athlete details', 'Add family contact information', 'Submit so CPR can review'], 'Application guidance recorded.', 'medium'),
    secondary: [
      possibility('apply-login', 'Return to portal login', 'Existing families should continue from their current portal instead of applying again.', '/portal/login', 'Portal login', 'operations', '[href="/portal/login"]', 'portal login', ['Open portal login', 'Use existing credentials', 'Continue saved recruiting work'], 'Portal login guidance recorded.'),
      possibility('apply-help', 'Ask CPR for help', 'If a family is unsure what to submit, route them to the support workflow.', '/portal/athlete/jayden-thompson/ask-cpr', 'Ask CPR', 'communications', '[href*="/ask-cpr"]', 'Ask CPR support path', ['Open Ask CPR', 'Describe the blocker', 'Let CPR respond in the portal'], 'Support path guidance recorded.'),
    ],
    specialistIds: ['knowledge', 'operations', 'communications'],
    memorySignals: ['application fields', 'athlete profile', 'family contact preferences'],
  });
}

function adminContext(): CprOrbieContext {
  return context({
    area: 'CPR admin',
    status: 'Admin should focus on the highest-value applicant, portal update, or family request.',
    primary: possibility('admin-primary', 'Review current registrants', 'Start with active applications and portal readiness before making website changes.', '/admin', 'Open admin', 'analytics', '.registrants-table, .registrant-stats, [href="/admin"]', 'registrants and progress table', ['Scan registrants with incomplete progress', 'Open the highest-value profile', 'Move the next required step forward'], 'Registrant review captured in EA Memory.', 'high'),
    secondary: [
      possibility('admin-staging', 'Verify test flows', 'Use staging links to confirm admin, athlete, parent, and approval paths.', '/staging', 'Open staging', 'operations', '[href="/staging"]', 'staging workspace', ['Open staging', 'Test athlete and parent portals', 'Confirm admin approval flow'], 'Test flow guidance recorded.'),
      possibility('admin-updates', 'Check website update requests', 'Pending portal updates should be reviewed before new public content is published.', '/admin?tab=website', 'Review updates', 'website', '[href="/admin?tab=website"], .website-approval-board', 'website approval queue', ['Open Website & Approvals', 'Review pending client requests', 'Approve the update or send it back'], 'Website approval guidance recorded.', 'high'),
    ],
    specialistIds: ['analytics', 'operations', 'website', 'relationship'],
    memorySignals: ['registrants', 'portal status', 'website approvals', 'family support'],
  });
}

function adminWebsiteContext(): CprOrbieContext {
  return context({
    area: 'Website approvals',
    status: 'Admin should clear pending profile and website requests before publishing new public content.',
    primary: possibility('admin-website-primary', 'Review pending website requests', 'Website requests are ready for admin approval, rejection, or publishing prep.', '/admin?tab=website', 'Review queue', 'website', '[data-orbie-target="website-approval-board"], .website-approval-board', 'website approval queue', ['Review the pending request cards', 'Approve what belongs on the profile', 'Use the builder to prepare the public update'], 'Website approval queue reviewed.', 'high'),
    secondary: [
      possibility('admin-website-builder', 'Open the visual builder', 'The builder lets CPR prepare homepage and profile changes without leaving admin.', '/website-builder', 'Open builder', 'website', '.wb-root, [href="/website-builder"]', 'visual website builder', ['Open the visual builder', 'Edit the relevant section', 'Publish after review'], 'Website builder guidance recorded.'),
      possibility('admin-website-portal', 'Check the source portal', 'Review the exact portal context behind the request before approving it.', '/portal/athlete/jayden-thompson/updates', 'View portal', 'relationship', '[data-orbie-target="website-request-card"] a', 'source portal link', ['Open the source portal', 'Compare the request against the profile', 'Return and approve or reject'], 'Source portal review recorded.'),
    ],
    specialistIds: ['website', 'analytics', 'communications', 'operations'],
    memorySignals: ['website request queue', 'admin approval', 'profile publishing'],
  });
}

function stagingContext(): CprOrbieContext {
  return context({
    area: 'CPR test workspace',
    status: 'This page should prove the test site is navigable and ready for smoke testing.',
    primary: possibility('staging-primary', 'Open the athlete portal test path', 'The athlete portal confirms profile, resources, updates, messaging, and next-step guidance.', '/portal/athlete/jayden-thompson', 'Test athlete portal', 'operations', '[data-orbie-target="athlete-portal"], [href="/portal/athlete/jayden-thompson"]', 'athlete portal test card', ['Open the athlete portal', 'Confirm the update portal and messages', 'Return to staging with issues noted'], 'Athlete portal smoke path recorded.', 'medium'),
    secondary: [
      possibility('staging-parent', 'Open the parent portal test path', 'Parent view confirms family guidance and communication access.', '/portal/parent/jayden-thompson', 'Test parent portal', 'relationship', '[data-orbie-target="parent-portal"], [href="/portal/parent/jayden-thompson"]', 'parent portal test card', ['Open the parent portal', 'Check messages and resources', 'Confirm family next-step clarity'], 'Parent portal smoke path recorded.'),
      possibility('staging-admin', 'Open admin test path', 'Admin confirms registrants, website approvals, and portal operations.', '/admin', 'Test admin', 'analytics', '[data-orbie-target="admin-portal"], [href="/admin"]', 'admin portal test card', ['Open admin', 'Check registrants', 'Check website approvals'], 'Admin smoke path recorded.'),
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
    primary: possibility('athlete-primary', 'Review the next recruiting milestone', 'Milestones keep profile proof, outreach, deadlines, and follow-up connected.', `${base}/recruiting-timeline`, 'Review timeline', 'research', '[href*="/recruiting-timeline"], .portal-card', 'next recruiting milestone', ['Open the recruiting timeline', 'Find the next milestone', 'Confirm what proof or follow-up is needed'], 'Recruiting milestone guidance recorded.', 'medium'),
    secondary: [
      possibility('athlete-message', 'Send or review a message', 'Communication keeps the family and CPR aligned around the next step.', `${base}/messaging-center`, 'Open messages', 'communications', '[href*="/messaging-center"]', 'message center', ['Open messages', 'Review CPR notes', 'Send one clear update or question'], 'Messaging guidance recorded.'),
      possibility('athlete-docs', 'Check document readiness', 'Documents and proof should be ready before outreach moments.', `${base}/document-vault`, 'Open documents', 'operations', '[href*="/document-vault"]', 'document vault', ['Open documents', 'Check missing proof', 'Upload or request what is missing'], 'Document readiness guidance recorded.'),
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
    primary: possibility('parent-primary', 'Review upcoming recruiting actions', 'Parents can reduce confusion by checking the next milestone and support items.', `${base}/upcoming-events`, 'Review actions', 'relationship', '[href*="/upcoming-events"], .portal-card', 'upcoming actions', ['Open upcoming actions', 'Check the next family responsibility', 'Coordinate with the athlete or CPR'], 'Parent action guidance recorded.', 'medium'),
    secondary: [
      possibility('parent-message', 'Message CPR', 'Questions should become trackable support requests instead of getting lost.', `${base}/messaging-center`, 'Open messages', 'communications', '[href*="/messaging-center"]', 'message center', ['Open messages', 'Send the question to CPR', 'Track the reply in the portal'], 'Parent messaging guidance recorded.'),
      possibility('parent-resources', 'Open recruiting resources', 'Resources help families understand requirements before decisions are urgent.', `${base}/resource-library`, 'Open resources', 'research', '[href*="/resource-library"]', 'resource library', ['Open resources', 'Review the relevant recruiting guide', 'Apply it to the next family decision'], 'Resource guidance recorded.'),
    ],
    specialistIds: ['relationship', 'communications', 'research', 'knowledge'],
    memorySignals: ['parent questions', 'family preferences', 'recruiting resources'],
  });
}

function portalUpdateContext(pathname: string, type: 'athlete' | 'parent'): CprOrbieContext {
  const base = portalBase(pathname, type);
  const familyLabel = type === 'athlete' ? 'athlete' : 'parent';
  return context({
    area: `${type === 'athlete' ? 'Athlete' : 'Parent'} update portal`,
    status: 'The next useful action is to send one clear website or profile update request to CPR.',
    primary: possibility('portal-update-primary', 'Send a profile update request', 'This turns photos, video, achievements, or copy changes into an admin-reviewed publishing request.', `${base}/updates`, 'Use this form', 'website', '[data-orbie-target="website-update-request"], .website-request-panel', 'website update request form', ['Choose the type of update', 'Describe exactly what CPR should review', 'Send it for admin approval'], 'Website update request guidance recorded.', 'high'),
    secondary: [
      possibility('portal-update-feed', 'Review recent CPR updates', 'Recent updates help the family avoid duplicate requests and see what changed.', `${base}/updates`, 'Review feed', 'communications', '.updates-feed, .portal-update-feed', 'recent updates feed', ['Scan recent updates', 'Check whether the change already happened', 'Submit only what is still missing'], 'Update feed guidance recorded.'),
      possibility('portal-update-message', 'Message CPR instead', 'Questions that are not publishing requests should go through messaging.', `${base}/messaging-center`, 'Open messages', 'communications', '[href*="/messaging-center"]', `${familyLabel} message center`, ['Open messages', 'Ask CPR the question', 'Track the reply in the portal'], 'Message guidance recorded.'),
    ],
    specialistIds: ['website', 'communications', 'knowledge', 'operations'],
    memorySignals: ['portal update request', 'family change notes', 'admin publishing queue'],
  });
}

function loginContext(): CprOrbieContext {
  return context({
    area: 'Portal access',
    status: 'Families should either sign in, reset access, or start a new application.',
    primary: possibility('login-primary', 'Sign in to the portal', 'Existing families continue from their saved recruiting workspace.', '/portal/login', 'Sign in', 'operations', 'form, [href="/portal/login"]', 'portal sign-in form', ['Enter portal credentials', 'Open the athlete or parent workspace', 'Review the next action'], 'Portal sign-in path recorded.'),
    secondary: [
      possibility('login-reset', 'Reset portal access', 'Password reset keeps the family moving without admin intervention.', '/portal/forgot-password', 'Reset password', 'operations', '[href="/portal/forgot-password"]', 'password reset link', ['Open reset', 'Send password reset email', 'Return to portal login'], 'Password reset guidance recorded.'),
      possibility('login-apply', 'Start a new application', 'New athletes should begin with an application instead of trying to sign in.', '/apply', 'Apply now', 'knowledge', '[href="/apply"]', 'application link', ['Open application', 'Create a new athlete record', 'Submit for CPR review'], 'New application guidance recorded.'),
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
  targetSelector: string,
  targetLabel: string,
  stepTitles: string[],
  completionMessage: string,
  urgency: CprPossibility['urgency'] = 'low',
): CprPossibility {
  return {
    id,
    title,
    detail,
    href,
    actionLabel,
    specialistId,
    targetSelector,
    targetLabel,
    urgency,
    completionMessage,
    steps: stepTitles.map((step, index) => ({
      title: step,
      reason: index === 0 ? detail : 'This keeps the workflow moving without adding extra decisions.',
      outcome: index === stepTitles.length - 1 ? completionMessage : 'The next step becomes clear.',
      actionLabel: index === 0 ? actionLabel : 'Continue',
      href: index === 0 ? href : undefined,
    })),
  };
}

function portalBase(pathname: string, type: 'athlete' | 'parent') {
  const match = pathname.match(new RegExp(`/portal/${type}/([^/]+)`));
  return `/portal/${type}/${match?.[1] ?? 'jayden-thompson'}`;
}
