import { site } from '@/config/site';

export function isProductionDeploy(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
}

export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === 'true' || process.env.DEMO_MODE === '1';
}

export function allowSampleData(): boolean {
  return !isProductionDeploy() || isDemoMode();
}

export function requireEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value || null;
}

export function adminEmail(): string {
  return process.env.ADMIN_EMAIL?.trim() || site.footer.email;
}
