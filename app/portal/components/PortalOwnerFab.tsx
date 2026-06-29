'use client';

type Props = {
  href: string;
  label?: string;
};

/** Floating Update Hub entry — links to the unified publish form. */
export default function PortalOwnerFab({ href, label = 'Update Hub' }: Props) {
  return (
    <a href={href} className="owner-fab" aria-label={label}>
      <svg className="owner-fab-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
      {label}
    </a>
  );
}
