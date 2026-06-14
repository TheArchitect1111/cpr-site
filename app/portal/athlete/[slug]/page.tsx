import '../../portal.css';
import { getAthlete } from '@/lib/athletes';
import { site } from '@/config/site';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AthletePortalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const athlete = await getAthlete(slug);
  if (!athlete) notFound();

  const name = athlete.firstName || athlete.slug;

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
          <button type="button" className="portal-logout-btn" data-logout="1">
            Log Out
          </button>
        </div>
      </header>

      <main className="portal-main">
        <div className="portal-welcome-card">
          <div className="portal-welcome-label">ATHLETE PORTAL</div>
          <h1 className="portal-welcome-heading">
            Welcome back, <span className="portal-name">{name}</span>.
          </h1>
          <p className="portal-welcome-body">
            Your Athlete Success Portal is coming soon. Coach Mike is building
            your personalized recruiting dashboard -- check back shortly for
            your profile, onboarding checklist, and recruiting activity.
          </p>
          <div className="portal-coming-soon">
            <div className="portal-cs-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <div className="portal-cs-title">Full Portal Coming Soon</div>
              <div className="portal-cs-sub">Profile builder, highlight video, onboarding checklist, and coach outreach tracker.</div>
            </div>
          </div>
        </div>
      </main>

      <footer className="portal-footer">
        <p>Canadian Prospects Recruitment &middot; <a href={`mailto:${site.footer.email}`}>{site.footer.email}</a></p>
      </footer>

      <script dangerouslySetInnerHTML={{
        __html: `document.querySelector('[data-logout]').addEventListener('click',function(){fetch('/api/portal/login',{method:'DELETE'}).finally(function(){window.location.href='/portal/login';});});`,
      }} />
    </div>
  );
}
