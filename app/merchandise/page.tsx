import '../landing.css';
import Link from 'next/link';
import { merchandiseSurface } from '@/lib/surface-editor/registry';
import { getEditableSurfaceDocument } from '@/lib/surface-editor/store';

export const dynamic = 'force-dynamic';

export default async function MerchandisePage() {
  const document = await getEditableSurfaceDocument(merchandiseSurface);
  const { hero, products } = document.content;
  const sections = document.sections.filter((section) => section.visible).sort((a, b) => a.order - b.order);
  return (
    <main className="subpage">
      {sections.map((section) => section.id === 'hero' ? <section className="subpage-hero" key={section.id}>
        <div className="container">
          <h1 className="display">{hero.title}</h1>
          <p>{hero.description}</p>
          <Link href="/" className="subpage-back">← BACK TO HOME</Link>
        </div>
      </section> : section.id === 'products' ? <section className="section" key={section.id}>
        <div className="container merch-grid">
          <div>
            <p>{products.body}</p>
            <p style={{ marginTop: 16, fontWeight: 700 }}>{products.productLine}</p>
          </div>
          <img src={products.imageUrl} alt={products.imageAlt} style={{ width: '100%', borderRadius: 8, height: 320, objectFit: 'cover' }} />
        </div>
      </section> : null)}
    </main>
  );
}
