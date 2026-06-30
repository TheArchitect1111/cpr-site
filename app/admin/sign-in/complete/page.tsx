import { redirect } from 'next/navigation';

/** Legacy Clerk callback — send everyone to the one CPR admin login page. */
export default async function AdminSignInCompleteRedirect({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ? `?next=${encodeURIComponent(params.next)}` : '';
  redirect(`/admin/login${next}`);
}
