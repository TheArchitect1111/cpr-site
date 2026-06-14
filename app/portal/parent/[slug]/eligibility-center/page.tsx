import '../../../portal.css';
import '../../parent-portal.css';
import '../../../resources/resources.css';
import { site } from '@/config/site';
import EligibilityCenter from '@/app/portal/resources/EligibilityCenter';

export const dynamic = 'force-dynamic';

export default async function ParentEligibilityCenterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

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
          <a href={`/portal/parent/${slug}`} className="portal-logout-btn">
            &#8592; Dashboard
          </a>
        </div>
      </header>

      <main className="portal-main res-main">
        <a href={`/portal/parent/${slug}`} className="res-back">
          &#8592; Back to Dashboard
        </a>
        <EligibilityCenter />
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
