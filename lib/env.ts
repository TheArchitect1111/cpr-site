export {
  isProductionDeploy,
  isDemoMode,
  allowSampleData,
  requireEnv,
} from '@ea/portal-chassis/env';

import { site } from '@/config/site';

export function adminEmail(): string {
  return process.env.ADMIN_EMAIL?.trim() || site.footer.email;
}
