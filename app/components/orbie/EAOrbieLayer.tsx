'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { OrbieContext, OrbiePossibility } from '@/lib/orbie/types';

type GuidanceMode = 'ambient' | 'peek' | 'guiding' | 'done';

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

function cardStyle(rect: TargetRect | null): CSSProperties {
  if (!rect) return {};
  const narrow = typeof window !== 'undefined' && window.innerWidth < 720;
  if (narrow) return {};
  const rightSpace = window.innerWidth - (rect.left + rect.width);
  const left = rightSpace > 390 ? rect.left + rect.width + 18 : Math.max(18, rect.left - 378);
  const top = Math.min(Math.max(18, rect.top), window.innerHeight - 440);
  return { left, top };
}

function insightText(possibility: OrbiePossibility) {
  if (possibility.urgency === 'high') {
    return `I noticed ${possibility.targetLabel} can move this forward now.`;
  }
  return `I found the next useful step in ${possibility.targetLabel}.`;
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
    const timer = window.setTimeout(() => {
      if (!readMemory(namespace).includes(possibility.id)) setMode('peek');
    }, possibility.urgency === 'high' ? 500 : 1200);

    return () => window.clearTimeout(timer);
  }, [namespace, possibility.id, possibility.urgency]);

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
    <div className={`ea-orbie-shell ea-orbie-${mode}`} data-guidance-mode={mode} style={style}>
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

      {mode === 'peek' ? (
        <section className="ea-orbie-peek" aria-label="Orbie recommendation">
          <div className="ea-orbie-mark" aria-hidden="true" />
          <p>{insightText(possibility)}</p>
          <div>
            <button type="button" onClick={startGuidance}>
              Show me
            </button>
            <button type="button" onClick={() => setMode('ambient')} aria-label="Dismiss Orbie recommendation">
              Later
            </button>
          </div>
        </section>
      ) : null}

      {mode === 'guiding' ? (
        <section className="ea-orbie-guide" style={cardStyle(targetRect)} aria-label="Orbie guided assistance">
          <div className="ea-orbie-guide-head">
            <div className="ea-orbie-presence" aria-hidden="true" />
            <div>
              <p className="ea-orbie-eyebrow">Orbie noticed</p>
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
        </section>
      ) : null}

      {mode === 'done' ? (
        <section className="ea-orbie-complete" aria-label="Orbie guidance complete">
          <strong>Done.</strong>
          <span>{possibility.completionMessage}</span>
        </section>
      ) : null}

      <button
        type="button"
        className={`ea-orbie-orb cpr-orbie-orb${mode === 'peek' && !isDone ? ' needs-attention' : ''}`}
        aria-label="Open Orbie guidance"
        onClick={mode === 'guiding' ? () => setMode('ambient') : startGuidance}
      >
        <span className="ea-orbie-core" aria-hidden="true" />
      </button>
    </div>
  );
}
