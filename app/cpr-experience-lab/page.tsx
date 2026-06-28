import type { Metadata } from 'next';
import CprExperienceLab from './CprExperienceLab';
import { experienceMeta } from '@/lib/cpr-experience-lab';
import './cpr-experience-lab.css';

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

export default function CprExperienceLabPage() {
  return <CprExperienceLab />;
}
