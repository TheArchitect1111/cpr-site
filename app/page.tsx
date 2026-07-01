import './landing.css';
import { LandingPage } from '@/lib/landing-chassis/LandingPage';
import { getLandingPageConfig } from '@/lib/get-landing-config';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const config = await getLandingPageConfig();
  return <LandingPage config={config} />;
}
