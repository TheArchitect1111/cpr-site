'use client';

import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { eaChassis, portalRoleLabel } from '@/config/ea-chassis';
import CprHelpAssistant from './CprHelpAssistant';
import './cpr-workspace-shell.css';

export type PortalTab = 'home' | 'parent' | 'amplifi' | 'updates' | 'resources' | 'messages' | 'account';

type NavItem = { id: PortalTab; label: string; href: string };

type Props = {
  portalType: 'athlete' | 'parent';
  slug: string;
  active: PortalTab;
  showLogout?: boolean;
  firstName?: string;
  pageTitle?: string;
  children: ReactNode;
};

function buildTabs(portalType: 'athlete' | 'parent', slug: string): NavItem[] {
  const base = `/portal/${portalType}/${slug}`;
  return [
    { id: 'home', label: portalRoleLabel(portalType), href: base },
    ...(portalType === 'parent'
      ? []
      : [{ id: 'amplifi' as const, label: eaChassis.navigation.tabs.amplifi, href: `${base}/amplifi` }]),
    { id: 'updates', label: eaChassis.navigation.tabs.updates, href: `${base}/updates` },
    { id: 'resources', label: eaChassis.navigation.tabs.resources, href: `${base}/resource-library` },
    { id: 'messages', label: eaChassis.navigation.tabs.messages, href: `${base}/messaging-center` },
    { id: 'account', label: eaChassis.navigation.tabs.account, href: `${base}/account` },
  ];
}

export default function PortalShell({
  portalType,
  slug,
  active,
  showLogout = true,
  firstName,
  pageTitle,
  children,
}: Props) {
  const pathname = usePathname() || '';
  const tabs = buildTabs(portalType, slug);
  const title =
    pageTitle ||
    tabs.find((t) => t.id === active)?.label ||
    portalRoleLabel(portalType);
  const brand = eaChassis.organization.shortName;
  const product = eaChassis.product.implementationName || eaChassis.product.name;

  const style = {
    '--cpr-shell-primary': eaChassis.theme.primary,
    '--cpr-shell-header': eaChassis.theme.header,
    '--cpr-shell-bg': eaChassis.theme.background,
    '--cpr-shell-font': eaChassis.theme.font,
  } as CSSProperties;

  return (
    <div className="cpr-shell" style={style}>
      <aside className="cpr-shell-sidebar" aria-label="Portal menu">
        <div className="cpr-shell-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={eaChassis.organization.logo} alt={brand} className="cpr-shell-logo" />
          <div>
            <strong>{brand}</strong>
            <span>{product}</span>
          </div>
        </div>
        <nav className="cpr-shell-nav">
          <p className="cpr-shell-nav-label">Portal</p>
          <ul>
            {tabs.map((tab) => {
              const on =
                active === tab.id ||
                pathname === tab.href ||
                (tab.id !== 'home' && pathname.startsWith(`${tab.href}/`));
              return (
                <li key={tab.id}>
                  <Link href={tab.href} className={on ? 'is-active' : undefined}>
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="cpr-shell-promo">
          <p className="cpr-shell-promo-title">Faith. Family. Basketball. Future.</p>
          <p className="cpr-shell-promo-copy">Your recruiting home — profiles, updates, and next steps.</p>
        </div>
        {showLogout ? (
          <a
            className="cpr-shell-logout"
            href="/portal/login"
            onClick={(e) => {
              e.preventDefault();
              fetch('/api/portal/login', { method: 'DELETE' }).finally(() => {
                window.location.href = '/portal/login';
              });
            }}
          >
            Sign out
          </a>
        ) : null}
      </aside>

      <div className="cpr-shell-main">
        <header className="cpr-shell-header">
          <div>
            <p className="cpr-shell-eyebrow">{portalRoleLabel(portalType)}</p>
            <h1>{title}</h1>
          </div>
          {firstName ? (
            <p className="cpr-shell-user">
              Hi, <strong>{firstName}</strong>
            </p>
          ) : null}
        </header>
        <div className="cpr-shell-content">{children}</div>
      </div>

      <CprHelpAssistant portalType={portalType} slug={slug} />
    </div>
  );
}
