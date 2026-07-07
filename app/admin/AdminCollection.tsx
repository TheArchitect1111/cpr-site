'use client';

import { useCallback, useMemo, useState } from 'react';
import type { CollectionDef, CollectionItem, FieldDef } from '@/lib/admin-collections-schema';
import './admin-collection.css';

function ChassisButton({
  children,
  variant,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'link' | 'danger';
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button type="button" className={`ea-button ${variant ?? 'secondary'}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function ChassisCollectionFormCard({ children }: { children: React.ReactNode }) {
  return <section className="ac-form-card">{children}</section>;
}

function ChassisCollectionFormTitle({ children }: { children: React.ReactNode }) {
  return <h2>{children}</h2>;
}

function ChassisCollectionFormGrid({ children }: { children: React.ReactNode }) {
  return <div className="ac-form-grid">{children}</div>;
}

function ChassisCollectionField({ label, required, hint, wide, children }: { label: string; required?: boolean; hint?: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={wide ? 'ac-field wide' : 'ac-field'}>
      <span>{label}{required ? ' *' : ''}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

function ChassisCollectionActions({ children }: { children: React.ReactNode }) {
  return <div className="ac-actions">{children}</div>;
}

function ChassisCollectionListHead({ children }: { children: React.ReactNode }) {
  return <div className="ac-list-head">{children}</div>;
}

function ChassisCollectionCount({ children }: { children: React.ReactNode }) {
  return <strong>{children}</strong>;
}

function ChassisSearchInput({ value, placeholder, onChange }: { value: string; placeholder: string; onChange: (event: React.ChangeEvent<HTMLInputElement>) => void }) {
  return <input type="search" value={value} placeholder={placeholder} onChange={onChange} />;
}

function ChassisCollectionList({ children }: { children: React.ReactNode }) {
  return <ul className="ac-list">{children}</ul>;
}

function ChassisEmptyState({ children }: { variant?: string; as?: 'li'; children: React.ReactNode }) {
  return <li className="ea-empty-state">{children}</li>;
}

function ChassisCollectionCard({ children }: { children: React.ReactNode }) {
  return <li className="ac-card">{children}</li>;
}

function ChassisCollectionTitle({ title, badge }: { title: string; badge?: string }) {
  return <h3>{title}{badge && <span>{badge}</span>}</h3>;
}

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
  showHeader = true,
}: {
  def: CollectionDef;
  initialItems: CollectionItem[];
  athleteOptions: AthleteOption[];
  live: boolean;
  showHeader?: boolean;
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
      setMessage('File uploaded. Save update to keep it.');
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
      setMessage(editingId ? `${def.singular} improved.` : `${def.singular} created as a next step.`);
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
    if (!window.confirm(`Remove "${title}" from the active view? This cannot be undone.`)) return;
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch(`${api}/${item.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Delete failed');
      setItems((prev) => prev.filter((it) => it.id !== item.id));
      if (editingId === item.id) resetForm();
      setMessage(`${def.singular} removed from the active view.`);
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
      {showHeader && (
      <header className="ahead ahead-compact">
        <div>
          <h1 className="display">{def.label.toUpperCase()}</h1>
          <p>{def.description}</p>
        </div>
        <a className="admin-logout" href="/api/admin/logout">Sign Out</a>
        {!live && <span className="demo-pill">Publishing setup needed before updates can be saved</span>}
      </header>
      )}

      {message && <p className="ac-message">{message}</p>}

      <datalist id={`athletes-${def.id}`}>
        {athleteOptions.map((a) => (
          <option key={a.value} value={a.label} />
        ))}
      </datalist>

      <ChassisCollectionFormCard>
        <ChassisCollectionFormTitle>{editingId ? `Improve ${def.singular}` : `Create next ${def.singular.toLowerCase()}`}</ChassisCollectionFormTitle>
        <ChassisCollectionFormGrid>
          {def.fields.map((field) => (
            <ChassisCollectionField
              key={field.key}
              label={field.label}
              required={field.required}
              hint={field.hint}
              wide={field.type === 'textarea'}
            >
              {renderField(field)}
            </ChassisCollectionField>
          ))}
        </ChassisCollectionFormGrid>
        <ChassisCollectionActions>
          <ChassisButton variant="primary" onClick={submit} disabled={busy}>
            {busy ? 'Saving decision…' : editingId ? 'Save decision' : 'Create next step'}
          </ChassisButton>
          {editingId && (
            <ChassisButton variant="secondary" onClick={resetForm} disabled={busy}>
              Cancel
            </ChassisButton>
          )}
        </ChassisCollectionActions>
      </ChassisCollectionFormCard>

      <ChassisCollectionListHead>
        <ChassisCollectionCount>{filtered.length} {filtered.length === 1 ? def.singular.toLowerCase() : `${def.singular.toLowerCase()}s`}</ChassisCollectionCount>
        <ChassisSearchInput
          value={query}
          placeholder="Find priority item…"
          onChange={(e) => setQuery(e.target.value)}
        />
      </ChassisCollectionListHead>

      <ChassisCollectionList>
        {filtered.length === 0 && (
          <ChassisEmptyState variant="collection" as="li">
            No action needed right now. Recommended next step: create a {def.singular.toLowerCase()} only if it supports a current owner decision.
          </ChassisEmptyState>
        )}
        {filtered.map((item) => {
          const subtitle = def.subtitleFields
            .map((k) => String(item[k] || '').trim())
            .filter(Boolean)
            .join(' · ');
          const status = def.statusField ? String(item[def.statusField] || '').trim() : '';
          return (
            <ChassisCollectionCard key={item.id}>
              <div className="ac-row-main">
                <ChassisCollectionTitle title={String(item[def.titleField] || '(untitled)')} badge={status || undefined} />
                {subtitle && <div className="ac-row-sub">{subtitle}</div>}
              </div>
              <div className="ac-row-actions">
                {def.id === 'email-templates' && (
                  <ChassisButton variant="link" onClick={() => copyTemplate(item)}>Copy</ChassisButton>
                )}
                {typeof item.fileUrl === 'string' && item.fileUrl && (
                  <a className="ac-link" href={item.fileUrl} target="_blank" rel="noopener noreferrer">File</a>
                )}
                <ChassisButton variant="link" onClick={() => startEdit(item)}>Update details</ChassisButton>
                <ChassisButton variant="danger" onClick={() => remove(item)} disabled={busy}>Remove from active view</ChassisButton>
              </div>
            </ChassisCollectionCard>
          );
        })}
      </ChassisCollectionList>
    </div>
  );
}
