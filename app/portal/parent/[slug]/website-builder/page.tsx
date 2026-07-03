import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ParentWebsiteBuilderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/portal/parent/${slug}/updates`);
}

