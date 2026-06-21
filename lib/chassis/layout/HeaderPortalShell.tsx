/**
 * Config-driven portal header + tab nav (EA Portal Chassis).
 * Synced from ea-operating-system/portal-core (commit a39442c).
 */

export type HeaderPortalTab = {
  id: string;
  label: string;
  href: string;
};

export type HeaderPortalShellProps = {
  logoSrc: string;
  nameLine1: string;
  nameLine2?: string;
  tabs: HeaderPortalTab[];
  activeTabId: string;
  logoutApiPath?: string;
  loginPath?: string;
  showLogout?: boolean;
};

export function HeaderPortalShell({
  logoSrc,
  nameLine1,
  nameLine2,
  tabs,
  activeTabId,
  logoutApiPath = '/api/portal/login',
  loginPath = '/portal/login',
  showLogout = true,
}: HeaderPortalShellProps) {
  return (
    <>
      <header
        style={{
          background: 'var(--portal-header-bg, #0C0C0A)',
          color: 'var(--portal-header-text, #fff)',
          borderBottom: '3px solid var(--portal-accent, #C8102E)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img
                src={logoSrc}
                alt=""
                style={{ width: 48, height: 48, objectFit: 'contain' }}
              />
              <div>
                <div style={{ fontWeight: 800, letterSpacing: '0.04em', fontSize: 14 }}>
                  {nameLine1}
                </div>
                {nameLine2 ? (
                  <div style={{ fontWeight: 800, letterSpacing: '0.04em', fontSize: 14, color: 'var(--portal-accent, #C8102E)' }}>
                    {nameLine2}
                  </div>
                ) : null}
              </div>
            </div>
            {showLogout ? (
              <button
                type="button"
                data-portal-logout="1"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.35)',
                  color: 'inherit',
                  padding: '8px 14px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                Log Out
              </button>
            ) : null}
          </div>
          <nav
            aria-label="Portal sections"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              marginTop: 16,
            }}
          >
            {tabs.map((tab) => (
              <a
                key={tab.id}
                href={tab.href}
                style={{
                  padding: '8px 14px',
                  borderRadius: 6,
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: tab.id === activeTabId ? 700 : 500,
                  color: tab.id === activeTabId ? '#fff' : 'rgba(255,255,255,0.75)',
                  background:
                    tab.id === activeTabId
                      ? 'var(--portal-accent, #C8102E)'
                      : 'rgba(255,255,255,0.08)',
                }}
              >
                {tab.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      {showLogout ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `document.querySelector('[data-portal-logout]')?.addEventListener('click',function(){fetch('${logoutApiPath}',{method:'DELETE'}).finally(function(){window.location.href='${loginPath}';});});`,
          }}
        />
      ) : null}
    </>
  );
}
