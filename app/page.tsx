import './landing.css';
import { LandingPage } from '@/lib/landing-chassis/LandingPage';
import { getLandingPageConfig } from '@/lib/get-landing-config';
import { getAthletes } from '@/lib/athletes';
import { hasAthletePhoto } from '@/lib/athlete-photo';

export const dynamic = 'force-dynamic';

const NORTH_AMERICAN_FEE_AGREEMENT =
  'https://docs.google.com/forms/d/e/1FAIpQLSexOTZti6lP_scn4Igt9wwTmxpA3J2csHYaQ0JMGtTp82Zb5Q/viewform';

export default async function Home() {
  const [config, athletes] = await Promise.all([getLandingPageConfig(), getAthletes()]);
  const playerProfiles = athletes.rows
    .filter((athlete) => athlete.slug && athlete.id !== 'sample')
    .slice(0, 8)
    .map((athlete) => ({
      name: `${athlete.firstName} ${athlete.lastName}`.trim(),
      slug: athlete.slug,
      photo: hasAthletePhoto(athlete.photoUrl) ? athlete.photoUrl : '/pending-profile-details.jpg',
      meta: [athlete.position, athlete.gradYear ? `Class of ${athlete.gradYear}` : ''].filter(Boolean).join(' | '),
    }));
  const correctedConfig = {
    ...config,
    results: {
      ...config.results,
      playerProfiles: playerProfiles.length ? playerProfiles : config.results.playerProfiles,
    },
    links: {
      ...config.links,
      agreement: NORTH_AMERICAN_FEE_AGREEMENT,
    },
    footer: {
      ...config.footer,
      resources: config.footer.resources.map((item) =>
        item.label === 'North America Fee Agreement'
          ? { ...item, href: NORTH_AMERICAN_FEE_AGREEMENT }
          : item,
      ),
    },
  };
  return <LandingPage config={correctedConfig} />;
}
