import '../landing.css';
import Link from 'next/link';
import { resourcesSurface } from '@/lib/surface-editor/registry';
import { getEditableSurfaceDocument } from '@/lib/surface-editor/store';

export const metadata = {
  title: 'Resources | CPR Global Prospects',
};

const NORTH_AMERICAN_FEE_AGREEMENT =
  'https://docs.google.com/forms/d/e/1FAIpQLSexOTZti6lP_scn4Igt9wwTmxpA3J2csHYaQ0JMGtTp82Zb5Q/viewform';

function external(href: string) {
  return href.startsWith('http') ? { target: '_blank' as const, rel: 'noopener noreferrer' as const } : {};
}

export const dynamic = 'force-dynamic';

export default async function ResourcesPage() {
  const document = await getEditableSurfaceDocument(resourcesSurface);
  const { hero } = document.content;
  const cards = document.content.cards.map((card) =>
    card.title === 'North America Fee Agreement'
      ? { ...card, url: NORTH_AMERICAN_FEE_AGREEMENT }
      : card,
  );
  const sections = document.sections.filter((section) => section.visible).sort((a, b) => a.order - b.order);
  return (
    <main className="subpage">
      {sections.map((section) => section.id === 'hero' ? <section className="subpage-hero" key={section.id}>
        <div className="container">
          <h1 className="display">{hero.title}</h1>
          <p>{hero.description}</p>
          <Link href="/" className="subpage-back">BACK TO HOME</Link>
        </div>
      </section> : section.id === 'cards' ? <section className="section" key={section.id}>
        <div className="container">
          <div className="lc-cards">
            {cards.map((card) => <a className="lc-card" href={card.url} {...external(card.url)} key={`${card.title}-${card.url}`}><h3 className="display">{card.title}</h3><p>{card.description}</p></a>)}
          </div>
        </div>
      </section> : null)}
    </main>
  );
}
