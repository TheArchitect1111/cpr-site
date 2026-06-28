/**
 * Server-side detection of the CPR portal owner (admin).
 *
 * The portal pages are viewed by families, but when a CPR admin is logged in
 * (same `cpr_admin_session` cookie used by /admin) we surface inline owner
 * controls. This reads the cookie in a Server Component and verifies it.
 */

import { cookies } from 'next/headers';
import { verifyAdminSession, type AdminUser } from '@/lib/admin-auth';

const COOKIE = 'cpr_admin_session';

export type PortalOwner = Omit<AdminUser, 'password'>;

export async function getPortalOwner(): Promise<PortalOwner | null> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE)?.value;
    if (!token) return null;
    return verifyAdminSession(token);
  } catch {
    return null;
  }
}

export async function isPortalOwner(): Promise<boolean> {
  return Boolean(await getPortalOwner());
}
