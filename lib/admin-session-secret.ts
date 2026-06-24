/** Shared admin session signing secret — Node + Edge must resolve identically. */

export function getAdminSessionSecret(): string | null {
  const authSecret = process.env.ADMIN_AUTH_SECRET?.trim();
  if (authSecret) return authSecret;
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (password) return password;
  return null;
}
