export {
  isProductionDeploy,
  isDemoMode,
  allowSampleData,
  requireEnv,
} from '@/lib/chassis/env';

import { site } from '@/config/site';

export function adminEmail(): string {
  return process.env.ADMIN_EMAIL?.trim() || site.footer.email;
}
