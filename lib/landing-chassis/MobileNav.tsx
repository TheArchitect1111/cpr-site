'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { LandingPageConfig } from './types';
import { LandingIcon, landingIcons } from './icons';

type SocialLink = { label: string; href: string; icon: string };

function buildSocialLinks(c: LandingPageConfig): SocialLink[] {
  const links: SocialLink[] = [];
  if (c.links.instagram) links.push({ label: 'Instagram', href: c.links.instagram, icon: 'insta' });
  if (c.links.facebook) links.push({ label: 'Facebook', href: c.links.facebook, icon: 'facebook' });
  if (c.links.youtube) links.push({ label: 'YouTube', href: c.links.youtube, icon: 'youtube' });
  if (c.footer?.email) links.push({ label: 'Email', href: `mailto:${c.footer.email}`, icon: 'mail' });
  if (c.links.phone) links.push({ label: 'Phone', href: `tel:${c.links.phone.replace(/[^\d+]/g, '')}`, icon: 'phone' });
  return links;
}

/**
 * Premium mobile navigation drawer for the EA Landing Chassis™.
 * Reusable across every chassis-powered site — drives items from config.nav.
 */
export default function MobileNav({ config: c }: { config: LandingPageConfig }) {
  const [open, setOpen] = useState(false);
  const drawerId = useId();
  const burgerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const social = buildSocialLinks(c);

  const close = useCallback(() => setOpen(false), []);

  // Sticky-header shadow only after scrolling.
  useEffect(() => {
    const nav = document.querySelector('.lc-nav');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('lc-nav-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Body scroll lock + ESC + focus management while open.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const first = drawerRef.current?.querySelector<HTMLElement>(
      'a[href], button:not([disabled])',
    );
    first?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab' || !drawerRef.current) return;

      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;

      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  // Return focus to the hamburger after closing.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open) burgerRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = (e.touches[0]?.clientX ?? 0) - touchStartX.current;
    if (delta < -55) {
      touchStartX.current = null;
      close();
    }
  }

  return (
    <>
      <button
        ref={burgerRef}
        type="button"
        className="lc-burger"
        aria-label="Open navigation menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={drawerId}
        onClick={() => setOpen(true)}
      >
        <span className="lc-burger-box" aria-hidden>
          <span className="lc-burger-line" />
          <span className="lc-burger-line" />
          <span className="lc-burger-line" />
        </span>
      </button>

      <div
        className="lc-drawer-overlay"
        data-open={open}
        onClick={close}
        aria-hidden="true"
      />

      <div
        ref={drawerRef}
        id={drawerId}
        className="lc-drawer"
        data-open={open}
        role="dialog"
        aria-modal="true"
        aria-label={`${c.brand.nameLine1} navigation`}
        aria-hidden={!open}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
      >
        <div className="lc-drawer-top">
          <div className="lc-drawer-brand">
            <img src={c.brand.logo} alt="" className="lc-drawer-logo" />
            <div className="lc-drawer-brand-text">
              <span className="lc-drawer-brand-name">
                {c.brand.nameLine1} {c.brand.nameLine2}
              </span>
              <span className="lc-drawer-brand-tag">{c.brand.tagline}</span>
            </div>
          </div>
          <button type="button" className="lc-drawer-close" aria-label="Close menu" onClick={close}>
            <LandingIcon d={landingIcons.close} className="lc-drawer-close-icon" />
          </button>
        </div>

        <div className="lc-drawer-divider" />

        <nav className="lc-drawer-nav" aria-label="Mobile">
          {c.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="lc-drawer-link"
              onClick={close}
            >
              <span className="lc-drawer-link-icon" aria-hidden>
                <LandingIcon d={landingIcons[item.icon ?? 'chevron'] ?? landingIcons.chevron} />
              </span>
              <span className="lc-drawer-link-label">{item.label}</span>
              <span className="lc-drawer-link-chevron" aria-hidden>
                <LandingIcon d={landingIcons.chevron} />
              </span>
            </a>
          ))}
        </nav>

        <a className="lc-drawer-cta" href={c.links.apply} onClick={close}>
          {c.possibility?.applyLabel ?? 'APPLY NOW'}
        </a>

        {social.length > 0 ? (
          <div className="lc-drawer-social" aria-label="Social links">
            {social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="lc-drawer-social-link"
                aria-label={s.label}
                target={s.href.startsWith('http') ? '_blank' : undefined}
                rel={s.href.startsWith('http') ? 'noreferrer' : undefined}
              >
                <LandingIcon d={landingIcons[s.icon] ?? landingIcons.chevron} />
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}
