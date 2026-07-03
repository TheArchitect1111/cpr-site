/** Tenant presets vendored for CPR deploy — source of truth: ea-operating-system/portal-core/config/tenants */

export type HubModuleId =
  | 'dashboard'
  | 'amplifi'
  | 'updates'
  | 'website-builder'
  | 'recruiting-timeline'
  | 'eligibility-center'
  | 'scholarship-center'
  | 'training'
  | 'video-learning'
  | 'resource-library'
  | 'ask-guide'
  | 'messaging'
  | 'documents'
  | 'events'
  | 'family-calendar'
  | 'opportunities-resources';

export type TenantPreset = {
  id: string;
  hubModuleIds: HubModuleId[];
  hubTitle: string;
  hubIntro: string;
  modules: string[];
};

export const CPR_TENANT: TenantPreset = {
  id: 'cpr',
  modules: [
    'recruiting',
    'documents',
    'events',
    'messaging',
    'updates',
    'training',
    'video-learning',
    'assessments',
    'amplifi',
    'opportunities-resources',
  ],
  hubModuleIds: [
    'dashboard',
    'amplifi',
    'updates',
    'recruiting-timeline',
    'eligibility-center',
    'scholarship-center',
    'training',
    'video-learning',
    'resource-library',
    'ask-guide',
    'messaging',
    'documents',
    'events',
    'opportunities-resources',
  ],
  hubTitle: 'Everything in one place',
  hubIntro:
    'Full EA Portal Chassis™ — recruiting dashboard, Amplifi™, updates, learning, messaging, documents, and events.',
};

export const FAMILY_HUB_TENANT: TenantPreset = {
  id: 'family-hub',
  modules: [
    'training',
    'video-learning',
    'documents',
    'assessments',
    'updates',
    'messaging',
    'events',
    'opportunities-resources',
  ],
  hubModuleIds: [
    'dashboard',
    'updates',
    'training',
    'video-learning',
    'resource-library',
    'ask-guide',
    'messaging',
    'documents',
    'events',
    'family-calendar',
    'opportunities-resources',
  ],
  hubTitle: 'Your family command center',
  hubIntro:
    'Guided first success, updates, learning, documents, and messaging — one calm home for every family.',
};

const PRESETS: Record<string, TenantPreset> = {
  cpr: CPR_TENANT,
  'family-hub': FAMILY_HUB_TENANT,
};

export function resolveTenantPreset(id?: string): TenantPreset {
  const key = id ?? process.env.TENANT_ID ?? 'cpr';
  return PRESETS[key] ?? CPR_TENANT;
}
