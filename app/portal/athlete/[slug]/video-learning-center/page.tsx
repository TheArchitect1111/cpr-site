import '../../../portal.css';
import '../../../resources/resources.css';
import '../../../sections/sections.css';
import { getAthlete } from '@/lib/athletes';
import { site } from '@/config/site';
import { notFound } from 'next/navigation';
import VideoLearningCenter from '@/app/portal/sections/VideoLearningCenter';
import { getResources } from '@/lib/sections-data';

export const dynamic = 'force-dynamic';

export default async function AthleteVideoLearningCenterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const athlete = await getAthlete(slug);
  if (!athlete) notFound();

  const { resources } = await getResources();
  const videos = resources.filter((r) => r.type === 'Video');

  return (
    <div className="portal-page">
      <header className="portal-header">
        <div className="portal-header-inner">
          <div className="portal-logo-row">
            <img src={site.brand.logo} alt="CPR" className="portal-logo-img" />
            <div>
              <div className="display b1">CANADIAN PROSPECTS</div>
              <div className="display b2">RECRUITMENT</div>
            </div>
          </div>
          <a href={`/portal/athlete/${slug}`} className="portal-logout-btn">
            &#8592; Dashboard
          </a>
        </div>
      </header>

      <main className="portal-main res-main">
        <a href={`/portal/athlete/${slug}`} className="res-back">
          &#8592; Back to Dashboard
        </a>
        <VideoLearningCenter resources={videos} />
      </main>

      <footer className="portal-footer">
        <p>
          Canadian Prospects Recruitment &middot;{' '}
          <a href={`mailto:${site.footer.email}`}>{site.footer.email}</a>
        </p>
      </footer>
    </div>
  );
}
