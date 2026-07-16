'use client';

import { useMemo, useState } from 'react';
import type { LandingContent } from '@/lib/landing-content';
import type {
  CollectionDef,
  CollectionId,
  CollectionItem,
  FieldDef,
} from '@/lib/admin-collections-schema';
import { OptimisticSaveBadge, useOptimisticSave } from '@/lib/instant-feel';
import AdminTextArea from '../components/AdminTextArea';
import AdminRichText from '../components/AdminRichText';
import './update-portal.css';

type AthleteOption = { label: string; value: string };
type CollectionPayload = {
  def: CollectionDef;
  items: CollectionItem[];
};

const OWNER_COLLECTIONS: CollectionId[] = [
  'site-updates',
  'site-events',
  'site-quotes',
  'media-library',
  'site-text',
];

function emptyDraft(def: CollectionDef): Record<string, string> {
  const draft: Record<string, string> = {};
  for (const field of def.fields) draft[field.key] = '';
  return draft;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function isPublished(item: CollectionItem) {
  const status = String(item.status || '').toLowerCase();
  return status === 'published' || status === 'featured';
}

export default function AdminUpdatePortal({
  landing,
  collections,
  athleteOptions,
  storageConfigured,
}: {
  landing: LandingContent;
  collections: CollectionPayload[];
  athleteOptions: AthleteOption[];
  storageConfigured: boolean;
}) {
  const collectionMap = useMemo(
    () => new Map(collections.map((collection) => [collection.def.id, collection])),
    [collections],
  );
  const [active, setActive] = useState<CollectionId>('site-events');
  const activeCollection = collectionMap.get(active) ?? collections[0];

  const [landingDraft, setLandingDraft] = useState(landing);
  const [landingMessage, setLandingMessage] = useState('');
  const landingSave = useOptimisticSave();

  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annAudience, setAnnAudience] = useState('All');
  const [annEmail, setAnnEmail] = useState(false);
  const [annPinned, setAnnPinned] = useState(true);
  const [annMessage, setAnnMessage] = useState('');
  const [busy, setBusy] = useState('');

  const [itemsByCollection, setItemsByCollection] = useState<Record<string, CollectionItem[]>>(() =>
    Object.fromEntries(collections.map((collection) => [collection.def.id, collection.items])),
  );
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>(() =>
    Object.fromEntries(collections.map((collection) => [collection.def.id, emptyDraft(collection.def)])),
  );
  const [editingByCollection, setEditingByCollection] = useState<Record<string, string | null>>({});
  const [collectionMessage, setCollectionMessage] = useState('');
  const [query, setQuery] = useState('');

  const totalItems = collections.reduce((sum, collection) => sum + collection.items.length, 0);
  const publishedItems = collections.reduce(
    (sum, collection) => sum + collection.items.filter(isPublished).length,
    0,
  );
  const futureEvents = (itemsByCollection['site-events'] || []).filter((item) => {
    const date = String(item.date || '');
    return isPublished(item) && (!date || date >= todayIso());
  }).length;
  const featuredQuotes = (itemsByCollection['site-quotes'] || []).filter((item) =>
    String(item.status || '').toLowerCase() === 'featured',
  ).length;

  function patchLanding(path: 'possibility' | 'about' | 'socialProof' | 'finalCta' | 'footer', key: string, value: string) {
    setLandingDraft((prev) => ({
      ...prev,
      [path]: { ...prev[path], [key]: value },
    }));
  }

  function patchAboutPoint(index: number, value: string) {
    setLandingDraft((prev) => {
      const points = [...prev.about.points];
      points[index] = value;
      return { ...prev, about: { ...prev.about, points } };
    });
  }

  async function uploadLandingImage(file: File, target: 'hero' | 'quote') {
    setBusy(target === 'hero' ? 'landing-hero' : 'landing-quote');
    setLandingMessage('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('kind', target === 'hero' ? 'landing-hero' : 'landing-quote');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      if (target === 'hero') patchLanding('possibility', 'imageUrl', json.url);
      else patchLanding('socialProof', 'photoUrl', json.url);
      setLandingMessage('Image uploaded. Save changes to publish it.');
    } catch (error) {
      setLandingMessage(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setBusy('');
    }
  }

  async function saveLanding() {
    setLandingMessage('');
    await landingSave.run(async () => {
      const res = await fetch('/api/portal-admin/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(landingDraft),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Save failed');
      setLandingDraft(json.content);
      setLandingMessage('Homepage updated.');
    });
  }

  async function publishAnnouncement() {
    if (!annTitle.trim() || !annBody.trim()) {
      setAnnMessage('Add a title and message first.');
      return;
    }
    setBusy('announcement');
    setAnnMessage('');
    try {
      const channels = ['Portal', annEmail && 'Email'].filter(Boolean);
      const res = await fetch('/api/admin/communication/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: annTitle,
          body: annBody,
          audience: annAudience,
          channels,
          pinned: annPinned,
          publishNow: true,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not publish announcement');
      setAnnTitle('');
      setAnnBody('');
      setAnnMessage('Announcement published.');
    } catch (error) {
      setAnnMessage(error instanceof Error ? error.message : 'Could not publish announcement.');
    } finally {
      setBusy('');
    }
  }

  function setDraftField(collectionId: string, key: string, value: string) {
    setDrafts((prev) => ({
      ...prev,
      [collectionId]: { ...(prev[collectionId] || {}), [key]: value },
    }));
  }

  async function uploadCollectionFile(def: CollectionDef, key: string, file: File) {
    setBusy(`${def.id}-upload`);
    setCollectionMessage('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('kind', def.id);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      setDraftField(def.id, key, json.url);
      setCollectionMessage('File uploaded. Save the item to keep it.');
    } catch (error) {
      setCollectionMessage(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setBusy('');
    }
  }

  async function saveItem(def: CollectionDef) {
    const draft = drafts[def.id] || emptyDraft(def);
    const missing = def.fields.find((field) => field.required && !String(draft[field.key] || '').trim());
    if (missing) {
      setCollectionMessage(`${missing.label} is required.`);
      return;
    }
    const editingId = editingByCollection[def.id];
    setBusy(`${def.id}-save`);
    setCollectionMessage('');
    try {
      const res = await fetch(
        editingId ? `/api/admin/collections/${def.id}/${editingId}` : `/api/admin/collections/${def.id}`,
        {
          method: editingId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draft),
        },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Save failed');
      const saved = json.item as CollectionItem;
      setItemsByCollection((prev) => ({
        ...prev,
        [def.id]: editingId
          ? (prev[def.id] || []).map((item) => (item.id === editingId ? saved : item))
          : [saved, ...(prev[def.id] || [])],
      }));
      setDrafts((prev) => ({ ...prev, [def.id]: emptyDraft(def) }));
      setEditingByCollection((prev) => ({ ...prev, [def.id]: null }));
      setCollectionMessage(editingId ? `${def.singular} updated.` : `${def.singular} added.`);
    } catch (error) {
      setCollectionMessage(error instanceof Error ? error.message : 'Could not save item.');
    } finally {
      setBusy('');
    }
  }

  function startEdit(def: CollectionDef, item: CollectionItem) {
    const next = emptyDraft(def);
    for (const field of def.fields) next[field.key] = String(item[field.key] || '');
    setDrafts((prev) => ({ ...prev, [def.id]: next }));
    setEditingByCollection((prev) => ({ ...prev, [def.id]: item.id }));
    setCollectionMessage('');
  }

  async function deleteItem(def: CollectionDef, item: CollectionItem) {
    const title = String(item[def.titleField] || 'this item');
    if (!window.confirm(`Delete "${title}"?`)) return;
    setBusy(`${def.id}-delete`);
    setCollectionMessage('');
    try {
      const res = await fetch(`/api/admin/collections/${def.id}/${item.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Delete failed');
      setItemsByCollection((prev) => ({
        ...prev,
        [def.id]: (prev[def.id] || []).filter((row) => row.id !== item.id),
      }));
      setCollectionMessage(`${def.singular} deleted.`);
    } catch (error) {
      setCollectionMessage(error instanceof Error ? error.message : 'Could not delete item.');
    } finally {
      setBusy('');
    }
  }

  function renderField(def: CollectionDef, field: FieldDef) {
    const value = drafts[def.id]?.[field.key] || '';
    if (field.type === 'textarea') {
      if (field.key === 'body' || field.key === 'quote' || field.key === 'description') {
        return (
          <AdminRichText
            value={value}
            minRows={field.key === 'body' ? 7 : 4}
            placeholder={field.placeholder}
            onChange={(next) => setDraftField(def.id, field.key, next)}
          />
        );
      }
      return (
        <AdminTextArea
          value={value}
          rows={field.key === 'body' ? 7 : 4}
          placeholder={field.placeholder}
          onChange={(next) => setDraftField(def.id, field.key, next)}
        />
      );
    }
    if (field.type === 'select') {
      return (
        <select value={value} onChange={(e) => setDraftField(def.id, field.key, e.target.value)}>
          <option value="">Select</option>
          {field.options?.map((option) => <option key={option}>{option}</option>)}
        </select>
      );
    }
    if (field.type === 'athlete') {
      return (
        <>
          <input list={`upd-athletes-${def.id}`} value={value} onChange={(e) => setDraftField(def.id, field.key, e.target.value)} />
          <datalist id={`upd-athletes-${def.id}`}>
            {athleteOptions.map((athlete) => <option key={athlete.value} value={athlete.label} />)}
          </datalist>
        </>
      );
    }
    if (field.type === 'file') {
      return (
        <div className="up-file">
          <input type="file" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadCollectionFile(def, field.key, file);
          }} />
          {value && <a href={value} target="_blank" rel="noopener noreferrer">View file</a>}
        </div>
      );
    }
    return (
      <input
        type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => setDraftField(def.id, field.key, e.target.value)}
      />
    );
  }

  const activeItems = (itemsByCollection[activeCollection.def.id] || []).filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return activeCollection.def.fields.some((field) =>
      String(item[field.key] || '').toLowerCase().includes(q),
    );
  });

  return (
    <div className="up">
      <section className="up-hero">
        <div>
          <p className="up-kicker">Owner update portal</p>
          <h1 className="display">Keep CPR current from one place.</h1>
          <p>Publish announcements, refresh homepage copy, manage events, curate quotes, upload images, and keep reusable site text organized.</p>
        </div>
        <div className="up-score">
          <span>{storageConfigured ? 'Live storage' : 'Storage missing'}</span>
          <strong>{publishedItems}/{totalItems}</strong>
          <small>published items</small>
        </div>
      </section>

      <section className="up-metrics">
        <div><span>Upcoming events</span><strong>{futureEvents}</strong></div>
        <div><span>Featured quotes</span><strong>{featuredQuotes}</strong></div>
        <div><span>Media assets</span><strong>{itemsByCollection['media-library']?.length || 0}</strong></div>
        <div><span>Text blocks</span><strong>{itemsByCollection['site-text']?.length || 0}</strong></div>
      </section>

      <section className="up-grid">
        <article className="up-panel up-home">
          <div className="up-panel-head">
            <div>
              <p className="up-label">Website</p>
              <h2>Homepage spotlight</h2>
            </div>
            <a href="/" target="_blank" rel="noreferrer">Preview</a>
          </div>
          {landingMessage && <p className="up-message">{landingMessage}</p>}
          <div className="up-form-grid">
            <label>Announcement banner<input value={landingDraft.possibility.announcement} onChange={(e) => patchLanding('possibility', 'announcement', e.target.value)} /></label>
            <label>Hero headline<input value={landingDraft.possibility.headline} onChange={(e) => patchLanding('possibility', 'headline', e.target.value)} /></label>
            <label className="wide">Hero supporting text<AdminRichText value={landingDraft.possibility.supporting} onChange={(value) => patchLanding('possibility', 'supporting', value)} minRows={3} /></label>
            <label>Hero image<input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadLandingImage(file, 'hero'); }} /></label>
            <label>Featured quote photo<input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadLandingImage(file, 'quote'); }} /></label>
            <label className="wide">Featured quote<AdminRichText value={landingDraft.socialProof.quote} onChange={(value) => patchLanding('socialProof', 'quote', value)} minRows={4} /></label>
            <label>Quote name<input value={landingDraft.socialProof.name} onChange={(e) => patchLanding('socialProof', 'name', e.target.value)} /></label>
            <label>Quote role<input value={landingDraft.socialProof.role} onChange={(e) => patchLanding('socialProof', 'role', e.target.value)} /></label>
            {[0, 1, 2].map((index) => (
              <label key={index}>About point {index + 1}<input value={landingDraft.about.points[index] || ''} onChange={(e) => patchAboutPoint(index, e.target.value)} /></label>
            ))}
          </div>
          <div className="up-actions">
            <button onClick={() => void saveLanding()} disabled={landingSave.status === 'saving' || Boolean(busy)}>
              {landingSave.status === 'saving' ? 'Saving...' : 'Save homepage'}
            </button>
            <OptimisticSaveBadge status={landingSave.status} error={landingSave.error} />
          </div>
        </article>

        <article className="up-panel up-ann">
          <div className="up-panel-head">
            <div>
              <p className="up-label">Broadcast</p>
              <h2>Publish an announcement</h2>
            </div>
            <a href="/admin?tab=communication">All announcements</a>
          </div>
          {annMessage && <p className="up-message">{annMessage}</p>}
          <label>Title<input value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} placeholder="What changed?" /></label>
          <label>Message<AdminRichText value={annBody} onChange={setAnnBody} placeholder="Keep it short, useful, and timely." minRows={6} /></label>
          <div className="up-form-grid compact">
            <label>Audience<select value={annAudience} onChange={(e) => setAnnAudience(e.target.value)}>{['All', 'Families', 'Athletes', 'Parents', 'Coaches'].map((option) => <option key={option}>{option}</option>)}</select></label>
            <label className="up-check"><input type="checkbox" checked={annPinned} onChange={(e) => setAnnPinned(e.target.checked)} /> Pin it</label>
            <label className="up-check"><input type="checkbox" checked={annEmail} onChange={(e) => setAnnEmail(e.target.checked)} /> Also email</label>
          </div>
          <button className="up-primary" onClick={() => void publishAnnouncement()} disabled={busy === 'announcement'}>
            {busy === 'announcement' ? 'Publishing...' : 'Publish announcement'}
          </button>
        </article>
      </section>

      <section className="up-panel">
        <div className="up-panel-head">
          <div>
            <p className="up-label">Content library</p>
            <h2>Edit, change, delete, and upload</h2>
          </div>
          <input className="up-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search this library" />
        </div>

        <div className="up-tabs">
          {OWNER_COLLECTIONS.map((id) => {
            const collection = collectionMap.get(id);
            if (!collection) return null;
            return (
              <button key={id} className={active === id ? 'active' : ''} onClick={() => {
                setActive(id);
                setCollectionMessage('');
                setQuery('');
              }}>
                {collection.def.label}
              </button>
            );
          })}
        </div>

        {collectionMessage && <p className="up-message">{collectionMessage}</p>}

        <div className="up-library">
          <div className="up-editor">
            <h3>{editingByCollection[activeCollection.def.id] ? `Edit ${activeCollection.def.singular}` : `Add ${activeCollection.def.singular}`}</h3>
            <p>{activeCollection.def.description}</p>
            <div className="up-form-grid">
              {activeCollection.def.fields.map((field) => (
                <label key={field.key} className={field.type === 'textarea' ? 'wide' : ''}>
                  {field.label}{field.required && <em> *</em>}
                  {renderField(activeCollection.def, field)}
                  {field.hint && <small>{field.hint}</small>}
                </label>
              ))}
            </div>
            <div className="up-actions">
              <button onClick={() => void saveItem(activeCollection.def)} disabled={busy.endsWith('-save')}>
                {busy.endsWith('-save') ? 'Saving...' : editingByCollection[activeCollection.def.id] ? 'Update item' : 'Add item'}
              </button>
              {editingByCollection[activeCollection.def.id] && (
                <button className="secondary" onClick={() => {
                  setDrafts((prev) => ({ ...prev, [activeCollection.def.id]: emptyDraft(activeCollection.def) }));
                  setEditingByCollection((prev) => ({ ...prev, [activeCollection.def.id]: null }));
                }}>
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="up-list">
            {activeItems.length === 0 && <p className="up-empty">No items yet. Add the first one here.</p>}
            {activeItems.map((item) => {
              const title = String(item[activeCollection.def.titleField] || '(untitled)');
              const subtitle = activeCollection.def.subtitleFields
                .map((key) => String(item[key] || '').trim())
                .filter(Boolean)
                .join(' - ');
              const status = activeCollection.def.statusField ? String(item[activeCollection.def.statusField] || '') : '';
              const fileUrl = String(item.fileUrl || item.imageUrl || item.photoUrl || '');
              return (
                <article key={item.id} className="up-item">
                  <div>
                    <strong>{title}</strong>
                    {subtitle && <span>{subtitle}</span>}
                    {status && <em>{status}</em>}
                  </div>
                  <div className="up-item-actions">
                    {fileUrl && (
                      <a href={fileUrl} target="_blank" rel="noopener noreferrer">View</a>
                    )}
                    <button onClick={() => startEdit(activeCollection.def, item)}>Edit</button>
                    <button className="danger" onClick={() => void deleteItem(activeCollection.def, item)}>Delete</button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
