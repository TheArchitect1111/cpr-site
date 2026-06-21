import type { CSSProperties } from 'react';
import { site } from '@/config/site';
import { HeaderPortalShell } from '@ea/portal-chassis/layout';
import '../portal-nav.css';

export type PortalTab = 'home' | 'parent' | 'amplifi' | 'updates' | 'resources' | 'messages';

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

  return (
    <div
      style={
        {
          '--portal-header-bg': site.colors.black,
          '--portal-accent': site.colors.redBright,
        } as CSSProperties
      }
    >
      <HeaderPortalShell
        logoSrc={site.brand.logo}
        nameLine1={site.brand.nameLine1}
        nameLine2={site.brand.nameLine2}
        activeTabId={active}
        showLogout={showLogout}
        tabs={[
          {
            id: 'home',
            label: portalType === 'parent' ? 'Parent Portal' : 'Athlete Portal',
            href: base,
          },
          { id: 'amplifi', label: 'Amplifi™', href: `${base}/amplifi` },
          { id: 'updates', label: 'Update Portal', href: `${base}/updates` },
          { id: 'resources', label: 'Resources', href: `${base}/resource-library` },
          { id: 'messages', label: 'Messages', href: `${base}/messaging-center` },
        ]}
      />
    </div>
  );
}
