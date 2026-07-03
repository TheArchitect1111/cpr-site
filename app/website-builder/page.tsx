import { redirect } from 'next/navigation';

export default function CprWebsiteBuilderPreviewPage() {
  redirect('/admin?tab=website');
}

