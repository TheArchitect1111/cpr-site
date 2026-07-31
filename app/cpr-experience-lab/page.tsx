import type { Metadata } from 'next';
import CprExperienceLab from './CprExperienceLab';
import { experienceMeta } from '@/lib/cpr-experience-lab';
import './cpr-experience-lab.css';
import { experienceLabSurface } from '@/lib/surface-editor/registry';
import { getEditableSurfaceDocument } from '@/lib/surface-editor/store';
import type { CprExperienceLabContent } from '@/lib/cpr-experience-lab';

export const metadata: Metadata = {
  title: experienceMeta.title,
  description: experienceMeta.description,
  openGraph: {
    title: experienceMeta.title,
    description: experienceMeta.description,
    url: experienceMeta.path,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: experienceMeta.title,
    description: experienceMeta.description,
  },
};

export const dynamic = 'force-dynamic';

export default async function CprExperienceLabPage() {
  const document = await getEditableSurfaceDocument(experienceLabSurface);
  return <CprExperienceLab content={document.content as unknown as CprExperienceLabContent} sectionState={document.sections} />;
}
