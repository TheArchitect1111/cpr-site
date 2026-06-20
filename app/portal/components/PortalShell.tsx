import { site } from '@/config/site';
import '../portal-nav.css';

export type PortalTab = 'home' | 'parent' | 'amplifi' | 'updates';

type Props = {
  portalType: 'athlete' | 'parent';
  slug: string;
  active: PortalTab;
  showLogout?: boolean;
};

export default function PortalShell({
  portalType,
  slug,
  active,
  showLogout = true,
}: Props) {
  const base = `/portal/${portalType}/${slug}`;
  const tabs: { id: PortalTab; label: string; href: string }[] = [
    { id: 'home', label: portalType === 'parent' ? 'Parent Portal' : 'Athlete Portal', href: base },
    { id: 'amplifi', label: 'Amplifi™', href: `${base}/amplifi` },
    { id: 'updates', label: 'Update Portal', href: `${base}/updates` },
  ];

  return (
    <>
      <header className="portal-header">
        <div className="portal-header-inner portal-header-stack">
          <div className="portal-header-top">
            <div className="portal-logo-row">
              <img src={site.brand.logo} alt="CPR" className="portal-logo-img" />
              <div>
                <div className="display b1">CANADIAN PROSPECTS</div>
                <div className="display b2">RECRUITMENT</div>
              </div>
            </div>
            {showLogout && (
              <button type="button" className="portal-logout-btn" data-logout="1">
                Log Out
              </button>
            )}
          </div>
          <nav className="portal-nav" aria-label="Portal sections">
            {tabs.map((tab) => (
              <a
                key={tab.id}
                href={tab.href}
                className={`portal-nav-link${active === tab.id ? ' active' : ''}`}
              >
                {tab.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      {showLogout && (
        <script
          dangerouslySetInnerHTML={{
            __html: `document.querySelector('[data-logout]')?.addEventListener('click',function(){fetch('/api/portal/login',{method:'DELETE'}).finally(function(){window.location.href='/portal/login';});});`,
          }}
        />
      )}
    </>
  );
}
