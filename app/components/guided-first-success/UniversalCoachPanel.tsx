'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  type EAPlatformId,
  GUIDED_PLATFORMS,
} from '@/lib/guided-first-success';
import './guided-first-success.css';

export default function UniversalCoachPanel({
  platformId,
  portalBase,
}: {
  platformId: EAPlatformId;
  portalBase?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const config = GUIDED_PLATFORMS[platformId];

  const handlePrompt = (prompt: string) => {
    if (platformId === 'cpr' && portalBase) {
      if (prompt.includes('next')) {
        router.push(`${portalBase}/recruiting-timeline`);
      } else if (prompt.includes('outreach')) {
        router.push(`${portalBase}/messaging-center`);
      } else {
        router.push(`${portalBase}/ask-cpr`);
      }
      return;
    }
    if (prompt.includes('capture') || prompt.includes('Capture')) {
      router.push('/capture');
    } else if (prompt.includes('Magnifi') || prompt.includes('share')) {
      router.push('/amplify');
    } else if (prompt.includes('attention')) {
      router.push('/portal/demo-client');
    }
  };

  return (
    <>
      <button
        type="button"
        className="uc-fab"
        aria-label="Open Guide coach"
        onClick={() => setOpen((v) => !v)}
      >
        Guide
      </button>
      {open && (
        <div className="uc-panel" role="dialog" aria-label="Universal AI Coach">
          <h3>Guide™ — What&apos;s next?</h3>
          <p className="gfs-muted" style={{ margin: 0 }}>
            Your coach for {config.name}. Tap a question.
          </p>
          {config.coachPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="uc-prompt"
              onClick={() => handlePrompt(prompt)}
            >
              {prompt}
            </button>
          ))}
          <button type="button" className="gfs-btn gfs-btn-ghost" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
      )}
    </>
  );
}
