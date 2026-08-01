import './landing.css';
import { LandingPage } from '@/lib/landing-chassis/LandingPage';
import { getLandingPageConfig } from '@/lib/get-landing-config';

export const dynamic = 'force-dynamic';

const NORTH_AMERICAN_FEE_AGREEMENT =
  'https://docs.google.com/forms/d/e/1FAIpQLSexOTZti6lP_scn4Igt9wwTmxpA3J2csHYaQ0JMGtTp82Zb5Q/viewform';

export default async function Home() {
  const config = await getLandingPageConfig();
  const correctedConfig = {
    ...config,
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
