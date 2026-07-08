import '../landing.css';
import Link from 'next/link';
import { site } from '@/config/site';

export const metadata = {
  title: 'Resources | CPR Global Prospects',
};

export default function ResourcesPage() {
  return (
    <main className="subpage">
      <section className="subpage-hero">
        <div className="container">
          <h1 className="display">Resources</h1>
          <p>
            Helpful links, forms, profile access, and CPR tools for student-athletes and families.
          </p>
          <Link href="/" className="subpage-back">BACK TO HOME</Link>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="lc-cards">
            <a className="lc-card" href={site.links.apply}>
              <h3 className="display">Application</h3>
              <p>Start the CPR journey and share the information needed for next steps.</p>
            </a>
            <a className="lc-card" href={site.links.standardAgreement}>
              <h3 className="display">Standard Fee Agreement</h3>
              <p>Review and complete the standard CPR fee agreement.</p>
            </a>
            <a className="lc-card" href={site.links.internationalAgreement}>
              <h3 className="display">International Fee Agreement</h3>
              <p>Review and complete the international fee agreement.</p>
            </a>
            <a className="lc-card" href="/athletes/jayden-thompson">
              <h3 className="display">Sample Profile</h3>
              <p>View the sample recruiting profile experience.</p>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
