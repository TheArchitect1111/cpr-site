import '../landing.css';
import Link from 'next/link';
import RotatingImagePanel from '@/app/components/RotatingImagePanel';
import { campsSurface } from '@/lib/surface-editor/registry';
import { getEditableSurfaceDocument } from '@/lib/surface-editor/store';
import { listCollection } from '@/lib/admin-collections';
import RichTextContent from '@/app/components/RichTextContent';
import { campIsFull } from '@/lib/camp-registration';

export const dynamic = 'force-dynamic';

export default async function CampsPage() {
  const [document, campItems] = await Promise.all([
    getEditableSurfaceDocument(campsSurface),
    listCollection('camps'),
  ]);
  const publishedCamps = campItems
    .filter((camp) => camp.status === 'Published' || camp.status === 'Registration Closed')
    .sort((a, b) => String(a.startDate || '').localeCompare(String(b.startDate || '')));
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
      {publishedCamps.length > 0 && (
        <section className="section" aria-labelledby="upcoming-camps-title">
          <div className="container">
            <h2 id="upcoming-camps-title" className="display">UPCOMING CAMPS</h2>
            <div className="camp-list" style={{ display: 'grid', gap: 24, marginTop: 28 }}>
              {publishedCamps.map((camp) => {
                const full = campIsFull(camp as never, Number(camp.registeredCount || 0));
                const external = Boolean(camp.registrationUrl)
                  && (camp.registrationMode === 'External' || !camp.registrationMode);
                const registrationOpen = camp.status === 'Published' && !full;
                const registrationHref = external ? String(camp.registrationUrl) : `/camps/${encodeURIComponent(camp.id)}/register`;
                return (
                  <article className="camp-card" key={camp.id} style={{ border: '1px solid rgba(15,15,15,.14)', borderRadius: 18, padding: 24 }}>
                    <p className="eyebrow">{String(camp.status)}</p>
                    <h3 className="display">{String(camp.name)}</h3>
                    <p>{[camp.startDate, camp.endDate, camp.location].filter(Boolean).map(String).join(' · ')}</p>
                    <p>{[camp.ageGroup, camp.price].filter(Boolean).map(String).join(' · ')}</p>
                    <RichTextContent html={String(camp.description || '')} />
                    {registrationOpen ? (
                      <a className="btn" href={registrationHref} style={{ marginTop: 18 }}>REGISTER NOW</a>
                    ) : (
                      <p style={{ marginTop: 18, fontWeight: 700 }}>Registration is currently closed.</p>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
