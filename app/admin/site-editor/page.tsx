import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Edit Homepage — CPR Admin',
  robots: { index: false, follow: false },
};

export default function SiteEditorPage() {
  redirect('/admin/landing?scope=pages');
}
