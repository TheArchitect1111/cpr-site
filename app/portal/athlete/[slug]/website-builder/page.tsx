import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AthleteWebsiteBuilderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/portal/athlete/${slug}/updates`);
}

