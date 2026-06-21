/** Shared production vs demo environment helpers. */

export function isProductionDeploy(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
}

export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === 'true' || process.env.DEMO_MODE === '1';
}

/** Sample/demo data is allowed only outside production or when DEMO_MODE is explicit. */
export function allowSampleData(): boolean {
  return !isProductionDeploy() || isDemoMode();
}

export function adminEmail(): string {
  return process.env.ADMIN_EMAIL || 'mikecrpglobal@mississaugamagic.com';
}
