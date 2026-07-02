import type { CSSProperties } from 'react';
import { eaChassis, portalRoleLabel } from '@/config/ea-chassis';
import { HeaderPortalShell } from '@ea/portal-chassis/layout';
import CprHelpAssistant from './CprHelpAssistant';
import '../portal-nav.css';

export type PortalTab = 'home' | 'parent' | 'amplifi' | 'updates' | 'resources' | 'messages' | 'account';

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
          '--portal-header-bg': eaChassis.theme.header,
          '--portal-accent': eaChassis.theme.primary,
        } as CSSProperties
      }
    >
      <HeaderPortalShell
        logoSrc={eaChassis.organization.logo}
        nameLine1={eaChassis.organization.shortName}
        nameLine2={eaChassis.product.name}
        activeTabId={active}
        showLogout={showLogout}
        tabs={[
          {
            id: 'home',
            label: portalRoleLabel(portalType),
            href: base,
          },
          ...(portalType === 'parent'
            ? []
            : [{ id: 'amplifi', label: eaChassis.navigation.tabs.amplifi, href: `${base}/amplifi` }]),
          { id: 'updates', label: eaChassis.navigation.tabs.updates, href: `${base}/updates` },
          { id: 'resources', label: eaChassis.navigation.tabs.resources, href: `${base}/resource-library` },
          { id: 'messages', label: eaChassis.navigation.tabs.messages, href: `${base}/messaging-center` },
          { id: 'account', label: eaChassis.navigation.tabs.account, href: `${base}/account` },
        ]}
      />
      <CprHelpAssistant portalType={portalType} slug={slug} />
    </div>
  );
}
