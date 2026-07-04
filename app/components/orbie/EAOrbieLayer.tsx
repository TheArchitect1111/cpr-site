'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import type { OrbieContext, OrbiePossibility } from '@/lib/orbie/types';

type GuidanceMode = 'ambient' | 'morphing' | 'focus' | 'guiding' | 'acting' | 'done';

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

const morphTransition = {
  type: 'spring' as const,
  stiffness: 170,
  damping: 22,
  mass: 0.9,
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

function OrbButton({ onClick, needsAttention }: { onClick: () => void; needsAttention: boolean }) {
  return (
    <motion.button
      type="button"
      layoutId="ea-orbie-presence"
      className={`ea-orbie-orb cpr-orbie-orb${needsAttention ? ' needs-attention' : ''}`}
      aria-label="Open Orbie guidance"
      onClick={onClick}
      whileHover={{ y: -3, scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      transition={morphTransition}
    >
      <span className="ea-orbie-core" aria-hidden="true" />
    </motion.button>
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

  function awakenOrbie() {
    setStepIndex(0);
    setMode('morphing');
  }

  useEffect(() => {
    const shouldPresentOnLoad = pathname.startsWith('/admin');
    const sessionKey = `ea-orbie-presented:${namespace}:${pathname}`;
    if (shouldPresentOnLoad && !window.sessionStorage.getItem(sessionKey)) {
      window.sessionStorage.setItem(sessionKey, 'true');
      const timer = window.setTimeout(awakenOrbie, 650);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      if (!readMemory(namespace).includes(possibility.id)) awakenOrbie();
    }, possibility.urgency === 'high' ? 500 : 1200);

    return () => window.clearTimeout(timer);
  }, [namespace, pathname, possibility.id, possibility.urgency]);

  useEffect(() => {
    if (mode !== 'morphing') return;
    const timer = window.setTimeout(() => setMode('focus'), 760);
    return () => window.clearTimeout(timer);
  }, [mode]);

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
    window.setTimeout(() => setMode('ambient'), 4200);
  }

  function nextStep() {
    if (stepIndex >= possibility.steps.length - 1) {
      setMode('acting');
      window.setTimeout(finishGuidance, 2100);
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

      <AnimatePresence mode="wait">
        {mode === 'ambient' ? (
          <OrbButton key="orb" needsAttention={!isDone} onClick={awakenOrbie} />
        ) : null}

        {mode === 'morphing' ? (
          <motion.section
            key="morph"
            className="ea-orbie-morph"
            aria-label="Orbie is arriving"
            initial={{ right: 18, bottom: 18, width: 66, height: 66, borderRadius: 999, opacity: 1 }}
            animate={{ right: 96, bottom: 118, width: 260, height: 300, borderRadius: 34, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={morphTransition}
          >
            <motion.div
              layoutId="ea-orbie-presence"
              className="ea-orbie-morph-glow"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 2.8, opacity: 0.24 }}
              transition={morphTransition}
            />
            <motion.div
              className="ea-orbie-morph-figure"
              initial={{ opacity: 0, y: 38, scale: 0.42 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...morphTransition, delay: 0.12 }}
            >
              <OrbieFigure />
            </motion.div>
          </motion.section>
        ) : null}

        {mode === 'focus' ? (
          <motion.section
            key="focus"
            className="ea-orbie-focus"
            aria-label="Orbie guidance"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="ea-orbie-stage-light" aria-hidden="true" />
            <motion.div
              className="ea-orbie-focus-card ea-orbie-morph-stage"
              initial={{ y: 24, scale: 0.96, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 12, scale: 0.98, opacity: 0 }}
              transition={morphTransition}
            >
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
                <div className="ea-orbie-preview-steps" aria-label="Orbie plan">
                  {possibility.steps.map((step, index) => (
                    <span key={step.title}>
                      <b>{index + 1}</b>
                      {step.title}
                    </span>
                  ))}
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
              </div>
            </motion.div>
          </motion.section>
        ) : null}

        {mode === 'guiding' ? (
          <motion.div
            key="guiding"
            className="ea-orbie-guiding-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
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
                  <p className="ea-orbie-label">
                    Step {stepIndex + 1} of {possibility.steps.length}
                  </p>
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
                    {stepIndex >= possibility.steps.length - 1 ? 'Let Orbie finish' : 'Next step'}
                  </button>
                </div>

                <div className="ea-orbie-context-strip">
                  {context.specialists.slice(0, 3).map((specialist) => (
                    <span key={specialist.id}>{specialist.name}</span>
                  ))}
                </div>
              </div>
            </section>
          </motion.div>
        ) : null}

        {mode === 'acting' ? (
          <motion.section
            key="acting"
            className="ea-orbie-action"
            aria-label="Orbie is taking action"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={morphTransition}
          >
            <OrbieFigure compact />
            <div>
              <p className="ea-orbie-eyebrow">Orbie is working</p>
              <h2>On it.</h2>
              <p>I&apos;m reviewing the next move and preparing the cleanest handoff.</p>
              <ul className="ea-orbie-action-list">
                <li>Reviewing current context</li>
                <li>Applying CPR workflow guidance</li>
                <li>Preparing the next best step</li>
              </ul>
            </div>
          </motion.section>
        ) : null}

        {mode === 'done' ? (
          <motion.section
            key="done"
            className="ea-orbie-complete"
            aria-label="Orbie guidance complete"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={morphTransition}
          >
            <OrbieFigure compact />
            <div>
              <p className="ea-orbie-eyebrow">Orbie confirms</p>
              <strong>All done.</strong>
              <span>{possibility.completionMessage}</span>
              {context.secondary.length > 0 ? (
                <div className="ea-orbie-next-options">
                  {context.secondary.slice(0, 2).map((option) => (
                    <Link key={option.id} href={option.href}>
                      {option.actionLabel}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
