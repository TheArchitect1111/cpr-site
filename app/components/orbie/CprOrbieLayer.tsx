'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { resolveCprOrbieContext, type CprPossibility } from '@/lib/universal-intelligence';

type GuidanceMode = 'ambient' | 'peek' | 'guiding' | 'done';

type TargetRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const MEMORY_KEY = 'ea-smart-guidance:cpr';

function readMemory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(MEMORY_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function remember(id: string) {
  if (typeof window === 'undefined') return;
  const current = readMemory();
  const next = [id, ...current.filter((item) => item !== id)].slice(0, 16);
  window.localStorage.setItem(MEMORY_KEY, JSON.stringify(next));
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

function insightText(possibility: CprPossibility) {
  if (possibility.urgency === 'high') {
    return `I noticed ${possibility.targetLabel} can move this forward now.`;
  }
  return `I found the next useful step in ${possibility.targetLabel}.`;
}

export default function CprOrbieLayer() {
  const pathname = usePathname() ?? '/';
  const contextKey = typeof window === 'undefined' ? pathname : `${pathname}${window.location.search}`;
  const context = useMemo(() => resolveCprOrbieContext(contextKey), [contextKey]);
  const possibility = context.primary;
  const [mode, setMode] = useState<GuidanceMode>('ambient');
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [completed, setCompleted] = useState<string[]>(readMemory);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!readMemory().includes(possibility.id)) setMode('peek');
    }, possibility.urgency === 'high' ? 500 : 1200);

    return () => window.clearTimeout(timer);
  }, [possibility.id, possibility.urgency]);

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
    target?.classList.add('cpr-orbie-target-active');
    target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const timer = window.setTimeout(() => setTargetRect(targetRectFor(possibility.targetSelector)), 380);
    return () => {
      window.clearTimeout(timer);
      target?.classList.remove('cpr-orbie-target-active');
    };
  }, [mode, possibility.targetSelector]);

  const currentStep = possibility.steps[stepIndex] ?? possibility.steps[0];
  const isDone = completed.includes(possibility.id) || mode === 'done';

  function startGuidance() {
    setMode('guiding');
    setStepIndex(0);
    window.setTimeout(() => setTargetRect(targetRectFor(possibility.targetSelector)), 120);
  }

  function finishGuidance() {
    remember(possibility.id);
    setCompleted(readMemory());
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
    <div className={`cpr-orbie-shell cpr-orbie-${mode}`} data-guidance-mode={mode}>
      {mode === 'guiding' && targetRect ? (
        <div
          className="cpr-orbie-spotlight"
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
        <section className="cpr-orbie-peek" aria-label="Orbie recommendation">
          <div className="cpr-orbie-mini">
            <span />
            <span />
          </div>
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
        <section className="cpr-orbie-guide" style={cardStyle(targetRect)} aria-label="Orbie guided assistance">
          <div className="cpr-orbie-guide-head">
            <div className="cpr-orbie-bot" aria-hidden="true">
              <span />
              <span />
            </div>
            <div>
              <p className="cpr-orbie-eyebrow">Orbie noticed</p>
              <h2>{possibility.title}</h2>
            </div>
            <button type="button" aria-label="Close Orbie" onClick={() => setMode('ambient')}>
              x
            </button>
          </div>

          <p className="cpr-orbie-guide-copy">{possibility.detail}</p>

          <div className="cpr-orbie-step-card">
            <p className="cpr-orbie-label">Step {stepIndex + 1} of {possibility.steps.length}</p>
            <h3>{currentStep.title}</h3>
            <p>{currentStep.reason}</p>
            <small>{currentStep.outcome}</small>
          </div>

          <div className="cpr-orbie-step-list">
            {possibility.steps.map((step, index) => (
              <span key={step.title} className={index <= stepIndex ? 'is-active' : ''}>
                {index + 1}
              </span>
            ))}
          </div>

          <div className="cpr-orbie-guide-actions">
            {stepIndex === 0 ? (
              <Link href={possibility.href} onClick={() => setMode('ambient')}>
                {currentStep.actionLabel}
              </Link>
            ) : null}
            <button type="button" onClick={nextStep}>
              {stepIndex >= possibility.steps.length - 1 ? 'Mark done' : 'Next step'}
            </button>
          </div>

          <div className="cpr-orbie-context-strip">
            {context.specialists.slice(0, 3).map((specialist) => (
              <span key={specialist.id}>{specialist.name}</span>
            ))}
          </div>
        </section>
      ) : null}

      {mode === 'done' ? (
        <section className="cpr-orbie-complete" aria-label="Orbie guidance complete">
          <strong>Done.</strong>
          <span>{possibility.completionMessage}</span>
        </section>
      ) : null}

      <button
        type="button"
        className={`cpr-orbie-orb${mode === 'peek' && !isDone ? ' needs-attention' : ''}`}
        aria-label="Open Orbie guidance"
        onClick={mode === 'guiding' ? () => setMode('ambient') : startGuidance}
      >
        <span className="cpr-orbie-core" aria-hidden="true">
          <span />
          <span />
        </span>
      </button>
    </div>
  );
}
