/**
 * White-label PWA configuration for the EA Portal Chassis™.
 *
 * Every value can be overridden per deployment via env vars, so a new
 * organization becomes installable with zero code changes — just set the
 * branding env vars (or accept the CPR defaults).
 */

export type PwaConfig = {
  /** Full app name shown on the install prompt / splash screen. */
  name: string;
  /** Short name shown under the home-screen icon. */
  shortName: string;
  description: string;
  /** Standalone launch URL. */
  startUrl: string;
  themeColor: string;
  backgroundColor: string;
  icon: string;
  maskableIcon: string;
};

export function getPwaConfig(): PwaConfig {
  return {
    name: process.env.NEXT_PUBLIC_PWA_NAME || 'CPR Global Prospects',
    shortName: process.env.NEXT_PUBLIC_PWA_SHORT_NAME || 'CPR Portal',
    description:
      process.env.NEXT_PUBLIC_PWA_DESCRIPTION ||
      'Your CPR Global Prospects portal — recruiting, updates, and family tools in one place.',
    startUrl: process.env.NEXT_PUBLIC_PWA_START_URL || '/',
    themeColor: process.env.NEXT_PUBLIC_PWA_THEME_COLOR || '#0C0C0A',
    backgroundColor: process.env.NEXT_PUBLIC_PWA_BG_COLOR || '#0C0C0A',
    icon: process.env.NEXT_PUBLIC_PWA_ICON || '/cpr-logo.png',
    maskableIcon: process.env.NEXT_PUBLIC_PWA_MASKABLE_ICON || process.env.NEXT_PUBLIC_PWA_ICON || '/cpr-logo.png',
  };
}

/** PWA is dormant until this flag is explicitly enabled. */
export function isPwaEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_PWA === '1';
}
