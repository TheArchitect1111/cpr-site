import { site } from '@/config/site';

/** CPR owner email — always authorized for admin magic-link login. */
export const CPR_OWNER_EMAIL = 'mikecprglobal@mississaugamagic.com';

/**
 * Admin emails that must work even when ADMIN_PASSWORD / Airtable are unset.
 * Sources: ADMIN_EMAIL env, site config, canonical owner address.
 */
export function configuredOwnerEmails(): string[] {
  const emails = new Set<string>();
  for (const source of [process.env.ADMIN_EMAIL, process.env.ADMIN_USER, site.footer.email, CPR_OWNER_EMAIL]) {
    const normalized = String(source || '').trim().toLowerCase();
    if (normalized.includes('@')) emails.add(normalized);
  }
  return [...emails];
}

export function isConfiguredOwnerEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return normalized.length > 0 && configuredOwnerEmails().includes(normalized);
}
