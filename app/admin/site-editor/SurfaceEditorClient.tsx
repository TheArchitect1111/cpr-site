'use client';

import { useMemo, useState } from 'react';
import type { EditableSurfaceDocument, EditableSurfaceManifest } from '@/lib/surface-editor/types';
import { getAtPath, setAtPath } from '@/lib/surface-editor/path';
import '../admin.css';
import './site-editor.css';

type SurfacePayload = {
  manifest: EditableSurfaceManifest;
  document: EditableSurfaceDocument;
};

function labelFor(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/^./, (letter) => letter.toUpperCase());
}

function isLongText(key: string, value: string) {
  return value.length > 100 || /body|copy|description|intro|message|quote|note|caption|sub/i.test(key);
}

function isImageField(key: string) {
  return /image|photo|portrait|logo/i.test(key) && !/alt/i.test(key);
}

function ValueEditor({
  fieldKey,
  value,
  onChange,
  onUpload,
}: {
  fieldKey: string;
  value: unknown;
  onChange: (value: unknown) => void;
  onUpload: (file: File, done: (url: string) => void) => void;
}) {
  if (Array.isArray(value)) {
    return (
      <fieldset className="surface-array">
        <legend>{labelFor(fieldKey)}</legend>
        {value.map((item, index) => (
          <div className="surface-array-item" key={`${fieldKey}-${index}`}>
            <div className="surface-array-toolbar">
              <strong>{labelFor(fieldKey)} {index + 1}</strong>
              <span>
                <button type="button" disabled={index === 0} onClick={() => {
                  const next = [...value];
                  [next[index - 1], next[index]] = [next[index], next[index - 1]];
                  onChange(next);
                }}>Move up</button>
                <button type="button" disabled={index === value.length - 1} onClick={() => {
                  const next = [...value];
                  [next[index], next[index + 1]] = [next[index + 1], next[index]];
                  onChange(next);
                }}>Move down</button>
                <button type="button" onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}>Delete</button>
              </span>
            </div>
            <ValueEditor
              fieldKey={`${fieldKey} item`}
              value={item}
              onChange={(nextItem) => onChange(value.map((entry, itemIndex) => itemIndex === index ? nextItem : entry))}
              onUpload={onUpload}
            />
          </div>
        ))}
        <button type="button" className="surface-add" onClick={() => {
          const sample = value[0];
          if (sample && typeof sample === 'object' && !Array.isArray(sample)) {
            onChange([...value, Object.fromEntries(Object.keys(sample as Record<string, unknown>).map((key) => [key, '']))]);
          } else {
            onChange([...value, '']);
          }
        }}>Add {labelFor(fieldKey).replace(/s$/, '')}</button>
      </fieldset>
    );
  }

  if (value && typeof value === 'object') {
    return (
      <div className="surface-object">
        {Object.entries(value as Record<string, unknown>).map(([key, child]) => (
          <ValueEditor
            key={key}
            fieldKey={key}
            value={child}
            onChange={(nextChild) => onChange({ ...(value as Record<string, unknown>), [key]: nextChild })}
            onUpload={onUpload}
          />
        ))}
      </div>
    );
  }

  if (typeof value === 'boolean') {
    return <label className="surface-check"><input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} /> {labelFor(fieldKey)}</label>;
  }

  const text = String(value ?? '');
  return (
    <label className="surface-field">
      <span>{labelFor(fieldKey)}</span>
      {isLongText(fieldKey, text) ? (
        <textarea rows={4} value={text} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input value={text} onChange={(event) => onChange(event.target.value)} />
      )}
      {isImageField(fieldKey) && (
        <span className="surface-upload">
          <input type="file" accept="image/*" onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onUpload(file, (url) => onChange(url));
          }} />
          {text && <img src={text} alt="Current selection" />}
        </span>
      )}
    </label>
  );
}

export default function SurfaceEditorClient({ surfaces }: { surfaces: SurfacePayload[] }) {
  const [surfaceId, setSurfaceId] = useState(surfaces[0]?.manifest.id ?? '');
  const [documents, setDocuments] = useState(() => Object.fromEntries(surfaces.map((item) => [item.manifest.id, item.document])));
  const [activeSection, setActiveSection] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const selected = surfaces.find((item) => item.manifest.id === surfaceId) ?? surfaces[0];
  const document = selected ? documents[selected.manifest.id] : undefined;
  const orderedSections = useMemo(() => {
    if (!selected || !document) return [];
    return [...selected.manifest.sections].sort((a, b) => {
      const aOrder = document.sections.find((item) => item.id === a.id)?.order ?? 0;
      const bOrder = document.sections.find((item) => item.id === b.id)?.order ?? 0;
      return aOrder - bOrder;
    });
  }, [selected, document]);
  const section = orderedSections.find((item) => item.id === activeSection) ?? orderedSections[0];

  if (!selected || !document || !section) return <p>No editable pages are registered.</p>;
  const activeSurface = selected;
  const activeDocument = document;

  function updateDocument(next: EditableSurfaceDocument) {
    setDocuments((current) => ({ ...current, [activeSurface.manifest.id]: next }));
  }

  function moveSection(sectionId: string, direction: -1 | 1) {
    const sections = [...activeDocument.sections].sort((a, b) => a.order - b.order);
    const index = sections.findIndex((item) => item.id === sectionId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= sections.length) return;
    [sections[index], sections[target]] = [sections[target], sections[index]];
    updateDocument({ ...activeDocument, sections: sections.map((item, order) => ({ ...item, order })) });
  }

  async function upload(file: File, done: (url: string) => void) {
    setBusy(true);
    setMessage('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('kind', `surface-${activeSurface.manifest.id}`);
      const response = await fetch('/api/upload', { method: 'POST', body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Upload failed.');
      done(result.url);
      setMessage('Image uploaded. Save changes to publish it.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`/api/portal-admin/surfaces/${activeSurface.manifest.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: activeDocument.content, sections: activeDocument.sections }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Save failed.');
      updateDocument(result.document);
      setMessage(`${activeSurface.manifest.label} updated.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed.');
    } finally {
      setBusy(false);
    }
  }

  const sectionState = activeDocument.sections.find((item) => item.id === section.id);
  const sectionValue = getAtPath(activeDocument.content, section.contentPath);

  return (
    <div className="surface-editor">
      <div className="surface-page-tabs" role="tablist" aria-label="Editable pages">
        <a className="surface-home-tab" href="/admin/landing">Homepage</a>
        {surfaces.map((item) => (
          <button key={item.manifest.id} className={item.manifest.id === selected.manifest.id ? 'active' : ''} onClick={() => {
            setSurfaceId(item.manifest.id);
            setActiveSection(item.manifest.sections[0]?.id ?? '');
            setMessage('');
          }}>{item.manifest.label}</button>
        ))}
      </div>
      <div className="surface-meta">
        <div><span>{selected.manifest.kind}</span><h2>{selected.manifest.label}</h2><p>{selected.manifest.description}</p></div>
        <a href={selected.manifest.route} target="_blank" rel="noreferrer">Open page</a>
      </div>
      <div className="surface-workspace">
        <aside className="surface-sections">
          {orderedSections.map((item, index) => {
            const state = activeDocument.sections.find((entry) => entry.id === item.id);
            return (
              <div className={`surface-section-row${item.id === section.id ? ' active' : ''}`} key={item.id}>
                <button className="surface-section-name" onClick={() => setActiveSection(item.id)}>{item.label}</button>
                {!item.protected && <label title="Show or hide section"><input type="checkbox" checked={state?.visible !== false} onChange={(event) => updateDocument({ ...activeDocument, sections: activeDocument.sections.map((entry) => entry.id === item.id ? { ...entry, visible: event.target.checked } : entry) })} /> Show</label>}
                <button aria-label={`Move ${item.label} up`} disabled={index === 0} onClick={() => moveSection(item.id, -1)}>↑</button>
                <button aria-label={`Move ${item.label} down`} disabled={index === orderedSections.length - 1} onClick={() => moveSection(item.id, 1)}>↓</button>
              </div>
            );
          })}
        </aside>
        <section className="surface-fields">
          <p className="admin-kicker">{section.label}</p>
          <h3>{section.label}</h3>
          <p>{section.description}</p>
          {section.protected ? <div className="surface-protected">This section contains protected functionality and cannot be edited.</div> : (
            <ValueEditor fieldKey={section.id} value={sectionValue} onChange={(value) => updateDocument({ ...activeDocument, content: setAtPath(activeDocument.content, section.contentPath, value) })} onUpload={upload} />
          )}
          <div className="surface-actions">
            <button className="btn" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save changes'}</button>
            <a href={selected.manifest.route} target="_blank" rel="noreferrer">Preview page</a>
          </div>
          {message && <p className="surface-message" role="status">{message}</p>}
          {sectionState?.visible === false && <p className="surface-hidden-note">This section is currently hidden from the public page.</p>}
        </section>
      </div>
    </div>
  );
}
