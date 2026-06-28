'use client';

import { useCallback, useMemo, useState } from 'react';
import type { CollectionDef, CollectionItem, FieldDef } from '@/lib/admin-collections-schema';
import './admin-collection.css';

type AthleteOption = { label: string; value: string };

function emptyDraft(def: CollectionDef): Record<string, string> {
  const draft: Record<string, string> = {};
  for (const field of def.fields) draft[field.key] = '';
  return draft;
}

export default function AdminCollection({
  def,
  initialItems,
  athleteOptions,
  live,
}: {
  def: CollectionDef;
  initialItems: CollectionItem[];
  athleteOptions: AthleteOption[];
  live: boolean;
}) {
  const [items, setItems] = useState<CollectionItem[]>(initialItems);
  const [draft, setDraft] = useState<Record<string, string>>(() => emptyDraft(def));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');

  const api = `/api/admin/collections/${def.id}`;

  const resetForm = useCallback(() => {
    setDraft(emptyDraft(def));
    setEditingId(null);
  }, [def]);

  const setField = (key: string, value: string) => setDraft((d) => ({ ...d, [key]: value }));

  const uploadFile = async (key: string, file: File) => {
    setBusy(true);
    setMessage('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('kind', def.id);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      setField(key, json.url);
      setMessage('File uploaded. Remember to Save.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    const missing = def.fields.find((f) => f.required && !String(draft[f.key] || '').trim());
    if (missing) {
      setMessage(`${missing.label} is required.`);
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch(editingId ? `${api}/${editingId}` : api, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Save failed');
      const saved = json.item as CollectionItem;
      setItems((prev) =>
        editingId ? prev.map((it) => (it.id === editingId ? saved : it)) : [saved, ...prev],
      );
      setMessage(editingId ? `${def.singular} updated.` : `${def.singular} added.`);
      resetForm();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (item: CollectionItem) => {
    const next = emptyDraft(def);
    for (const field of def.fields) next[field.key] = String(item[field.key] ?? '');
    setDraft(next);
    setEditingId(item.id);
    setMessage('');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (item: CollectionItem) => {
    const title = String(item[def.titleField] || 'this item');
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch(`${api}/${item.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Delete failed');
      setItems((prev) => prev.filter((it) => it.id !== item.id));
      if (editingId === item.id) resetForm();
      setMessage(`${def.singular} deleted.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not delete.');
    } finally {
      setBusy(false);
    }
  };

  const copyTemplate = async (item: CollectionItem) => {
    const text = [item.subject ? `Subject: ${item.subject}` : '', String(item.body || '')]
      .filter(Boolean)
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      setMessage('Template copied to clipboard.');
    } catch {
      setMessage('Copy failed — open the entry and copy manually.');
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      def.fields.some((f) => String(item[f.key] || '').toLowerCase().includes(q)),
    );
  }, [items, query, def.fields]);

  const renderField = (field: FieldDef) => {
    const value = draft[field.key] ?? '';
    if (field.type === 'textarea') {
      return (
        <textarea
          value={value}
          rows={field.key === 'body' ? 6 : 3}
          placeholder={field.placeholder}
          onChange={(e) => setField(field.key, e.target.value)}
        />
      );
    }
    if (field.type === 'select') {
      return (
        <select value={value} onChange={(e) => setField(field.key, e.target.value)}>
          <option value="">— Select —</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }
    if (field.type === 'athlete') {
      return (
        <input
          list={`athletes-${def.id}`}
          value={value}
          placeholder="Athlete name"
          onChange={(e) => setField(field.key, e.target.value)}
        />
      );
    }
    if (field.type === 'file') {
      return (
        <div className="ac-file">
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadFile(field.key, file);
            }}
          />
          {value && (
            <a href={value} target="_blank" rel="noopener noreferrer" className="ac-file-link">
              View current file
            </a>
          )}
        </div>
      );
    }
    return (
      <input
        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => setField(field.key, e.target.value)}
      />
    );
  };

  return (
    <div className="ac">
      <header className="ahead ahead-compact">
        <div>
          <h1 className="display">{def.label.toUpperCase()}</h1>
          <p>{def.description}</p>
        </div>
        <a className="admin-logout" href="/api/admin/logout">Sign Out</a>
        {!live && <span className="demo-pill">Storage not configured · connect Vercel Blob to save</span>}
      </header>

      {message && <p className="ac-message">{message}</p>}

      <datalist id={`athletes-${def.id}`}>
        {athleteOptions.map((a) => (
          <option key={a.value} value={a.label} />
        ))}
      </datalist>

      <section className="ac-form-card">
        <h2 className="ac-form-title">{editingId ? `Edit ${def.singular}` : `Add ${def.singular}`}</h2>
        <div className="ac-form-grid">
          {def.fields.map((field) => (
            <label
              key={field.key}
              className={field.type === 'textarea' ? 'ac-field ac-field-wide' : 'ac-field'}
            >
              <span>
                {field.label}
                {field.required && <em className="ac-req"> *</em>}
              </span>
              {renderField(field)}
              {field.hint && <small className="ac-hint">{field.hint}</small>}
            </label>
          ))}
        </div>
        <div className="ac-form-actions">
          <button className="ac-primary" onClick={submit} disabled={busy}>
            {busy ? 'Saving…' : editingId ? `Update ${def.singular}` : `Add ${def.singular}`}
          </button>
          {editingId && (
            <button className="ac-secondary" onClick={resetForm} disabled={busy}>
              Cancel
            </button>
          )}
        </div>
      </section>

      <div className="ac-list-head">
        <span className="ac-count">{filtered.length} {filtered.length === 1 ? def.singular.toLowerCase() : `${def.singular.toLowerCase()}s`}</span>
        <input
          className="ac-search"
          value={query}
          placeholder="Search…"
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <ul className="ac-list">
        {filtered.length === 0 && (
          <li className="ac-empty">No entries yet. Add your first {def.singular.toLowerCase()} above.</li>
        )}
        {filtered.map((item) => {
          const subtitle = def.subtitleFields
            .map((k) => String(item[k] || '').trim())
            .filter(Boolean)
            .join(' · ');
          const status = def.statusField ? String(item[def.statusField] || '').trim() : '';
          return (
            <li key={item.id} className="ac-row">
              <div className="ac-row-main">
                <div className="ac-row-title">
                  {String(item[def.titleField] || '(untitled)')}
                  {status && <span className="ac-pill">{status}</span>}
                </div>
                {subtitle && <div className="ac-row-sub">{subtitle}</div>}
              </div>
              <div className="ac-row-actions">
                {def.id === 'email-templates' && (
                  <button className="ac-link" onClick={() => copyTemplate(item)}>Copy</button>
                )}
                {typeof item.fileUrl === 'string' && item.fileUrl && (
                  <a className="ac-link" href={item.fileUrl} target="_blank" rel="noopener noreferrer">File</a>
                )}
                <button className="ac-link" onClick={() => startEdit(item)}>Edit</button>
                <button className="ac-link ac-danger" onClick={() => remove(item)} disabled={busy}>Delete</button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
