import './landing.css';
import { LandingPage } from '@/lib/landing-chassis/LandingPage';
import { getLandingPageConfig } from '@/lib/get-landing-config';
import { getAthletes } from '@/lib/athletes';
import { hasAthletePhoto } from '@/lib/athlete-photo';
import { getPublishedVideos } from '@/lib/video-library/published';

export const dynamic = 'force-dynamic';

const NORTH_AMERICAN_FEE_AGREEMENT =
  'https://docs.google.com/forms/d/e/1FAIpQLSexOTZti6lP_scn4Igt9wwTmxpA3J2csHYaQ0JMGtTp82Zb5Q/viewform';

function isUsablePublicImage(value?: string) {
  const src = (value || '').trim();
  if (!src || !hasAthletePhoto(src)) return false;
  if (src.includes('youtu.be/') || src.includes('youtube.com/')) return false;
  if (src.includes('drive.google.com/file/')) return false;
  return src.startsWith('/') || /^https?:\/\//i.test(src);
}

export default async function Home() {
  const [config, athletes, publishedVideos] = await Promise.all([
    getLandingPageConfig(), getAthletes(),
    getPublishedVideos().catch((error) => {
      console.error('CPR published video list unavailable:', error instanceof Error ? error.message : 'unknown');
      return [];
    }),
  ]);
  const homepageVideos = publishedVideos.filter(video =>
    video.placement === 'homepage-featured' || video.placement === 'homepage-gallery');
  const hasFeaturedVideo = homepageVideos.some(video => video.placement === 'homepage-featured');
  const seenPhotos = new Set<string>();

  const playerProfiles = athletes.rows
    .filter((athlete) => {
      const slug = (athlete.slug || '').trim();
      const photo = (athlete.photoUrl || '').trim();
      if (!slug || athlete.id === 'sample' || slug.startsWith('archived-')) return false;
      if (!isUsablePublicImage(photo) || seenPhotos.has(photo)) return false;
      seenPhotos.add(photo);
      return true;
    })
    .slice(0, 8)
    .map((athlete) => ({
      name: `${athlete.firstName} ${athlete.lastName}`.trim(),
      slug: athlete.slug,
      photo: athlete.photoUrl,
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
      video: hasFeaturedVideo ? '#cpr-videos' : config.links.video,
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
  return <LandingPage config={correctedConfig} publishedVideos={homepageVideos} />;
}
