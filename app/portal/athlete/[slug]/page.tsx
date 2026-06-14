import '../../portal.css';
import '../../resources/resources.css';
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

        <div className="portal-welcome-card" style={{ marginTop: 20 }}>
          <div className="portal-welcome-label">LEARNING CENTER</div>
          <h2 className="portal-welcome-heading" style={{ fontSize: 20, marginBottom: 16 }}>Recruiting Resources</h2>
          <div className="res-nav-grid">
            <a href={`/portal/athlete/${slug}/recruiting-timeline`} className="res-nav-card">
              <div className="res-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </div>
              <div className="res-nav-title">Recruiting Timeline</div>
              <div className="res-nav-desc">Grade-by-grade guide covering academics, film, camps, and coach outreach timing.</div>
              <div className="res-nav-arrow">View &#8594;</div>
            </a>
            <a href={`/portal/athlete/${slug}/eligibility-center`} className="res-nav-card">
              <div className="res-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div className="res-nav-title">Eligibility Center</div>
              <div className="res-nav-desc">NCAA D1, D2, NAIA, NJCAA, and U SPORTS eligibility requirements explained in plain language.</div>
              <div className="res-nav-arrow">View &#8594;</div>
            </a>
            <a href={`/portal/athlete/${slug}/scholarship-center`} className="res-nav-card">
              <div className="res-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className="res-nav-title">Scholarship Center</div>
              <div className="res-nav-desc">Athletic scholarships, academic aid, need-based grants, and walk-on opportunities explained.</div>
              <div className="res-nav-arrow">View &#8594;</div>
            </a>
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
