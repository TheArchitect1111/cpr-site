'use client';

import { useEffect, useRef, useState } from 'react';
import './pwa.css';

type Platform = 'ios' | 'android' | 'desktop';

const DISMISS_KEY = 'ea_pwa_install_dismissed_v1';
const DISMISS_DAYS = 14;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function recentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export default function PwaController({ appName }: { appName: string }) {
  const [show, setShow] = useState(false);
  const [platform] = useState<Platform>(() => detectPlatform());
  const [hasNativePrompt, setHasNativePrompt] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setHasNativePrompt(true);
      setShow(true);
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    // iOS never fires beforeinstallprompt — show manual instructions after a beat.
    let iosTimer: ReturnType<typeof setTimeout> | undefined;
    if (platform === 'ios') {
      iosTimer = setTimeout(() => setShow(true), 2500);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, [platform]);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  async function install() {
    const prompt = deferredPrompt.current;
    if (!prompt) {
      // No native prompt (iOS) — keep modal open showing instructions.
      return;
    }
    await prompt.prompt();
    await prompt.userChoice.catch(() => undefined);
    deferredPrompt.current = null;
    setShow(false);
  }

  if (!show) return null;

  const canPrompt = hasNativePrompt && platform !== 'ios';

  return (
    <div className="ea-pwa-backdrop" role="dialog" aria-modal="true" aria-labelledby="ea-pwa-title">
      <div className="ea-pwa-sheet">
        <button type="button" className="ea-pwa-close" aria-label="Dismiss" onClick={dismiss}>
          ×
        </button>

        <div className="ea-pwa-head">
          <img src="/cpr-logo.png" alt="" className="ea-pwa-logo" />
          <div>
            <h2 id="ea-pwa-title" className="ea-pwa-title">
              Add {appName} to your Home Screen
            </h2>
            <p className="ea-pwa-sub">One tap. Lifetime access. Opens like an app.</p>
          </div>
        </div>

        {canPrompt ? (
          <button type="button" className="ea-pwa-cta" onClick={install}>
            Add to Home Screen
          </button>
        ) : platform === 'ios' ? (
          <ol className="ea-pwa-steps">
            <li>
              Tap the <strong>Share</strong> icon{' '}
              <span aria-hidden className="ea-pwa-ios-share">⬆️</span> at the bottom of Safari.
            </li>
            <li>
              Scroll down and tap <strong>Add to Home Screen</strong>.
            </li>
            <li>
              Tap <strong>Add</strong> — then open {appName} from your home screen anytime.
            </li>
          </ol>
        ) : (
          <ol className="ea-pwa-steps">
            <li>
              Open your browser menu <strong>(⋮)</strong>.
            </li>
            <li>
              Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.
            </li>
            <li>Confirm — then launch it like any other app.</li>
          </ol>
        )}

        <button type="button" className="ea-pwa-later" onClick={dismiss}>
          Maybe later
        </button>
      </div>
    </div>
  );
}
