'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  type EAPlatformId,
  GUIDED_PLATFORMS,
  markGfsComplete,
  isGfsComplete,
} from '@/lib/guided-first-success';
import './guided-first-success.css';

type Step = 'welcome' | 'intent' | 'action' | 'result';

function subscribeNoop() {
  return () => {};
}

export default function GuidedFirstSuccessFlow({
  platformId,
  scope,
  firstActionHref,
  onFirstAction,
  onComplete,
  autoOpen = true,
}: {
  platformId: EAPlatformId;
  scope: string;
  firstActionHref?: string;
  onFirstAction?: () => void;
  onComplete?: () => void;
  /** When false, the modal never auto-opens (CPR uses GuidedTour instead). */
  autoOpen?: boolean;
}) {
  const config = GUIDED_PLATFORMS[platformId];
  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState<Step>('welcome');
  const [intentId, setIntentId] = useState<string | null>(null);

  const gfsComplete = useSyncExternalStore(
    subscribeNoop,
    () => isGfsComplete(platformId, scope),
    () => true,
  );

  const open = autoOpen && !dismissed && !gfsComplete;

  const actionHref = firstActionHref ?? config.firstActionHref;

  const nextActions = useMemo(() => {
    const cprMatch = platformId === 'cpr' && scope.includes('/');
    const cprBase = cprMatch ? `/portal/${scope}` : null;

    return config.nextActions.map((action) => {
      if (action.href) return action;
      if (cprBase) {
        const hrefs: Record<string, string> = {
          profile: `${cprBase}/recruiting-timeline`,
          timeline: `${cprBase}/recruiting-timeline`,
          messages: `${cprBase}/messaging-center`,
        };
        if (hrefs[action.id]) {
          return { ...action, href: hrefs[action.id] };
        }
      }
      if (action.id === 'pulse' && scope.startsWith('demo') === false && !cprMatch) {
        return { ...action, href: `/portal/${scope}/pulse` };
      }
      return action;
    });
  }, [config.nextActions, scope, platformId]);

  if (!open) return null;

  const finish = (intent?: string) => {
    markGfsComplete(platformId, scope, intent ?? intentId ?? undefined);
    setDismissed(true);
    onComplete?.();
  };

  return (
    <div className="gfs-backdrop" role="dialog" aria-modal="true" aria-labelledby="gfs-title">
      <div className="gfs-modal">
        <p className="gfs-eyebrow">Guided First Success™</p>

        {step === 'welcome' && (
          <>
            <h2 id="gfs-title" className="gfs-title">
              Welcome to {config.name}
            </h2>
            <p className="gfs-lede">{config.tagline}</p>
            <p className="gfs-muted">
              <strong>Success looks like:</strong> {config.successLooksLike}
            </p>
            <button type="button" className="gfs-btn gfs-btn-primary" onClick={() => setStep('intent')}>
              Get Started
            </button>
            <button type="button" className="gfs-btn gfs-btn-ghost" onClick={() => finish()}>
              Skip for now
            </button>
          </>
        )}

        {step === 'intent' && (
          <>
            <h2 className="gfs-title">What are you hoping to accomplish?</h2>
            <div className="gfs-intent-grid">
              {config.intents.map((intent) => (
                <button
                  key={intent.id}
                  type="button"
                  className={`gfs-intent${intentId === intent.id ? ' gfs-intent-active' : ''}`}
                  onClick={() => setIntentId(intent.id)}
                >
                  {intent.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="gfs-btn gfs-btn-primary"
              disabled={!intentId}
              onClick={() => setStep('action')}
            >
              Continue
            </button>
          </>
        )}

        {step === 'action' && (
          <>
            <h2 className="gfs-title">Let&apos;s accomplish something together</h2>
            <p className="gfs-lede">{config.firstActionLabel}</p>
            {actionHref ? (
              <Link
                href={actionHref}
                className="gfs-btn gfs-btn-primary"
                onClick={() => {
                  onFirstAction?.();
                  setStep('result');
                }}
              >
                {config.firstActionLabel}
              </Link>
            ) : (
              <button
                type="button"
                className="gfs-btn gfs-btn-primary"
                onClick={() => {
                  onFirstAction?.();
                  setStep('result');
                }}
              >
                {config.firstActionLabel}
              </button>
            )}
            <button type="button" className="gfs-btn gfs-btn-ghost" onClick={() => setStep('result')}>
              Skip to overview
            </button>
          </>
        )}

        {step === 'result' && (
          <>
            <h2 className="gfs-title">{config.resultTitle}</h2>
            <p className="gfs-lede">{config.resultDetail}</p>
            <p className="gfs-section-label">What would you like to do next?</p>
            <div className="gfs-next-grid">
              {nextActions.map((action) =>
                action.href ? (
                  <Link
                    key={action.id}
                    href={action.href}
                    className="gfs-next-card"
                    onClick={() => finish(intentId ?? undefined)}
                  >
                    <strong>{action.label}</strong>
                    {action.description && <span>{action.description}</span>}
                  </Link>
                ) : (
                  <button
                    key={action.id}
                    type="button"
                    className="gfs-next-card"
                    onClick={() => finish(intentId ?? undefined)}
                  >
                    <strong>{action.label}</strong>
                    {action.description && <span>{action.description}</span>}
                  </button>
                ),
              )}
            </div>
            <button type="button" className="gfs-btn gfs-btn-ghost" onClick={() => finish(intentId ?? undefined)}>
              Done — open workspace
            </button>
          </>
        )}
      </div>
    </div>
  );
}
