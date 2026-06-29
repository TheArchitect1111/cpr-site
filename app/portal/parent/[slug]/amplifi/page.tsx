import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Amplifi has been removed from the parent portal. Any direct or saved links
// fall back to the parent portal home.
export default async function ParentAmplifiPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/portal/parent/${slug}`);
}
