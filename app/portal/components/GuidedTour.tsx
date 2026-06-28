'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { TourStep } from '@/lib/portal-tours';
import 'driver.js/dist/driver.css';
import './guided-tour.css';

const VERSION = 'v1';

function storageKey(tourId: string) {
  return `cpr-tour-${VERSION}-${tourId}`;
}

export default function GuidedTour({
  tourId,
  steps,
  autoStart = true,
}: {
  tourId: string;
  steps: TourStep[];
  autoStart?: boolean;
}) {
  const driverRef = useRef<import('driver.js').Driver | null>(null);

  const buildDriver = useCallback(async () => {
    const { driver } = await import('driver.js');
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    return driver({
      showProgress: true,
      animate: !reduce,
      overlayColor: 'rgba(5, 5, 5, 0.72)',
      stagePadding: 6,
      stageRadius: 12,
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      doneBtnText: 'Done',
      progressText: '{{current}} of {{total}}',
      // Only include steps whose target exists (or steps with no element).
      steps: steps
        .filter((s) => !s.element || (typeof document !== 'undefined' && document.querySelector(s.element)))
        .map((s) => ({
          element: s.element,
          popover: {
            title: s.title,
            description: s.description,
            side: s.side,
            align: 'start',
          },
        })),
    });
  }, [steps]);

  const start = useCallback(async () => {
    try {
      const d = await buildDriver();
      driverRef.current = d;
      d.drive();
    } catch {
      /* tour is non-critical */
    }
  }, [buildDriver]);

  useEffect(() => {
    if (!autoStart) return;
    if (typeof window === 'undefined') return;
    let seen = false;
    try {
      seen = localStorage.getItem(storageKey(tourId)) === 'done';
    } catch {
      seen = false;
    }
    if (seen) return;
    try {
      localStorage.setItem(storageKey(tourId), 'done');
    } catch {
      /* ignore */
    }
    // Defer so the page has painted and targets exist.
    const t = window.setTimeout(() => {
      void start();
    }, 700);
    return () => window.clearTimeout(t);
  }, [autoStart, tourId, start]);

  useEffect(() => {
    return () => {
      try {
        driverRef.current?.destroy();
      } catch {
        /* ignore */
      }
    };
  }, []);

  return (
    <button
      type="button"
      className="cpr-tour-help"
      onClick={() => void start()}
      aria-label="Take the guided tour"
      title="Take the guided tour"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <span>Help</span>
    </button>
  );
}
