'use client';

import { useState } from 'react';
import type { Resource } from '@/lib/sections-data';

const TYPE_ICONS: Record<string, string> = {
  Video: '▶',
  PDF: 'PDF',
  Article: 'A',
  Link: '&#8599;',
};

interface Props {
  resources: Resource[];
}

export default function ResourceLibrary({ resources }: Props) {
  const types = ['All', ...Array.from(new Set(resources.map((r) => r.type).filter(Boolean))).sort()];
  const categories = ['All', ...Array.from(new Set(resources.map((r) => r.category).filter(Boolean))).sort()];

  const [typeFilter, setTypeFilter] = useState('All');
  const [catFilter, setCatFilter] = useState('All');

  const filtered = resources.filter((r) => {
    if (typeFilter !== 'All' && r.type !== typeFilter) return false;
    if (catFilter !== 'All' && r.category !== catFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="sec-card">
        <div className="sec-label">ALL RESOURCES</div>
        <h1 className="sec-heading">Resource Library</h1>
        <p className="sec-sub">Videos, articles, PDFs, and links curated for your recruiting journey.</p>

        <div className="rl-filters">
          <div className="rl-filter-group">
            <div className="rl-filter-label">Type</div>
            <div className="filter-tabs" style={{ marginBottom: 0 }}>
              {types.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`filter-tab${typeFilter === t ? ' active' : ''}`}
                  onClick={() => setTypeFilter(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          {categories.length > 2 && (
            <div className="rl-filter-group">
              <div className="rl-filter-label">Category</div>
              <div className="filter-tabs" style={{ marginBottom: 0 }}>
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`filter-tab${catFilter === c ? ' active' : ''}`}
                    onClick={() => setCatFilter(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="sec-empty">
            <div className="sec-empty-icon">&#128194;</div>
            <p>No resources match this filter.</p>
          </div>
        ) : (
          <div className="rl-list">
            {filtered.map((r) => {
              const icon = TYPE_ICONS[r.type] ?? r.type.slice(0, 3).toUpperCase();
              const hasLink = r.url && r.url !== '#';
              return (
                <div key={r.id} className="rl-item">
                  <div className="rl-type-icon" aria-hidden="true">
                    {icon}
                  </div>
                  <div className="rl-item-body">
                    <div className="rl-item-title">{r.title}</div>
                    {r.description && <p className="rl-item-desc">{r.description}</p>}
                    <div className="rl-item-meta">
                      <span className="rl-type-badge">{r.type}</span>
                      {r.category && <span className="rl-cat-badge">{r.category}</span>}
                    </div>
                  </div>
                  {hasLink && (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rl-item-link"
                    >
                      Open &#8594;
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
