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
  firstName?: string;
  pageTitle?: string;
};

export default async function PortalSubpageLayout({
  portalType,
  slug,
  active,
  children,
  firstName,
  pageTitle,
}: Props) {
  const dash = `/portal/${portalType}/${slug}`;
  const owner = await getPortalOwner();

  return (
    <PortalShell
      portalType={portalType}
      slug={slug}
      active={active}
      firstName={firstName}
      pageTitle={pageTitle}
    >
      <a href={dash} className="res-back" style={{ display: 'inline-block', marginBottom: 16 }}>
        &#8592; Back to Dashboard
      </a>
      {children}
      <footer className="portal-footer" style={{ marginTop: 32 }}>
        <p>
          {eaChassis.portalCopy.footerPrefix} &middot;{' '}
          <a href={`mailto:${eaChassis.organization.supportEmail}`}>{eaChassis.organization.supportEmail}</a>
        </p>
      </footer>
      {owner && <PortalOwnerFab href={`${dash}/updates/new`} />}
    </PortalShell>
  );
}
