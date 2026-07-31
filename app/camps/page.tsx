import '../landing.css';
import Link from 'next/link';
import RotatingImagePanel from '@/app/components/RotatingImagePanel';
import { campsSurface } from '@/lib/surface-editor/registry';
import { getEditableSurfaceDocument } from '@/lib/surface-editor/store';

export const dynamic = 'force-dynamic';

export default async function CampsPage() {
  const document = await getEditableSurfaceDocument(campsSurface);
  const { hero, spotlight, houseLeague } = document.content;
  const sections = document.sections.filter((section) => section.visible).sort((a, b) => a.order - b.order);
  return (
    <main className="subpage">
      {sections.map((section) => section.id === 'hero' ? <section className="subpage-hero" key={section.id}>
        <div className="container">
          <h1 className="display">{hero.title}</h1>
          <p>{hero.description}</p>
          <Link href="/" className="subpage-back">← BACK TO HOME</Link>
        </div>
      </section> : section.id === 'spotlight' ? <section className="section" key={section.id}>
        <div className="container spotlight-grid">
          <div>
            <h2 className="display">{spotlight.heading}</h2>
            <a className="btn" href={spotlight.ctaUrl} style={{ marginTop: 24 }}>
              {spotlight.ctaLabel}
            </a>
          </div>
          <RotatingImagePanel slides={spotlight.slides.map((slide) => ({ img: slide.imageUrl, caption: slide.caption, objectPosition: slide.objectPosition }))} />
        </div>
      </section> : section.id === 'house-league' ? <section className="section" id="house-league" key={section.id}>
        <div className="container">
          <h2 className="display">{houseLeague.heading}</h2>
          <p className="lc-lead">{houseLeague.body}</p>
        </div>
      </section> : null)}
    </main>
  );
}
