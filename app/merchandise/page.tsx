import '../landing.css';
import Link from 'next/link';
import { site } from '@/config/site';

export default function MerchandisePage() {
  const m = site.merchandise;
  return (
    <main className="subpage">
      <section className="subpage-hero">
        <div className="container">
          <h1 className="display">{m.heading}</h1>
          <p>{m.sub}</p>
          <Link href="/" className="subpage-back">← BACK TO HOME</Link>
        </div>
      </section>
      <section className="section">
        <div className="container merch-grid">
          <div>
            <p>{m.note}</p>
            <p style={{ marginTop: 16, fontWeight: 700 }}>CPR Hoodies · CPR T-Shirts · More coming soon.</p>
          </div>
          <img src={m.image} alt="CPR merchandise" style={{ width: '100%', borderRadius: 8, height: 320, objectFit: 'cover' }} />
        </div>
      </section>
    </main>
  );
}
