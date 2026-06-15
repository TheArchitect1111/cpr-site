'use client';

import { useState } from 'react';
import type { Resource } from '@/lib/sections-data';

function toEmbedUrl(url: string): string {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  return url;
}

function isEmbeddable(url: string): boolean {
  return url.includes('youtube.com/embed') || url.includes('youtu.be') || url.includes('vimeo.com');
}

interface Props {
  resources: Resource[];
}

export default function VideoLearningCenter({ resources }: Props) {
  const videos = resources.filter((r) => r.type === 'Video');
  const categories = ['All', ...Array.from(new Set(videos.map((r) => r.category).filter(Boolean))).sort()];
  const [cat, setCat] = useState('All');

  const filtered = cat === 'All' ? videos : videos.filter((r) => r.category === cat);

  return (
    <div>
      <div className="sec-card">
        <div className="sec-label">VIDEO LIBRARY</div>
        <h1 className="sec-heading">Video Learning Center</h1>
        <p className="sec-sub">Coach-curated videos covering film, recruiting, eligibility, and more.</p>

        {categories.length > 1 && (
          <div className="filter-tabs">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className={`filter-tab${cat === c ? ' active' : ''}`}
                onClick={() => setCat(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="sec-empty">
            <div className="sec-empty-icon">&#127916;</div>
            <p>No videos in this category yet. Check back soon.</p>
          </div>
        ) : (
          <div className="vid-grid">
            {filtered.map((v) => {
              const embedUrl = toEmbedUrl(v.url);
              const canEmbed = isEmbeddable(v.url) || v.url.includes('embed');
              return (
                <div key={v.id} className="vid-card">
                  <div className="vid-thumb">
                    {canEmbed ? (
                      <iframe
                        src={embedUrl}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={v.title}
                      />
                    ) : v.thumbnail ? (
                      <img
                        src={v.thumbnail}
                        alt={v.title}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="vid-thumb-placeholder">&#9654;</div>
                    )}
                  </div>
                  <div className="vid-info">
                    <div className="vid-title">{v.title}</div>
                    <div className="vid-meta">
                      {v.category && <span className="vid-cat">{v.category}</span>}
                      {!canEmbed && v.url && v.url !== '#' && (
                        <a href={v.url} target="_blank" rel="noopener noreferrer" className="vid-link">
                          Watch &#8594;
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
