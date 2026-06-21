import '../landing.css';
import Link from 'next/link';
import { site } from '@/config/site';
import RotatingImagePanel from '@/app/components/RotatingImagePanel';

export default function CampsPage() {
  const c = site.camps;
  return (
    <main className="subpage">
      <section className="subpage-hero">
        <div className="container">
          <h1 className="display">{c.eyebrow}</h1>
          <p>{c.sub}</p>
          <Link href="/" className="subpage-back">← BACK TO HOME</Link>
        </div>
      </section>
      <section className="section">
        <div className="container spotlight-grid">
          <div>
            <h2 className="display">
              {c.heading[0]}
              <span style={{ color: 'var(--red)' }}>{c.heading[1]}</span>
              {c.heading[2]}
            </h2>
            <a className="btn" href={site.links.apply} style={{ marginTop: 24 }}>
              {c.cta}
            </a>
          </div>
          <RotatingImagePanel slides={c.slides} />
        </div>
      </section>
    </main>
  );
}
