'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { resolveCprOrbieContext } from '@/lib/universal-intelligence';

export default function CprOrbieLayer() {
  const pathname = usePathname() ?? '/';
  const context = useMemo(() => resolveCprOrbieContext(pathname), [pathname]);
  const [open, setOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="cpr-orbie-shell">
      {open ? (
        <section className="cpr-orbie-panel" aria-label="Orbie CPR guidance">
          <div className="cpr-orbie-head">
            <div>
              <p className="cpr-orbie-eyebrow">Orbie</p>
              <h2>{context.area}</h2>
              <p>{context.status}</p>
            </div>
            <button type="button" aria-label="Close Orbie" onClick={() => setOpen(false)}>
              x
            </button>
          </div>

          <div className="cpr-orbie-recommendation">
            <p className="cpr-orbie-label">Possibility Center</p>
            <h3>{context.primary.title}</h3>
            <p>{context.primary.detail}</p>
            <Link href={context.primary.href} onClick={() => setOpen(false)}>
              {context.primary.actionLabel}
            </Link>
          </div>

          <div className="cpr-orbie-secondary" aria-label="Secondary possibilities">
            {context.secondary.map((item) => (
              <Link key={item.id} href={item.href} onClick={() => setOpen(false)}>
                <span>{item.title}</span>
                <small>{item.actionLabel}</small>
              </Link>
            ))}
          </div>

          <button type="button" className="cpr-orbie-disclosure" onClick={() => setHelpOpen((value) => !value)}>
            {helpOpen ? 'Hide help center' : 'Open help center'}
          </button>

          {helpOpen ? (
            <div className="cpr-orbie-help">
              <div>
                <p className="cpr-orbie-label">Active Specialists</p>
                {context.specialists.slice(0, 4).map((specialist) => (
                  <span key={specialist.id}>{specialist.name}</span>
                ))}
              </div>
              <div>
                <p className="cpr-orbie-label">Searchable Help</p>
                {context.helpTopics.map((topic) => (
                  <span key={topic}>{topic}</span>
                ))}
              </div>
              <div>
                <p className="cpr-orbie-label">Shared Memory</p>
                {context.memorySignals.map((signal) => (
                  <span key={signal}>{signal}</span>
                ))}
              </div>
              <div>
                <p className="cpr-orbie-label">Smartchitecture</p>
                {context.smartchitectureChecks.slice(0, 4).map((check) => (
                  <span key={check}>{check}</span>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <button type="button" className="cpr-orbie-orb" aria-label="Open Orbie" onClick={() => setOpen((value) => !value)}>
        <span aria-hidden="true">O</span>
      </button>
    </div>
  );
}
