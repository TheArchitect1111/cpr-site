'use client';

import { useState } from 'react';
import type { LandingContent } from '@/lib/landing-content';
import type { LandingPageConfig } from '@/lib/landing-chassis/types';
import { OptimisticSaveBadge, useOptimisticSave } from '@/lib/instant-feel';
import '../admin.css';
import './landing-editor.css';

type Props = {
  initialContent: LandingContent;
  defaults: LandingPageConfig;
  storageConfigured: boolean;
};

export default function AdminLandingEditor({ initialContent, defaults, storageConfigured }: Props) {
  const [content, setContent] = useState(initialContent);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const { status: saveStatus, error: saveError, run: runSave } = useOptimisticSave();

  const updatePossibility = (key: keyof LandingContent['possibility'], value: string) => {
    setContent((prev) => ({
      ...prev,
      possibility: { ...prev.possibility, [key]: value },
    }));
  };

  const updateAboutPoint = (index: number, value: string) => {
    setContent((prev) => {
      const points = [...prev.about.points];
      points[index] = value;
      return { ...prev, about: { ...prev.about, points } };
    });
  };

  async function uploadHero(file: File) {
    setBusy(true);
    setMessage('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('kind', 'landing-hero');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      updatePossibility('imageUrl', json.url);
      setMessage('Hero image uploaded. Click Save changes to publish.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setMessage('');
    await runSave(async () => {
      const res = await fetch('/api/portal-admin/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Save failed');
      setContent(json.content);
      setMessage('Landing page updated. Open the homepage in a new tab to review.');
    });
  }

  const ph = defaults.possibility;
  const defAbout = defaults.about;
  const defSocial = defaults.socialProof.items[0];
  const defFooter = defaults.footer;

  return (
    <div className="landing-editor">
      {!storageConfigured && (
        <p className="landing-editor-warn">
          Storage is not configured on this environment. Saves will fail until Vercel Blob is enabled.
        </p>
      )}

      <section className="landing-editor-section">
        <h2>Hero (top of homepage)</h2>
        <label>
          Announcement banner
          <input
            value={content.possibility.announcement}
            onChange={(e) => updatePossibility('announcement', e.target.value)}
            placeholder={ph.announcement ?? 'Optional announcement line'}
          />
        </label>
        <label>
          Headline
          <input
            value={content.possibility.headline}
            onChange={(e) => updatePossibility('headline', e.target.value)}
            placeholder={ph.headline}
          />
        </label>
        <label>
          Subheadline
          <input
            value={content.possibility.subheadline}
            onChange={(e) => updatePossibility('subheadline', e.target.value)}
            placeholder={ph.subheadline}
          />
        </label>
        <label>
          Supporting text
          <textarea
            rows={3}
            value={content.possibility.supporting}
            onChange={(e) => updatePossibility('supporting', e.target.value)}
            placeholder={ph.supporting}
          />
        </label>
        <label>
          Hero photo
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadHero(file);
            }}
          />
        </label>
        {(content.possibility.imageUrl || ph.image) && (
          <img
            className="landing-editor-preview"
            src={content.possibility.imageUrl || ph.image}
            alt="Hero preview"
          />
        )}
      </section>

      <section className="landing-editor-section">
        <h2>About CPR</h2>
        <label>
          Section heading
          <input
            value={content.about.heading}
            onChange={(e) =>
              setContent((prev) => ({ ...prev, about: { ...prev.about, heading: e.target.value } }))
            }
            placeholder={defAbout?.heading ?? 'About CPR'}
          />
        </label>
        {[0, 1, 2].map((i) => (
          <label key={i}>
            Bullet {i + 1}
            <input
              value={content.about.points[i] ?? ''}
              onChange={(e) => updateAboutPoint(i, e.target.value)}
              placeholder={defAbout?.points[i] ?? ''}
            />
          </label>
        ))}
      </section>

      <section className="landing-editor-section">
        <h2>Featured testimonial (first quote on homepage)</h2>
        <label>
          Section heading
          <input
            value={content.socialProof.heading}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                socialProof: { ...prev.socialProof, heading: e.target.value },
              }))
            }
            placeholder={defaults.socialProof.heading}
          />
        </label>
        <label>
          Quote
          <textarea
            rows={5}
            value={content.socialProof.quote}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                socialProof: { ...prev.socialProof, quote: e.target.value },
              }))
            }
            placeholder={defSocial?.quote ?? ''}
          />
        </label>
        <label>
          Name
          <input
            value={content.socialProof.name}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                socialProof: { ...prev.socialProof, name: e.target.value },
              }))
            }
            placeholder={defSocial?.name ?? ''}
          />
        </label>
        <label>
          Role
          <input
            value={content.socialProof.role}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                socialProof: { ...prev.socialProof, role: e.target.value },
              }))
            }
            placeholder={defSocial?.role ?? ''}
          />
        </label>
      </section>

      <section className="landing-editor-section">
        <h2>Bottom call-to-action</h2>
        <label>
          Heading
          <input
            value={content.finalCta.heading}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                finalCta: { ...prev.finalCta, heading: e.target.value },
              }))
            }
            placeholder={defaults.finalCta.heading}
          />
        </label>
        <label>
          Subheading
          <input
            value={content.finalCta.subheading}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                finalCta: { ...prev.finalCta, subheading: e.target.value },
              }))
            }
            placeholder={defaults.finalCta.subheading}
          />
        </label>
      </section>

      <section className="landing-editor-section">
        <h2>Footer contact</h2>
        <label>
          About line
          <textarea
            rows={2}
            value={content.footer.about}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                footer: { ...prev.footer, about: e.target.value },
              }))
            }
            placeholder={defFooter.about}
          />
        </label>
        <label>
          Email
          <input
            value={content.footer.email}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                footer: { ...prev.footer, email: e.target.value },
              }))
            }
            placeholder={defFooter.email}
          />
        </label>
        <label>
          Location
          <input
            value={content.footer.location}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                footer: { ...prev.footer, location: e.target.value },
              }))
            }
            placeholder={defFooter.location}
          />
        </label>
      </section>

      {message && <p className="landing-editor-message">{message}</p>}
      <OptimisticSaveBadge status={saveStatus} error={saveError} />

      <div className="landing-editor-actions">
        <button
          type="button"
          className={`admin-btn admin-btn-primary pc-tap${saveStatus === 'saved' ? ' pc-save-ok' : ''}`}
          disabled={busy || saveStatus === 'saving'}
          onClick={() => void save()}
        >
          {saveStatus === 'saving' ? 'Saving…' : 'Save changes'}
        </button>
        <a className="admin-btn admin-btn-secondary" href="/" target="_blank" rel="noreferrer">
          Preview homepage
        </a>
      </div>

      <p className="landing-editor-hint">
        Leave a field blank to keep the current published text. Gallery photos, nav links, and apply URLs still
        require EA support — this editor covers the headline areas families read first.
      </p>
    </div>
  );
}
