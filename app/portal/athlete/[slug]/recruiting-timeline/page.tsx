import '../../../portal.css';
import '../../../resources/resources.css';
import { getAthlete } from '@/lib/athletes';
import { site } from '@/config/site';
import { notFound } from 'next/navigation';
import RecruitingTimeline from '@/app/portal/resources/RecruitingTimeline';

export const dynamic = 'force-dynamic';

export default async function AthleteRecruitingTimelinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const athlete = await getAthlete(slug);
  if (!athlete) notFound();

  const currentYear = new Date().getFullYear();
  const gradYear = Number(athlete.gradYear) || 0;

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
        <RecruitingTimeline gradYear={gradYear} currentYear={currentYear} />
      </main>

      <footer className="portal-footer">
        <p>
          Canadian Prospects Recruitment &middot;{' '}
          <a href={`mailto:${site.footer.email}`}>{site.footer.email}</a>
        </p>
      </footer>

      <script dangerouslySetInnerHTML={{
        __html: `document.querySelector('[data-logout]')?.addEventListener('click',function(){fetch('/api/portal/login',{method:'DELETE'}).finally(function(){window.location.href='/portal/login';});});`,
      }} />
    </div>
  );
}
