'use client';

import { useCallback, useEffect, useState } from 'react';

type Slide = { img: string; caption?: string };

export default function RotatingImagePanel({
  slides,
  intervalMs = 5000,
  showArrows = false,
  className = '',
}: {
  slides: Slide[];
  intervalMs?: number;
  showArrows?: boolean;
  className?: string;
}) {
  const [idx, setIdx] = useState(0);

  const go = useCallback(
    (next: number) => {
      if (slides.length <= 1) return;
      setIdx(((next % slides.length) + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIdx((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [slides.length, intervalMs]);

  const safeIdx = slides.length ? ((idx % slides.length) + slides.length) % slides.length : 0;
  const active = slides[safeIdx];

  if (!slides.length) return null;

  return (
    <div className={`rotate-panel${className ? ` ${className}` : ''}`}>
      <div className="rotate-frame">
        {slides.map((slide, i) => (
          <img
            key={`${slide.img}-${i}`}
            src={slide.img}
            alt={slide.caption || 'CPR athlete'}
            className={`rotate-img${i === safeIdx ? ' active' : ''}`}
          />
        ))}
        {showArrows && slides.length > 1 && (
          <>
            <button
              type="button"
              className="rotate-arrow rotate-arrow-prev"
              aria-label="Previous image"
              onClick={() => go(idx - 1)}
            >
              ‹
            </button>
            <button
              type="button"
              className="rotate-arrow rotate-arrow-next"
              aria-label="Next image"
              onClick={() => go(idx + 1)}
            >
              ›
            </button>
          </>
        )}
      </div>
      {active?.caption && <p className="rotate-cap">{active.caption}</p>}
      {slides.length > 1 && (
        <div className="dots">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={i === safeIdx ? 'on' : ''}
              aria-label={`Show image ${i + 1} of ${slides.length}`}
              aria-current={i === safeIdx ? 'true' : undefined}
              onClick={() => setIdx(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
