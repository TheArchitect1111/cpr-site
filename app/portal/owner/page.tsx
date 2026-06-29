import { redirect } from 'next/navigation';
import { getPortalOwner } from '@/lib/portal-owner';

export const dynamic = 'force-dynamic';

/** Admin owners land here after one login — routes to the default family portal. */
export default async function PortalOwnerEntryPage() {
  const owner = await getPortalOwner();
  if (!owner) redirect('/admin/login?next=/portal/owner');

  const slug = process.env.CPR_DEFAULT_PORTAL_SLUG?.trim() || 'jayden-thompson';
  redirect(`/portal/athlete/${slug}`);
}
