import { resolveTenantPreset } from '@/lib/tenant-presets';

export type { TenantPreset, HubModuleId } from '@/lib/tenant-presets';

export const activeTenant = resolveTenantPreset(process.env.TENANT_ID);

export const isFamilyHub = activeTenant.id === 'family-hub';
