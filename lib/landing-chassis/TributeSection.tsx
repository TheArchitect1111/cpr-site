'use client';

import RotatingImagePanel from '@/app/components/RotatingImagePanel';
import type { LandingPageConfig } from './types';

type Props = {
  tribute: NonNullable<LandingPageConfig['tribute']>;
};

export function TributeSection({ tribute }: Props) {
  return (
    <section className="lc-section lc-tribute" id="tribute">
      <div className="lc-container lc-tribute-grid">
        <div className="lc-tribute-copy">
          <p className="lc-tribute-eyebrow display">{tribute.eyebrow}</p>
          <h2 className="display lc-tribute-name">{tribute.name}</h2>
          <p className="lc-tribute-meta">{tribute.meta}</p>
          {tribute.message.map((line) => (
            <p key={line} className="lc-tribute-line">
              {line}
            </p>
          ))}
          <p className="lc-tribute-sign display">{tribute.sign}</p>
        </div>
        <RotatingImagePanel slides={tribute.slides.map((s) => ({ img: s.img }))} intervalMs={5500} />
      </div>
    </section>
  );
}
