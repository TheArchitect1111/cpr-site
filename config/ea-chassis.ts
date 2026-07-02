import { site } from './site';

export type PortalRole = 'athlete' | 'parent' | 'coach' | 'staff' | 'volunteer' | 'board' | 'sponsor' | 'client';

export type ChassisQuickCard = {
  href: string;
  tag: string;
  title: string;
  description: string;
  enabled?: boolean;
};

export type PortalResourceCard = {
  href: string;
  title: string;
  description: string;
};

function env(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

function envList(name: string, fallback: string[]): string[] {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  return raw.split(',').map((item) => item.trim()).filter(Boolean);
}

const organizationName = env(
  'CHASSIS_ORGANIZATION_NAME',
  `${site.brand.nameLine1} ${site.brand.nameLine2}`.replace(/\s+/g, ' ').trim(),
);

const supportPerson = env('CHASSIS_SUPPORT_PERSON', 'Coach Mike');
const supportTeam = env('CHASSIS_SUPPORT_TEAM', `${organizationName} team`);

export const eaChassis = {
  product: {
    name: env('CHASSIS_PRODUCT_NAME', 'EA Portal Chassis'),
    implementationName: env('CHASSIS_IMPLEMENTATION_NAME', 'CPR'),
    tenantId: env('TENANT_ID', 'cpr'),
  },
  organization: {
    name: organizationName,
    shortName: env('CHASSIS_ORGANIZATION_SHORT_NAME', site.brand.nameLine1),
    tagline: env('CHASSIS_ORGANIZATION_TAGLINE', site.brand.tagline),
    supportEmail: env('CHASSIS_SUPPORT_EMAIL', site.footer.email),
    supportPerson,
    supportTeam,
    location: env('CHASSIS_LOCATION', site.footer.location),
    logo: env('CHASSIS_LOGO', site.brand.logo),
  },
  theme: {
    primary: env('CHASSIS_PRIMARY_COLOR', site.colors.redBright),
    header: env('CHASSIS_HEADER_COLOR', site.colors.black),
    background: env('CHASSIS_BACKGROUND_COLOR', site.colors.offWhite),
    font: env('CHASSIS_FONT_FAMILY', 'Inter, system-ui, sans-serif'),
    iconSet: env('CHASSIS_ICON_SET', 'default'),
  },
  navigation: {
    roles: envList('CHASSIS_PORTAL_ROLES', ['athlete', 'parent']) as PortalRole[],
    roleLabels: {
      athlete: env('CHASSIS_ATHLETE_PORTAL_LABEL', 'Athlete Portal'),
      parent: env('CHASSIS_PARENT_PORTAL_LABEL', 'Parent Portal'),
      coach: env('CHASSIS_COACH_PORTAL_LABEL', 'Coach Portal'),
      staff: env('CHASSIS_STAFF_PORTAL_LABEL', 'Staff Portal'),
      volunteer: env('CHASSIS_VOLUNTEER_PORTAL_LABEL', 'Volunteer Portal'),
      board: env('CHASSIS_BOARD_PORTAL_LABEL', 'Board Portal'),
      sponsor: env('CHASSIS_SPONSOR_PORTAL_LABEL', 'Sponsor Portal'),
      client: env('CHASSIS_CLIENT_PORTAL_LABEL', 'Client Portal'),
    } satisfies Record<PortalRole, string>,
    tabs: {
      amplifi: env('CHASSIS_AMPLIFI_LABEL', 'Amplifi'),
      updates: env('CHASSIS_UPDATES_LABEL', 'Update Portal'),
      resources: env('CHASSIS_RESOURCES_LABEL', 'Resources'),
      messages: env('CHASSIS_MESSAGES_LABEL', 'Messages'),
      account: env('CHASSIS_ACCOUNT_LABEL', 'Account'),
    },
  },
  quickCards: [
    {
      href: env('CHASSIS_CARD_REGISTRATION_HREF', '/apply'),
      tag: env('CHASSIS_CARD_REGISTRATION_TAG', 'Start'),
      title: env('CHASSIS_CARD_REGISTRATION_TITLE', 'Registration'),
      description: env('CHASSIS_CARD_REGISTRATION_DESC', `Begin or continue registration with ${organizationName}.`),
    },
    {
      href: env('CHASSIS_CARD_PROGRAMS_HREF', '/camps'),
      tag: env('CHASSIS_CARD_PROGRAMS_TAG', 'Programs'),
      title: env('CHASSIS_CARD_PROGRAMS_TITLE', 'Programs'),
      description: env('CHASSIS_CARD_PROGRAMS_DESC', `Explore ${organizationName} programs and opportunities.`),
    },
    {
      href: env('CHASSIS_CARD_EVENTS_HREF', '/camps#house-league'),
      tag: env('CHASSIS_CARD_EVENTS_TAG', 'Programs'),
      title: env('CHASSIS_CARD_EVENTS_TITLE', 'Events'),
      description: env('CHASSIS_CARD_EVENTS_DESC', 'View upcoming events, development options, and next steps.'),
    },
    {
      href: env('CHASSIS_CARD_PATHWAY_HREF', '/recruitment'),
      tag: env('CHASSIS_CARD_PATHWAY_TAG', 'Pathway'),
      title: env('CHASSIS_CARD_PATHWAY_TITLE', 'Pathway'),
      description: env('CHASSIS_CARD_PATHWAY_DESC', `Understand the ${organizationName} process and support model.`),
    },
    {
      href: env('CHASSIS_CARD_PROFILE_HREF', ''),
      tag: env('CHASSIS_CARD_PROFILE_TAG', 'Profiles'),
      title: env('CHASSIS_CARD_PROFILE_TITLE', 'Profile'),
      description: env('CHASSIS_CARD_PROFILE_DESC', 'Open the public profile connected to this portal.'),
    },
    {
      href: env('CHASSIS_CARD_DASHBOARD_HREF', ''),
      tag: env('CHASSIS_CARD_DASHBOARD_TAG', 'Dashboard'),
      title: env('CHASSIS_CARD_DASHBOARD_TITLE', 'Dashboard'),
      description: env('CHASSIS_CARD_DASHBOARD_DESC', 'Review progress, activity, and recommended actions.'),
    },
    {
      href: env('CHASSIS_CARD_RESOURCES_HREF', ''),
      tag: env('CHASSIS_CARD_RESOURCES_TAG', 'Resources'),
      title: env('CHASSIS_CARD_RESOURCES_TITLE', 'Resources'),
      description: env('CHASSIS_CARD_RESOURCES_DESC', 'Open resources, videos, documents, and links.'),
    },
  ] satisfies ChassisQuickCard[],
  assistant: {
    name: env('CHASSIS_ASSISTANT_NAME', `${env('CHASSIS_IMPLEMENTATION_NAME', 'CPR')} Help Assistant`),
    welcome: env(
      'CHASSIS_ASSISTANT_WELCOME',
      `Hi, I can help you find the right next step in the ${organizationName} portal. Ask a question or tap a quick option.`,
    ),
    supportQuestionLabel: env('CHASSIS_SUPPORT_QUESTION_LABEL', `Ask ${env('CHASSIS_IMPLEMENTATION_NAME', 'CPR')} a question`),
    supportQuestionCta: env('CHASSIS_SUPPORT_QUESTION_CTA', `Ask ${env('CHASSIS_IMPLEMENTATION_NAME', 'CPR')}`),
    supportAnswer: env(
      'CHASSIS_SUPPORT_ANSWER',
      `Questions go to ${supportPerson} and ${supportTeam}, then stay visible in your portal history.`,
    ),
    messageAnswer: env(
      'CHASSIS_MESSAGE_ANSWER',
      `Use Messages for direct communication with ${supportTeam}. If it is a specific support question, create a tracked ticket.`,
    ),
    updatesAnswer: env(
      'CHASSIS_UPDATES_ANSWER',
      `The Update Portal shows live activity, team actions, messages, opportunities, and important updates in one place.`,
    ),
  },
  portalCopy: {
    dashboardTag: env('CHASSIS_DASHBOARD_TAG', 'Command Center'),
    dashboardTitle: env('CHASSIS_DASHBOARD_TITLE', 'Portal dashboard'),
    dashboardDescription: env(
      'CHASSIS_DASHBOARD_DESC',
      'Onboarding, priorities, and what deserves attention today.',
    ),
    updatesTag: env('CHASSIS_UPDATES_TAG', 'Update Portal'),
    updatesTitle: env('CHASSIS_UPDATES_TITLE', 'Live activity feed'),
    updatesDescription: env(
      'CHASSIS_UPDATES_DESC',
      'Messages, milestones, actions, and important updates in one timeline.',
    ),
    askGuideTag: env('CHASSIS_ASK_GUIDE_TAG', 'Support'),
    askGuideTitle: env('CHASSIS_ASK_GUIDE_TITLE', 'Ask your guide'),
    askGuideDescription: env(
      'CHASSIS_ASK_GUIDE_DESC',
      `Submit questions directly to ${supportTeam}.`,
    ),
    messagingTitle: env('CHASSIS_MESSAGING_TITLE', 'Messaging center'),
    messagingDescription: env('CHASSIS_MESSAGING_DESC', `Direct messages with ${supportTeam}.`),
    documentsTitle: env('CHASSIS_DOCUMENTS_TITLE', 'Document vault'),
    documentsDescription: env('CHASSIS_DOCUMENTS_DESC', 'Shared files, forms, and important documents.'),
    eventsTitle: env('CHASSIS_EVENTS_TITLE', 'Upcoming events'),
    eventsDescription: env('CHASSIS_EVENTS_DESC', 'Events, deadlines, workshops, and key dates.'),
    learningEyebrow: env('CHASSIS_LEARNING_EYEBROW', 'Learning Center'),
    servicesEyebrow: env('CHASSIS_SERVICES_EYEBROW', 'Portal Tools'),
    updateFeedTitle: env('CHASSIS_UPDATE_FEED_TITLE', 'Activity for {name}'),
    updateFeedSub: env(
      'CHASSIS_UPDATE_FEED_SUB',
      'Every message, milestone, and important action in one live feed.',
    ),
    emptyUpdates: env(
      'CHASSIS_EMPTY_UPDATES',
      'No updates yet. As the team tracks activity, updates will appear here.',
    ),
    footerPrefix: env('CHASSIS_FOOTER_PREFIX', organizationName),
    categorySystemLabel: env('CHASSIS_UPDATE_SYSTEM_LABEL', 'System Activity'),
    resourceCards: [
      {
        href: env('CHASSIS_RESOURCE_1_HREF', 'recruiting-timeline'),
        title: env('CHASSIS_RESOURCE_1_TITLE', 'Timeline'),
        description: env('CHASSIS_RESOURCE_1_DESC', 'A step-by-step guide to the journey and key milestones.'),
      },
      {
        href: env('CHASSIS_RESOURCE_2_HREF', 'eligibility-center'),
        title: env('CHASSIS_RESOURCE_2_TITLE', 'Requirements'),
        description: env('CHASSIS_RESOURCE_2_DESC', 'Rules, requirements, and readiness checkpoints explained clearly.'),
      },
      {
        href: env('CHASSIS_RESOURCE_3_HREF', 'scholarship-center'),
        title: env('CHASSIS_RESOURCE_3_TITLE', 'Opportunities'),
        description: env('CHASSIS_RESOURCE_3_DESC', 'Understand options, offers, support paths, and next decisions.'),
      },
    ] satisfies PortalResourceCard[],
  },
  clone: {
    requiredValues: [
      'CHASSIS_ORGANIZATION_NAME',
      'CHASSIS_ORGANIZATION_SHORT_NAME',
      'CHASSIS_LOGO',
      'CHASSIS_PRIMARY_COLOR',
      'CHASSIS_HEADER_COLOR',
      'CHASSIS_SUPPORT_EMAIL',
      'NEXT_PUBLIC_SITE_URL',
      'STRIPE_SECRET_KEY',
      'RESEND_API_KEY',
      'BLOB_READ_WRITE_TOKEN',
    ],
  },
};

export function portalRoleLabel(role: PortalRole | 'athlete' | 'parent'): string {
  return eaChassis.navigation.roleLabels[role as PortalRole] || `${role} Portal`;
}

export function quickCardsFor(base: string, slug: string): ChassisQuickCard[] {
  return eaChassis.quickCards
    .map((card) => ({
      ...card,
      href: card.href
        .replace('{base}', base)
        .replace('{slug}', slug)
        || (card.title === 'Profile' ? `/athletes/${slug}` : card.title === 'Dashboard' ? base : card.title === 'Resources' ? `${base}/resource-library` : ''),
    }))
    .filter((card) => card.href);
}
