'use client';

import { useEffect, useState } from 'react';

type Slide = { img: string; caption?: string };

export default function RotatingImagePanel({
  slides,
  intervalMs = 3000,
}: {
  slides: Slide[];
  intervalMs?: number;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setIdx((i) => (i + 1) % slides.length), intervalMs);
    return () => clearInterval(timer);
  }, [slides.length, intervalMs]);

  const active = slides[idx];

  return (
    <div className="rotate-panel">
      <div className="rotate-frame">
        {slides.map((slide, i) => (
          <img
            key={slide.img}
            src={slide.img}
            alt={slide.caption || 'CPR athlete'}
            className={`rotate-img${i === idx ? ' active' : ''}`}
          />
        ))}
      </div>
      {active?.caption && <p className="rotate-cap">{active.caption}</p>}
      {slides.length > 1 && (
        <div className="dots">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={i === idx ? 'on' : ''}
              aria-label={`Show image ${i + 1} of ${slides.length}`}
              aria-current={i === idx ? 'true' : undefined}
              onClick={() => setIdx(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
