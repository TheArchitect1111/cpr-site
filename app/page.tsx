import './landing.css';
import { LandingPage } from '@/lib/landing-chassis/LandingPage';
import { landingConfig } from '@/config/landing';

export default function Home() {
  return <LandingPage config={landingConfig} />;
}
