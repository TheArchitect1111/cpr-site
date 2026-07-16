'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LandingContent, LandingGallerySlideSlot } from '@/lib/landing-content';
import { LANDING_EDITOR_SECTIONS } from '@/lib/landing-editor-sections';
import type { LandingPageConfig } from '@/lib/landing-chassis/types';
import { OptimisticSaveBadge, useOptimisticSave } from '@/lib/instant-feel';
import MediaLibraryPicker from './MediaLibraryPicker';
import GallerySlidesEditor from './GallerySlidesEditor';
import AdminTextArea from '../components/AdminTextArea';
import AdminRichText from '../components/AdminRichText';
import '../admin.css';
import './landing-editor.css';

type Props = {
  initialContent: LandingContent;
  defaults: LandingPageConfig;
  storageConfigured: boolean;
};

function seedSlidesFromDefaults(
  existing: LandingGallerySlideSlot[] | undefined,
  defaults: { img: string; caption?: string }[] | undefined,
): LandingGallerySlideSlot[] {
  if (existing?.length) return existing;
  if (!defaults?.length) return [];
  return defaults.map((s) => ({
    imageUrl: s.img,
    caption: s.caption ?? '',
  }));
}

export default function AdminLandingEditor({ initialContent, defaults, storageConfigured }: Props) {
  const seededInitial = useMemo((): LandingContent => {
    const heroSeed =
      initialContent.possibility.heroSlides?.length
        ? initialContent.possibility.heroSlides
        : initialContent.possibility.imageUrl
          ? [{ imageUrl: initialContent.possibility.imageUrl, caption: '' }]
          : undefined;
    const defaultHero = defaults.possibility?.image ? [{ img: defaults.possibility.image }] : undefined;
    return {
      ...initialContent,
      possibility: {
        ...initialContent.possibility,
        heroSlides: seedSlidesFromDefaults(heroSeed, defaultHero),
      },
      chipsAndDrip: {
        ...initialContent.chipsAndDrip,
        slides: seedSlidesFromDefaults(
          initialContent.chipsAndDrip.slides,
          defaults.chipsAndDrip?.slides,
        ),
      },
      campsExposure: {
        ...initialContent.campsExposure,
        slides: seedSlidesFromDefaults(
          initialContent.campsExposure.slides,
          defaults.campsExposure?.slides,
        ),
      },
    };
  }, [initialContent, defaults]);

  const [content, setContent] = useState(seededInitial);
  const [activeSection, setActiveSection] = useState(LANDING_EDITOR_SECTIONS[0].id);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const { status: saveStatus, error: saveError, run: runSave } = useOptimisticSave();

  const activeMeta = LANDING_EDITOR_SECTIONS.find((s) => s.id === activeSection) ?? LANDING_EDITOR_SECTIONS[0];

  const scrollPreviewToSection = useCallback((hash: string) => {
    const frame = previewRef.current;
    if (!frame?.contentWindow) return;
    try {
      frame.contentWindow.location.hash = hash.replace(/^#/, '');
    } catch {
      /* cross-origin guard */
    }
  }, []);

  useEffect(() => {
    scrollPreviewToSection(activeMeta.hash);
  }, [activeMeta.hash, scrollPreviewToSection]);

  async function uploadImage(kind: string, file: File, onUrl: (url: string) => void) {
    setBusy(true);
    setMessage('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('kind', kind);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      onUrl(json.url);
      setMessage('Image uploaded. Click Save changes to publish.');
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
      setMessage('Homepage updated. The preview panel refreshes on save.');
      previewRef.current?.contentWindow?.location.reload();
    });
  }

  const ph = defaults.possibility;
  const defAbout = defaults.about;
  const defSocial = defaults.socialProof;
  const defPhilosophy = defaults.philosophy;
  const defPath = defaults.pathBand;
  const defProcess = defaults.process;
  const defChips = defaults.chipsAndDrip;
  const defCamps = defaults.campsExposure;
  const defResults = defaults.results;
  const defFooter = defaults.footer;

  function renderSectionFields() {
    switch (activeSection) {
      case 'top':
        return (
          <>
            <label>
              Announcement banner
              <input
                value={content.possibility.announcement}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    possibility: { ...prev.possibility, announcement: e.target.value },
                  }))
                }
                placeholder={ph.announcement ?? 'Optional announcement line'}
              />
            </label>
            <label>
              Headline
              <input
                value={content.possibility.headline}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    possibility: { ...prev.possibility, headline: e.target.value },
                  }))
                }
                placeholder={ph.headline}
              />
            </label>
            <label>
              Subheadline
              <input
                value={content.possibility.subheadline}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    possibility: { ...prev.possibility, subheadline: e.target.value },
                  }))
                }
                placeholder={ph.subheadline}
              />
            </label>
            <label>
              Supporting text
              <AdminRichText
                minRows={3}
                value={content.possibility.supporting}
                onChange={(value) =>
                  setContent((prev) => ({
                    ...prev,
                    possibility: { ...prev.possibility, supporting: value },
                  }))
                }
                placeholder={ph.supporting}
              />
            </label>
            <GallerySlidesEditor
              title="Hero photo gallery"
              slides={content.possibility.heroSlides}
              busy={busy}
              onUpload={(file, onUrl) => void uploadImage('landing-hero', file, onUrl)}
              onChange={(heroSlides) =>
                setContent((prev) => ({
                  ...prev,
                  possibility: {
                    ...prev.possibility,
                    heroSlides,
                    imageUrl: heroSlides[0]?.imageUrl ?? prev.possibility.imageUrl,
                  },
                }))
              }
            />
            <p className="landing-editor-note">
              The first slide is the featured hero image. Multiple slides rotate on the homepage with
              fade transitions and arrow controls.
            </p>
          </>
        );

      case 'about':
        return (
          <>
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
                  onChange={(e) => {
                    const points = [...content.about.points];
                    points[i] = e.target.value;
                    setContent((prev) => ({ ...prev, about: { ...prev.about, points } }));
                  }}
                  placeholder={defAbout?.points[i] ?? ''}
                />
              </label>
            ))}
          </>
        );

      case 'testimonials':
        return (
          <>
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
                placeholder={defSocial.heading}
              />
            </label>
            <p className="landing-editor-note">
              Edit up to three quotes shown on the homepage. Leave a slot blank to keep the current quote for that
              position.
            </p>
            {[0, 1, 2].map((i) => {
              const slot = content.testimonials[i];
              const def = defSocial.items[i];
              return (
                <div key={i} className="landing-editor-subsection">
                  <h3>Testimonial {i + 1}</h3>
                  <label>
                    Quote
                    <AdminRichText
                      minRows={4}
                      value={slot?.quote ?? ''}
                      onChange={(value) => {
                        const testimonials = [...content.testimonials];
                        testimonials[i] = { ...testimonials[i], quote: value };
                        setContent((prev) => ({ ...prev, testimonials }));
                      }}
                      placeholder={def?.quote ?? ''}
                    />
                  </label>
                  <label>
                    Name
                    <input
                      value={slot?.name ?? ''}
                      onChange={(e) => {
                        const testimonials = [...content.testimonials];
                        testimonials[i] = { ...testimonials[i], name: e.target.value };
                        setContent((prev) => ({ ...prev, testimonials }));
                      }}
                      placeholder={def?.name ?? ''}
                    />
                  </label>
                  <label>
                    Role
                    <input
                      value={slot?.role ?? ''}
                      onChange={(e) => {
                        const testimonials = [...content.testimonials];
                        testimonials[i] = { ...testimonials[i], role: e.target.value };
                        setContent((prev) => ({ ...prev, testimonials }));
                      }}
                      placeholder={def?.role ?? ''}
                    />
                  </label>
                  <label>
                    Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          void uploadImage('landing-quote', file, (url) => {
                            const testimonials = [...content.testimonials];
                            testimonials[i] = { ...testimonials[i], photoUrl: url };
                            setContent((prev) => ({ ...prev, testimonials }));
                          });
                        }
                      }}
                    />
                  </label>
                  <MediaLibraryPicker
                    label="Pick photo from gallery"
                    onPick={(url) => {
                      const testimonials = [...content.testimonials];
                      testimonials[i] = { ...testimonials[i], photoUrl: url };
                      setContent((prev) => ({ ...prev, testimonials }));
                    }}
                  />
                  {(slot?.photoUrl || def?.photo) && (
                    <img
                      className="landing-editor-preview landing-editor-preview--thumb"
                      src={slot?.photoUrl || def?.photo}
                      alt={`Testimonial ${i + 1}`}
                    />
                  )}
                </div>
              );
            })}
          </>
        );

      case 'philosophy':
        return (
          <>
            <label>
              Eyebrow label
              <input
                value={content.philosophy.label}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    philosophy: { ...prev.philosophy, label: e.target.value },
                  }))
                }
                placeholder={defPhilosophy?.label ?? ''}
              />
            </label>
            <label>
              Quote
              <AdminRichText
                minRows={3}
                value={content.philosophy.quote}
                onChange={(value) =>
                  setContent((prev) => ({
                    ...prev,
                    philosophy: { ...prev.philosophy, quote: value },
                  }))
                }
                placeholder={defPhilosophy?.quote ?? ''}
              />
            </label>
            <label>
              Attribution
              <input
                value={content.philosophy.attribution}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    philosophy: { ...prev.philosophy, attribution: e.target.value },
                  }))
                }
                placeholder={defPhilosophy?.attribution ?? ''}
              />
            </label>
          </>
        );

      case 'path':
        return (
          <label>
            Band text
            <AdminTextArea
              rows={2}
              value={content.pathBand.text}
              onChange={(value) =>
                setContent((prev) => ({
                  ...prev,
                  pathBand: { ...prev.pathBand, text: value },
                }))
              }
              placeholder={defPath?.text ?? ''}
            />
          </label>
        );

      case 'how-it-works':
        return (
          <>
            <label>
              Section heading
              <input
                value={content.process.heading}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    process: { ...prev.process, heading: e.target.value },
                  }))
                }
                placeholder={defProcess?.heading ?? ''}
              />
            </label>
            <label>
              Subheading
              <AdminTextArea
                rows={2}
                value={content.process.subheading}
                onChange={(value) =>
                  setContent((prev) => ({
                    ...prev,
                    process: { ...prev.process, subheading: value },
                  }))
                }
                placeholder={defProcess?.subheading ?? ''}
              />
            </label>
            {content.process.steps.map((step, i) => {
              const def = defProcess?.steps[i];
              return (
                <div key={i} className="landing-editor-subsection">
                  <h3>Step {i + 1}</h3>
                  <label>
                    Label
                    <input
                      value={step.label}
                      onChange={(e) => {
                        const steps = [...content.process.steps];
                        steps[i] = { ...steps[i], label: e.target.value };
                        setContent((prev) => ({ ...prev, process: { ...prev.process, steps } }));
                      }}
                      placeholder={def?.label ?? ''}
                    />
                  </label>
                  <label>
                    Description
                    <AdminTextArea
                      rows={2}
                      value={step.description}
                      onChange={(value) => {
                        const steps = [...content.process.steps];
                        steps[i] = { ...steps[i], description: value };
                        setContent((prev) => ({ ...prev, process: { ...prev.process, steps } }));
                      }}
                      placeholder={def?.description ?? ''}
                    />
                  </label>
                </div>
              );
            })}
          </>
        );

      case 'chips-and-drip':
        return (
          <>
            <label>
              Section heading
              <input
                value={content.chipsAndDrip.heading}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    chipsAndDrip: { ...prev.chipsAndDrip, heading: e.target.value },
                  }))
                }
                placeholder={defChips?.heading ?? ''}
              />
            </label>
            <label>
              Body copy
              <AdminRichText
                minRows={5}
                value={content.chipsAndDrip.body}
                onChange={(value) =>
                  setContent((prev) => ({
                    ...prev,
                    chipsAndDrip: { ...prev.chipsAndDrip, body: value },
                  }))
                }
                placeholder={defChips?.body ?? ''}
              />
            </label>
            <GallerySlidesEditor
              title="Training gallery slides (rotating)"
              slides={content.chipsAndDrip.slides}
              busy={busy}
              onChange={(slides) =>
                setContent((prev) => ({
                  ...prev,
                  chipsAndDrip: { ...prev.chipsAndDrip, slides },
                }))
              }
              onUpload={(file, onUrl) => void uploadImage('landing-chips-slide', file, onUrl)}
            />
          </>
        );

      case 'camps':
        return (
          <>
            <label>
              Section heading
              <input
                value={content.campsExposure.heading}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    campsExposure: { ...prev.campsExposure, heading: e.target.value },
                  }))
                }
                placeholder={defCamps?.heading ?? ''}
              />
            </label>
            <label>
              Body copy
              <AdminRichText
                minRows={5}
                value={content.campsExposure.body}
                onChange={(value) =>
                  setContent((prev) => ({
                    ...prev,
                    campsExposure: { ...prev.campsExposure, body: value },
                  }))
                }
                placeholder={defCamps?.body ?? ''}
              />
            </label>
            <label>
              Dashboard / exposure image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    void uploadImage('landing-camps', file, (url) =>
                      setContent((prev) => ({
                        ...prev,
                        campsExposure: { ...prev.campsExposure, dashboardImageUrl: url },
                      })),
                    );
                  }
                }}
              />
            </label>
            <MediaLibraryPicker
              onPick={(url) =>
                setContent((prev) => ({
                  ...prev,
                  campsExposure: { ...prev.campsExposure, dashboardImageUrl: url },
                }))
              }
            />
            {(content.campsExposure.dashboardImageUrl || defCamps?.dashboardImage) && (
              <img
                className="landing-editor-preview"
                src={content.campsExposure.dashboardImageUrl || defCamps?.dashboardImage}
                alt="Camps dashboard preview"
              />
            )}
            <p className="landing-editor-note">
              Dashboard image is the static side image. The rotating camp carousel is managed below.
            </p>
            <GallerySlidesEditor
              title="Camps & exposure slides (rotating)"
              slides={content.campsExposure.slides}
              busy={busy}
              onChange={(slides) =>
                setContent((prev) => ({
                  ...prev,
                  campsExposure: { ...prev.campsExposure, slides },
                }))
              }
              onUpload={(file, onUrl) => void uploadImage('landing-camps-slide', file, onUrl)}
            />
          </>
        );

      case 'results':
        return (
          <>
            <label>
              Section heading
              <input
                value={content.results.heading}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    results: { ...prev.results, heading: e.target.value },
                  }))
                }
                placeholder={defResults?.heading ?? ''}
              />
            </label>
            <label>
              Subheading
              <AdminTextArea
                rows={2}
                value={content.results.subheading}
                onChange={(value) =>
                  setContent((prev) => ({
                    ...prev,
                    results: { ...prev.results, subheading: value },
                  }))
                }
                placeholder={defResults?.subheading ?? ''}
              />
            </label>
            <div className="landing-editor-subsection">
              <h3>Stats</h3>
              {content.results.stats.map((stat, i) => {
                const def = defResults?.stats[i];
                return (
                  <div key={i} className="landing-editor-stat-row">
                    <label>
                      Value {i + 1}
                      <input
                        value={stat.value}
                        onChange={(e) => {
                          const stats = [...content.results.stats];
                          stats[i] = { ...stats[i], value: e.target.value };
                          setContent((prev) => ({ ...prev, results: { ...prev.results, stats } }));
                        }}
                        placeholder={def?.value ?? ''}
                      />
                    </label>
                    <label>
                      Label {i + 1}
                      <input
                        value={stat.label}
                        onChange={(e) => {
                          const stats = [...content.results.stats];
                          stats[i] = { ...stats[i], label: e.target.value };
                          setContent((prev) => ({ ...prev, results: { ...prev.results, stats } }));
                        }}
                        placeholder={def?.label ?? ''}
                      />
                    </label>
                  </div>
                );
              })}
            </div>
            {[0, 1, 2].map((i) => {
              const proof = content.results.proofs[i];
              const def = defResults?.proofs[i];
              return (
                <div key={i} className="landing-editor-subsection">
                  <h3>Proof card {i + 1}</h3>
                  <label>
                    Athlete name
                    <input
                      value={proof?.athleteName ?? ''}
                      onChange={(e) => {
                        const proofs = [...content.results.proofs];
                        proofs[i] = { ...proofs[i], athleteName: e.target.value };
                        setContent((prev) => ({ ...prev, results: { ...prev.results, proofs } }));
                      }}
                      placeholder={def?.athleteName ?? ''}
                    />
                  </label>
                  <label>
                    Caption
                    <input
                      value={proof?.caption ?? ''}
                      onChange={(e) => {
                        const proofs = [...content.results.proofs];
                        proofs[i] = { ...proofs[i], caption: e.target.value };
                        setContent((prev) => ({ ...prev, results: { ...prev.results, proofs } }));
                      }}
                      placeholder={def?.caption ?? ''}
                    />
                  </label>
                  <label>
                    Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          void uploadImage('landing-proof', file, (url) => {
                            const proofs = [...content.results.proofs];
                            proofs[i] = { ...proofs[i], imageUrl: url };
                            setContent((prev) => ({ ...prev, results: { ...prev.results, proofs } }));
                          });
                        }
                      }}
                    />
                  </label>
                  <MediaLibraryPicker
                    label="Pick photo from gallery"
                    onPick={(url) => {
                      const proofs = [...content.results.proofs];
                      proofs[i] = { ...proofs[i], imageUrl: url };
                      setContent((prev) => ({ ...prev, results: { ...prev.results, proofs } }));
                    }}
                  />
                  {(proof?.imageUrl || def?.image) && (
                    <img
                      className="landing-editor-preview landing-editor-preview--thumb"
                      src={proof?.imageUrl || def?.image}
                      alt={def?.athleteName ?? `Proof ${i + 1}`}
                    />
                  )}
                </div>
              );
            })}
          </>
        );

      case 'apply':
        return (
          <>
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
          </>
        );

      case 'contact':
        return (
          <>
            <label>
              About line
              <AdminRichText
                minRows={2}
                value={content.footer.about}
                onChange={(value) =>
                  setContent((prev) => ({
                    ...prev,
                    footer: { ...prev.footer, about: value },
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
          </>
        );

      default:
        return null;
    }
  }

  return (
    <div className={`landing-editor${showPreview ? '' : ' landing-editor--form-focus'}`}>
      {!storageConfigured && (
        <p className="landing-editor-warn">
          Storage is not configured on this environment. Saves will fail until Vercel Blob is enabled.
        </p>
      )}

      <div className="landing-editor-banner">
        <strong>How to edit:</strong> choose a section on the left, change the fields in the middle, then{' '}
        <strong>Save changes</strong>. The Live preview panel is read-only — it does not open an editor.
        Photo gallery:{' '}
        <a href="/admin?tab=media-library">Admin → Images</a>.
      </div>

      <div className="landing-editor-layout">
        <nav className="landing-editor-nav" aria-label="Homepage sections">
          {LANDING_EDITOR_SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`landing-editor-nav-item${activeSection === section.id ? ' is-active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </nav>

        <div className="landing-editor-form-pane">
          <section className="landing-editor-section">
            <h2>{activeMeta.label}</h2>
            <p className="landing-editor-section-desc">{activeMeta.description}</p>
            {renderSectionFields()}
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
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => setShowPreview((v) => !v)}
            >
              {showPreview ? 'Hide live preview' : 'Show live preview'}
            </button>
            {showPreview && (
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => scrollPreviewToSection(activeMeta.hash)}
              >
                Jump preview to section
              </button>
            )}
            <a
              className="admin-btn admin-btn-secondary"
              href={`/${activeMeta.hash.startsWith('#') ? activeMeta.hash : `#${activeMeta.hash}`}`}
              target="_blank"
              rel="noreferrer"
            >
              Open section on live site
            </a>
          </div>

          <p className="landing-editor-hint">
            After you edit fields, click <strong>Save changes</strong> to publish. Then refresh the public
            homepage (or Show live preview) to confirm. Named photos live in the Images library until you
            pick them into a section here.
          </p>
        </div>

        {showPreview && (
          <div className="landing-editor-preview-pane">
            <div className="landing-editor-preview-head">
              <strong>Live preview (read-only)</strong>
              <span>{activeMeta.label}</span>
            </div>
            <iframe
              ref={previewRef}
              className="landing-editor-iframe"
              src="/"
              title="Homepage preview"
              onLoad={() => scrollPreviewToSection(activeMeta.hash)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
