import type { Metadata } from 'next';
import PossibilitiesPage from './PossibilitiesPage';
import './possibilities.css';

export const metadata: Metadata = {
  title: 'What Are You Trying to Accomplish? | Efficiency Architects',
  description: 'Discover what Efficiency Architects can build for your organization. From growing revenue to gaining peace of mind — see what becomes possible.',
  openGraph: {
    title: 'What Are You Trying to Accomplish? | Efficiency Architects',
    description: 'Discover what Efficiency Architects can build for your organization.',
    type: 'website',
  },
};

export default function PossibilitiesRoute() {
  return <PossibilitiesPage />;
}
