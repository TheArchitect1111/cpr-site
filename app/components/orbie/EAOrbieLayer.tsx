'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { OrbieContext, OrbiePossibility } from '@/lib/orbie/types';

type GuidanceMode = 'ambient' | 'focus' | 'guiding' | 'done';

type TargetRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type Props = {
  productId: string;
  resolveContext: (routeKey: string) => OrbieContext;
  memoryNamespace?: string;
};

function memoryKey(namespace: string) {
  return `ea-orbie-memory:${namespace}`;
}

function readMemory(namespace: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(memoryKey(namespace));
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function remember(namespace: string, id: string) {
  if (typeof window === 'undefined') return;
  const current = readMemory(namespace);
  const next = [id, ...current.filter((item) => item !== id)].slice(0, 16);
  window.localStorage.setItem(memoryKey(namespace), JSON.stringify(next));
}

function targetRectFor(selector: string): TargetRect | null {
  if (typeof document === 'undefined') return null;
  const target = document.querySelector(selector);
  if (!target) return null;
  const rect = target.getBoundingClientRect();
  return {
    top: Math.max(8, rect.top - 8),
    left: Math.max(8, rect.left - 8),
    width: rect.width + 16,
    height: rect.height + 16,
  };
}

function insightText(possibility: OrbiePossibility) {
  if (possibility.urgency === 'high') {
    return `I noticed ${possibility.targetLabel} can move this forward now.`;
  }
  return `I found the next useful step in ${possibility.targetLabel}.`;
}

function focusLead(context: OrbieContext) {
  if (context.primary.urgency === 'high') {
    return `${context.area} has something ready for attention. I can guide the next move.`;
  }
  return `I can help you move through ${context.area} without guessing what to do next.`;
}

function OrbieFigure({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`ea-orbie-figure${compact ? ' ea-orbie-figure-compact' : ''}`} aria-hidden="true">
      <div className="ea-orbie-antenna">
        <span />
      </div>
      <div className="ea-orbie-head">
        <div className="ea-orbie-ear ea-orbie-ear-left" />
        <div className="ea-orbie-ear ea-orbie-ear-right" />
        <div className="ea-orbie-visor">
          <span className="ea-orbie-eye" />
          <span className="ea-orbie-eye" />
          <span className="ea-orbie-smile" />
        </div>
      </div>
      <div className="ea-orbie-body">
        <span>EA</span>
      </div>
      <div className="ea-orbie-arm ea-orbie-arm-left" />
      <div className="ea-orbie-arm ea-orbie-arm-right" />
      <div className="ea-orbie-shadow" />
    </div>
  );
}

export default function EAOrbieLayer({ productId, resolveContext, memoryNamespace }: Props) {
  const pathname = usePathname() ?? '/';
  const namespace = memoryNamespace ?? productId;
  const routeKey = typeof window === 'undefined' ? pathname : `${pathname}${window.location.search}`;
  const context = useMemo(() => resolveContext(routeKey), [resolveContext, routeKey]);
  const possibility = context.primary;
  const [mode, setMode] = useState<GuidanceMode>('ambient');
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [completed, setCompleted] = useState<string[]>(() => readMemory(namespace));

  useEffect(() => {
    const shouldPresentOnLoad = pathname.startsWith('/admin');
    const sessionKey = `ea-orbie-presented:${namespace}:${pathname}`;
    if (shouldPresentOnLoad && !window.sessionStorage.getItem(sessionKey)) {
      window.sessionStorage.setItem(sessionKey, 'true');
      const timer = window.setTimeout(() => setMode('focus'), 650);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      if (!readMemory(namespace).includes(possibility.id)) setMode('focus');
    }, possibility.urgency === 'high' ? 500 : 1200);

    return () => window.clearTimeout(timer);
  }, [namespace, pathname, possibility.id, possibility.urgency]);

  useEffect(() => {
    const refresh = () => setTargetRect(targetRectFor(possibility.targetSelector));
    refresh();
    window.addEventListener('resize', refresh);
    window.addEventListener('scroll', refresh, true);
    return () => {
      window.removeEventListener('resize', refresh);
      window.removeEventListener('scroll', refresh, true);
    };
  }, [possibility.targetSelector, pathname]);

  useEffect(() => {
    if (mode !== 'guiding') return;
    const target = document.querySelector(possibility.targetSelector);
    target?.classList.add('ea-orbie-target-active', 'cpr-orbie-target-active');
    target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const timer = window.setTimeout(() => setTargetRect(targetRectFor(possibility.targetSelector)), 380);
    return () => {
      window.clearTimeout(timer);
      target?.classList.remove('ea-orbie-target-active', 'cpr-orbie-target-active');
    };
  }, [mode, possibility.targetSelector]);

  const currentStep = possibility.steps[stepIndex] ?? possibility.steps[0];
  const isDone = completed.includes(possibility.id) || mode === 'done';
  const style = { '--orbie-accent': context.accentColor } as CSSProperties;

  function startGuidance() {
    setMode('guiding');
    setStepIndex(0);
    window.setTimeout(() => setTargetRect(targetRectFor(possibility.targetSelector)), 120);
  }

  function finishGuidance() {
    remember(namespace, possibility.id);
    setCompleted(readMemory(namespace));
    setMode('done');
    window.setTimeout(() => setMode('ambient'), 3200);
  }

  function nextStep() {
    if (stepIndex >= possibility.steps.length - 1) {
      finishGuidance();
      return;
    }
    setStepIndex((value) => value + 1);
  }

  return (
    <div className={`ea-orbie-shell ea-orbie-mode-${mode}`} data-guidance-mode={mode} style={style}>
      {mode === 'guiding' && targetRect ? (
        <div
          className="ea-orbie-spotlight cpr-orbie-spotlight"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
          aria-hidden="true"
        />
      ) : null}

      {mode === 'focus' ? (
        <section className="ea-orbie-focus" aria-label="Orbie guidance">
          <div className="ea-orbie-stage-light" aria-hidden="true" />
          <div className="ea-orbie-focus-card ea-orbie-morph-stage">
            <div className="ea-orbie-hero-figure">
              <OrbieFigure compact />
            </div>
            <div className="ea-orbie-focus-copy">
              <p className="ea-orbie-eyebrow">Orbie is ready</p>
              <h2>Hi, I&apos;m Orbie.</h2>
              <p className="ea-orbie-focus-notice">{insightText(possibility)}</p>
              <p>{focusLead(context)}</p>
              <div className="ea-orbie-focus-status">
                <span>{context.status}</span>
              </div>
              <div className="ea-orbie-focus-actions">
                <button type="button" onClick={startGuidance}>
                  Let&apos;s handle it
                </button>
                <Link href={possibility.href} onClick={() => setMode('ambient')}>
                  Open now
                </Link>
                <button type="button" onClick={() => setMode('ambient')}>
                  Later
                </button>
              </div>
              {context.secondary.length > 0 ? (
                <div className="ea-orbie-focus-secondary" aria-label="Other Orbie options">
                  {context.secondary.slice(0, 2).map((option) => (
                    <Link key={option.id} href={option.href} onClick={() => setMode('ambient')}>
                      <strong>{option.title}</strong>
                      <span>{option.actionLabel}</span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {mode === 'guiding' ? (
        <>
        <div className="ea-orbie-guide-backdrop" aria-hidden="true" />
        <section className="ea-orbie-guide" aria-label="Orbie guided assistance">
          <div className="ea-orbie-guide-figure">
            <OrbieFigure compact />
          </div>
          <div className="ea-orbie-guide-content">
            <div className="ea-orbie-guide-head">
              <div>
                <p className="ea-orbie-eyebrow">Orbie is guiding</p>
                <h2>{possibility.title}</h2>
              </div>
              <button type="button" aria-label="Close Orbie" onClick={() => setMode('ambient')}>
                x
              </button>
            </div>

            <p className="ea-orbie-guide-copy">{possibility.detail}</p>

            <div className="ea-orbie-step-card">
              <p className="ea-orbie-label">Step {stepIndex + 1} of {possibility.steps.length}</p>
              <h3>{currentStep.title}</h3>
              <p>{currentStep.reason}</p>
              <small>{currentStep.outcome}</small>
            </div>

            <div className="ea-orbie-step-list">
              {possibility.steps.map((step, index) => (
                <span key={step.title} className={index <= stepIndex ? 'is-active' : ''}>
                  {index + 1}
                </span>
              ))}
            </div>

            <div className="ea-orbie-guide-actions">
              {stepIndex === 0 ? (
                <Link href={possibility.href} onClick={() => setMode('ambient')}>
                  {currentStep.actionLabel}
                </Link>
              ) : null}
              <button type="button" onClick={nextStep}>
                {stepIndex >= possibility.steps.length - 1 ? 'Mark done' : 'Next step'}
              </button>
            </div>

            <div className="ea-orbie-context-strip">
              {context.specialists.slice(0, 3).map((specialist) => (
                <span key={specialist.id}>{specialist.name}</span>
              ))}
            </div>
          </div>
        </section>
        </>
      ) : null}

      {mode === 'done' ? (
        <section className="ea-orbie-complete" aria-label="Orbie guidance complete">
          <strong>Done.</strong>
          <span>{possibility.completionMessage}</span>
        </section>
      ) : null}

      <button
        type="button"
        className={`ea-orbie-orb cpr-orbie-orb${mode === 'focus' && !isDone ? ' needs-attention' : ''}`}
        aria-label="Open Orbie guidance"
        onClick={mode === 'guiding' ? () => setMode('ambient') : startGuidance}
      >
        <span className="ea-orbie-core" aria-hidden="true" />
      </button>
    </div>
  );
}
