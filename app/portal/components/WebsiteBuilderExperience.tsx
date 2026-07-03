'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';

type Device = 'desktop' | 'tablet' | 'phone';
type SectionKind = 'hero' | 'story' | 'gallery' | 'testimonials' | 'events' | 'stats' | 'cta' | 'faq';

type WebsiteSection = {
  id: string;
  kind: SectionKind;
  name: string;
  headline: string;
  subheadline: string;
  image?: string;
  buttonText?: string;
  buttonLink?: string;
  hidden?: boolean;
  items?: string[];
};

const initialSections: WebsiteSection[] = [
  {
    id: 'hero',
    kind: 'hero',
    name: 'Hero Section',
    headline: 'Canadian Prospects Recruitment',
    subheadline:
      'Showcase athletes, camps, commitments, training, and recruiting updates from one live visual editor.',
    image: '/hero-athlete.png',
    buttonText: 'Apply Now',
    buttonLink: '/apply',
  },
  {
    id: 'story',
    kind: 'story',
    name: 'Text Block',
    headline: 'A site the CPR team can keep current',
    subheadline:
      'Tap the exact headline, photo, event, testimonial, or call to action you want to update. No CMS training required.',
    buttonText: 'View Athletes',
    buttonLink: '/athletes',
  },
  {
    id: 'gallery',
    kind: 'gallery',
    name: 'Image Gallery',
    headline: 'Camps, exposure, and real moments',
    subheadline: 'Keep the homepage fresh with recent photos from camps, games, showcases, and training.',
    image: '/galleries/camps-exposure/camp-03.jpg',
    items: ['Camp exposure', 'Skill development', 'Coach connections'],
  },
  {
    id: 'proof',
    kind: 'testimonials',
    name: 'Testimonials',
    headline: 'Families know where to look',
    subheadline:
      'Parents, athletes, and coaches can see the latest story without waiting for a developer to publish basic updates.',
    items: ['Commitments', 'Coach interest', 'Family updates'],
  },
  {
    id: 'cta',
    kind: 'cta',
    name: 'Call To Action',
    headline: 'Ready to publish the next update?',
    subheadline: 'Save as a draft, preview the site, then publish when the update is ready.',
    buttonText: 'Publish Update',
    buttonLink: '/admin',
  },
];

const sectionLibrary: { kind: SectionKind; name: string; image: string; summary: string }[] = [
  { kind: 'hero', name: 'Hero', image: '/hero-committed.jpg', summary: 'Large image, headline, and action' },
  { kind: 'story', name: 'Text Block', image: '/proof-canada.jpg', summary: 'Program story or announcement' },
  { kind: 'gallery', name: 'Image Gallery', image: '/galleries/camps-exposure/camp-06.jpg', summary: 'Camp and showcase photos' },
  { kind: 'testimonials', name: 'Testimonials', image: '/testi-1.png', summary: 'Family and athlete proof' },
  { kind: 'events', name: 'Upcoming Events', image: '/galleries/chips-and-drip/chips-03.jpg', summary: 'Camps, showcases, meetings' },
  { kind: 'stats', name: 'Statistics', image: '/proof-team.jpg', summary: 'Commitments and outcomes' },
  { kind: 'faq', name: 'FAQ', image: '/dashboard.png', summary: 'Common questions answered' },
  { kind: 'cta', name: 'Call To Action', image: '/cpr-logo.png', summary: 'One clear next step' },
];

const deviceWidths: Record<Device, string> = {
  desktop: '100%',
  tablet: '760px',
  phone: '390px',
};

function createSection(kind: SectionKind): WebsiteSection {
  const template = sectionLibrary.find((item) => item.kind === kind) ?? sectionLibrary[0];

  return {
    id: `${kind}-${Date.now()}`,
    kind,
    name: template.name,
    headline: `New ${template.name}`,
    subheadline: template.summary,
    image: template.image,
    buttonText: kind === 'hero' || kind === 'story' || kind === 'cta' ? 'Edit Button' : undefined,
    buttonLink: '/',
    items: kind === 'stats' ? ['200+ athletes supported', 'North America network', 'Year-round guidance'] : undefined,
  };
}

export default function WebsiteBuilderExperience({
  portalType,
  slug,
}: {
  portalType?: 'athlete' | 'parent';
  slug?: string;
}) {
  const [sections, setSections] = useState(initialSections);
  const [editMode, setEditMode] = useState(true);
  const [selectedId, setSelectedId] = useState(initialSections[0].id);
  const [device, setDevice] = useState<Device>('desktop');
  const [insertAfterId, setInsertAfterId] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [status, setStatus] = useState('Draft autosaved');

  const selected = useMemo(
    () => sections.find((section) => section.id === selectedId) ?? sections[0],
    [sections, selectedId],
  );
  const visibleSections = sections.filter((section) => !section.hidden);

  const portalLabel = portalType && slug ? `${portalType} portal / ${slug}` : 'CPR standard portal module';

  const updateSection = (id: string, updates: Partial<WebsiteSection>) => {
    setSections((current) =>
      current.map((section) => (section.id === id ? { ...section, ...updates } : section)),
    );
    setStatus('Draft autosaved');
  };

  const addSection = (kind: SectionKind) => {
    const next = createSection(kind);
    setSections((current) => {
      const index = current.findIndex((section) => section.id === insertAfterId);
      if (index < 0) return [...current, next];
      return [...current.slice(0, index + 1), next, ...current.slice(index + 1)];
    });
    setSelectedId(next.id);
    setLibraryOpen(false);
    setStatus('Draft autosaved');
  };

  const moveSection = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    setSections((current) => {
      const dragged = current.find((section) => section.id === draggedId);
      if (!dragged) return current;
      const rest = current.filter((section) => section.id !== draggedId);
      const index = rest.findIndex((section) => section.id === targetId);
      return [...rest.slice(0, index), dragged, ...rest.slice(index)];
    });
    setDraggedId(null);
    setStatus('Draft autosaved');
  };

  const duplicateSelected = () => {
    const copy = {
      ...selected,
      id: `${selected.id}-copy-${Date.now()}`,
      name: `${selected.name} Copy`,
    };
    setSections((current) => {
      const index = current.findIndex((section) => section.id === selected.id);
      return [...current.slice(0, index + 1), copy, ...current.slice(index + 1)];
    });
    setSelectedId(copy.id);
    setStatus('Draft autosaved');
  };

  const deleteSelected = () => {
    if (!window.confirm('Delete Section?')) return;
    setSections((current) => current.filter((section) => section.id !== selected.id));
    setSelectedId(sections.find((section) => section.id !== selected.id)?.id ?? '');
    setStatus('Draft autosaved');
  };

  return (
    <section className="wb-root">
      <div className="wb-toolbar">
        <div>
          <p className="wb-kicker">Website Builder</p>
          <h1>Live Visual Website Editor</h1>
          <p className="wb-context">{portalLabel}</p>
        </div>
        <div className="wb-actions">
          <div className="wb-device-switch" aria-label="Preview device">
            {(['desktop', 'tablet', 'phone'] as Device[]).map((option) => (
              <button
                key={option}
                type="button"
                className={device === option ? 'is-active' : ''}
                onClick={() => setDevice(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <button type="button" className="wb-mode" onClick={() => setEditMode((value) => !value)}>
            <span className={editMode ? 'is-on' : ''} />
            {editMode ? 'Edit Mode' : 'View Mode'}
          </button>
          <button type="button" className="wb-publish" onClick={() => setPublishOpen(true)}>
            Publish
          </button>
        </div>
      </div>

      <div className="wb-shell">
        <aside className="wb-side">
          <div className="wb-panel">
            <p className="wb-panel-label">Website Health</p>
            <div className="wb-score">94%</div>
            {['Design', 'Content', 'SEO', 'Accessibility', 'Performance', 'Freshness'].map((item, index) => (
              <button key={item} type="button" className="wb-health-row">
                <span>{item}</span>
                <strong>{96 - Math.min(index, 4)}</strong>
              </button>
            ))}
          </div>

          <div className="wb-panel">
            <p className="wb-panel-label">Recommendations</p>
            {[
              'Add a recent commitment story.',
              'Refresh the hero photo after the next camp.',
              'Add one parent testimonial.',
            ].map((item) => (
              <button key={item} type="button" className="wb-recommendation">
                {item}
              </button>
            ))}
          </div>

          {sections.some((section) => section.hidden) && (
            <div className="wb-panel">
              <p className="wb-panel-label">Hidden Sections</p>
              {sections
                .filter((section) => section.hidden)
                .map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    className="wb-recommendation"
                    onClick={() => updateSection(section.id, { hidden: false })}
                  >
                    Restore {section.name}
                  </button>
                ))}
            </div>
          )}
        </aside>

        <div className="wb-stage-wrap">
          <div className="wb-status">
            <strong>Live homepage canvas</strong>
            <span>{status}. Preview before publishing.</span>
          </div>
          <div className="wb-stage-scroll">
            <div className="wb-stage" style={{ maxWidth: deviceWidths[device] }}>
              {visibleSections.map((section) => (
                <div key={section.id}>
                  <EditableSection
                    section={section}
                    selected={selectedId === section.id}
                    editMode={editMode}
                    onSelect={() => setSelectedId(section.id)}
                    onUpdate={(updates) => updateSection(section.id, updates)}
                    onDragStart={() => setDraggedId(section.id)}
                    onDrop={() => moveSection(section.id)}
                  />
                  {editMode && (
                    <div className="wb-add-slot">
                      <button
                        type="button"
                        onClick={() => {
                          setInsertAfterId(section.id);
                          setLibraryOpen(true);
                        }}
                      >
                        + Add Section
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="wb-edit-panel">
          <div className="wb-edit-head">
            <div>
              <p className="wb-panel-label">Edit</p>
              <h2>{selected.name}</h2>
            </div>
            <button type="button" onClick={() => updateSection(selected.id, { hidden: true })}>
              Hide
            </button>
          </div>

          <Field
            label="Headline"
            value={selected.headline}
            onChange={(value) => updateSection(selected.id, { headline: value })}
          />
          <Field
            label="Subheadline"
            value={selected.subheadline}
            multiline
            onChange={(value) => updateSection(selected.id, { subheadline: value })}
          />
          {selected.buttonText !== undefined && (
            <>
              <Field
                label="Button Text"
                value={selected.buttonText}
                onChange={(value) => updateSection(selected.id, { buttonText: value })}
              />
              <Field
                label="Button Link"
                value={selected.buttonLink ?? ''}
                onChange={(value) => updateSection(selected.id, { buttonLink: value })}
              />
            </>
          )}
          {selected.image && (
            <div className="wb-image-tools">
              <p className="wb-panel-label">Image</p>
              <Image src={selected.image} alt="" width={640} height={360} />
              <div>
                <button type="button">Replace Image</button>
                <button type="button">Crop</button>
                <button type="button" onClick={() => updateSection(selected.id, { image: undefined })}>
                  Remove
                </button>
              </div>
            </div>
          )}

          <div className="wb-edit-grid">
            <button type="button" onClick={duplicateSelected}>
              Duplicate Section
            </button>
            <button type="button" className="danger" onClick={deleteSelected}>
              Delete Section
            </button>
            <button type="button" className="primary" onClick={() => setStatus('Saved just now')}>
              Save
            </button>
            <button type="button">Cancel</button>
          </div>
        </aside>
      </div>

      {libraryOpen && (
        <div className="wb-modal-backdrop" onClick={() => setLibraryOpen(false)}>
          <div className="wb-library" onClick={(event) => event.stopPropagation()}>
            <div className="wb-modal-head">
              <div>
                <p className="wb-kicker">Section Library</p>
                <h2>Add one section</h2>
              </div>
              <button type="button" onClick={() => setLibraryOpen(false)}>
                Close
              </button>
            </div>
            <div className="wb-library-grid">
              {sectionLibrary.map((item) => (
                <button key={item.name} type="button" onClick={() => addSection(item.kind)}>
                  <Image src={item.image} alt="" width={640} height={360} />
                  <strong>{item.name}</strong>
                  <span>{item.summary}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {publishOpen && (
        <div className="wb-modal-backdrop" onClick={() => setPublishOpen(false)}>
          <div className="wb-confirm" onClick={(event) => event.stopPropagation()}>
            <p className="wb-kicker">Publish</p>
            <h2>Publish this draft?</h2>
            <p>The live website will update and a version snapshot will be created.</p>
            <div>
              <button
                type="button"
                className="wb-publish"
                onClick={() => {
                  setPublishOpen(false);
                  setStatus('Published just now');
                }}
              >
                Publish
              </button>
              <button type="button" onClick={() => setPublishOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function EditableSection({
  section,
  selected,
  editMode,
  onSelect,
  onUpdate,
  onDragStart,
  onDrop,
}: {
  section: WebsiteSection;
  selected: boolean;
  editMode: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<WebsiteSection>) => void;
  onDragStart: () => void;
  onDrop: () => void;
}) {
  return (
    <section
      className={`wb-live-section ${section.kind === 'hero' ? 'wb-live-hero' : ''} ${
        selected ? 'is-selected' : ''
      } ${editMode ? 'is-editing' : ''}`}
      draggable={editMode}
      onDragStart={onDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      onClick={onSelect}
    >
      {editMode && <button className="wb-section-edit">Edit</button>}

      <div className="wb-section-copy">
        <p>{section.name}</p>
        <EditableText
          value={section.headline}
          editMode={editMode}
          className="wb-live-title"
          onChange={(value) => onUpdate({ headline: value })}
        />
        <EditableText
          value={section.subheadline}
          editMode={editMode}
          className="wb-live-copy"
          onChange={(value) => onUpdate({ subheadline: value })}
        />
        {section.items && (
          <div className="wb-live-items">
            {section.items.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        )}
        {section.buttonText && (
          <EditableText
            value={section.buttonText}
            editMode={editMode}
            className="wb-live-button"
            onChange={(value) => onUpdate({ buttonText: value })}
          />
        )}
      </div>

      {section.image && (
        <div className="wb-section-image">
          <Image src={section.image} alt="" fill sizes="(max-width: 900px) 100vw, 40vw" />
          {editMode && (
            <div className="wb-image-overlay">
              <button type="button">Replace Image</button>
              <button type="button">Crop</button>
              <button type="button">Remove</button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function EditableText({
  value,
  editMode,
  className,
  onChange,
}: {
  value: string;
  editMode: boolean;
  className: string;
  onChange: (value: string) => void;
}) {
  return (
    <span
      role={editMode ? 'textbox' : undefined}
      contentEditable={editMode}
      suppressContentEditableWarning
      className={className}
      onBlur={(event) => onChange(event.currentTarget.textContent ?? '')}
    >
      {value}
    </span>
  );
}

function Field({
  label,
  value,
  multiline,
  onChange,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="wb-field">
      <span>{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}
