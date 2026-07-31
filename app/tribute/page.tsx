import '../landing.css';
import Link from 'next/link';
import RotatingImagePanel from '@/app/components/RotatingImagePanel';
import { tributeSurface } from '@/lib/surface-editor/registry';
import { getEditableSurfaceDocument } from '@/lib/surface-editor/store';

/** George Raveling tribute — moved off homepage per EA Landing Page Chassis™. */
export const dynamic = 'force-dynamic';

export default async function TributePage() {
  const document = await getEditableSurfaceDocument(tributeSurface);
  const { hero, message } = document.content;
  const sections = document.sections.filter((section) => section.visible).sort((a, b) => a.order - b.order);
  const slides = message.slides.map((slide) => ({ img: slide.imageUrl, caption: slide.caption, objectPosition: slide.objectPosition }));

  return (
    <main className="subpage">
      {sections.map((section) => section.id === 'hero' ? <section className="subpage-hero" key={section.id}>
        <div className="container">
          <p className="display" style={{ letterSpacing: '2px', color: '#C9C9C9', marginBottom: 8 }}>
            {hero.eyebrow}
          </p>
          <h1 className="display">{hero.title}</h1>
          <p>{hero.description}</p>
          <Link href="/" className="subpage-back">← BACK TO HOME</Link>
        </div>
      </section> : section.id === 'message' ? <section className="section" style={{ background: 'var(--dark)', color: '#fff' }} key={section.id}>
        <div className="container tribute-grid">
          <div>
            {message.paragraphs.map((line) => (
              <p key={line} style={{ fontSize: 16, lineHeight: 1.75, fontStyle: 'italic', color: '#E8E8E8' }}>
                {line}
              </p>
            ))}
            <p className="display" style={{ marginTop: 20, color: '#C9C9C9' }}>
              {message.signature}
            </p>
          </div>
          <RotatingImagePanel slides={slides} intervalMs={5500} />
        </div>
      </section> : null)}
    </main>
  );
}
