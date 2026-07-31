import '../landing.css';
import Link from 'next/link';
import { recruitmentSurface } from '@/lib/surface-editor/registry';
import { getEditableSurfaceDocument } from '@/lib/surface-editor/store';

export const metadata = {
  title: 'Recruitment | CPR Global Prospects',
};

export const dynamic = 'force-dynamic';

export default async function RecruitmentPage() {
  const document = await getEditableSurfaceDocument(recruitmentSurface);
  const { hero, overview } = document.content;
  const sections = document.sections.filter((section) => section.visible).sort((a, b) => a.order - b.order);
  return (
    <main className="subpage">
      {sections.map((section) => section.id === 'hero' ? <section className="subpage-hero" key={section.id}>
        <div className="container">
          <h1 className="display">{hero.title}</h1>
          <p>{hero.description}</p>
          <Link href="/" className="subpage-back">BACK TO HOME</Link>
        </div>
      </section> : section.id === 'overview' ? <section className="section" key={section.id}>
        <div className="container spotlight-grid">
          <div>
            <h2 className="display">{overview.heading}</h2>
            <p className="lc-lead">{overview.body}</p>
            <a className="btn" href={overview.ctaUrl}>{overview.ctaLabel}</a>
          </div>
          <img src={overview.imageUrl} alt={overview.imageAlt} className="lc-portal-shot" />
        </div>
      </section> : null)}
    </main>
  );
}
