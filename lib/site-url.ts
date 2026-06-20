export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'https://cpr-site.vercel.app';
  return raw.replace(/\/$/, '');
}

export function portalLoginUrl(): string {
  return `${getSiteUrl()}/portal/login`;
}
