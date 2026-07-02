import type { ReactNode } from 'react';
import { eaChassis } from '@/config/ea-chassis';
import { getPortalOwner } from '@/lib/portal-owner';
import PortalShell, { type PortalTab } from './PortalShell';
import PortalOwnerFab from './PortalOwnerFab';

type Props = {
  portalType: 'athlete' | 'parent';
  slug: string;
  active: PortalTab;
  children: ReactNode;
};

/** Sub-page shell — PortalShell tabs + back link (replaces legacy portal-header). */
export default async function PortalSubpageLayout({ portalType, slug, active, children }: Props) {
  const dash = `/portal/${portalType}/${slug}`;
  const owner = await getPortalOwner();

  return (
    <div className="portal-page">
      <PortalShell portalType={portalType} slug={slug} active={active} />
      <main className="portal-main res-main">
        <a href={dash} className="res-back">
          &#8592; Back to Dashboard
        </a>
        {children}
      </main>
      <footer className="portal-footer">
        <p>
          {eaChassis.portalCopy.footerPrefix} &middot;{' '}
          <a href={`mailto:${eaChassis.organization.supportEmail}`}>{eaChassis.organization.supportEmail}</a>
        </p>
      </footer>
      {owner && <PortalOwnerFab href={`${dash}/updates/new`} />}
    </div>
  );
}
