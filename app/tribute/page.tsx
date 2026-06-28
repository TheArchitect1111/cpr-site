import '../landing.css';
import Link from 'next/link';
import { site } from '@/config/site';
import RotatingImagePanel from '@/app/components/RotatingImagePanel';

/** George Raveling tribute — moved off homepage per EA Landing Page Chassis™. */
export default function TributePage() {
  const t = site.tribute;
  const slides = t.slides
    .filter((slide) => !slide.img.includes('bill-russell') && !slide.img.includes('real-youth') && !slide.img.includes('coaching-youth'))
    .map((slide) => ({ img: slide.img }));

  return (
    <main className="subpage">
      <section className="subpage-hero">
        <div className="container">
          <p className="display" style={{ letterSpacing: '2px', color: '#C9C9C9', marginBottom: 8 }}>
            {t.eyebrow}
          </p>
          <h1 className="display">{t.name}</h1>
          <p>{t.meta}</p>
          <Link href="/" className="subpage-back">← BACK TO HOME</Link>
        </div>
      </section>
      <section className="section" style={{ background: 'var(--dark)', color: '#fff' }}>
        <div className="container tribute-grid">
          <div>
            {t.message.map((line) => (
              <p key={line} style={{ fontSize: 16, lineHeight: 1.75, fontStyle: 'italic', color: '#E8E8E8' }}>
                {line}
              </p>
            ))}
            <p className="display" style={{ marginTop: 20, color: '#C9C9C9' }}>
              {t.sign}
            </p>
          </div>
          <RotatingImagePanel slides={slides} intervalMs={5500} />
        </div>
      </section>
    </main>
  );
}
