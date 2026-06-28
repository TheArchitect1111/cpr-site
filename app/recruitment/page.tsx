import '../landing.css';
import Link from 'next/link';
import { site } from '@/config/site';

export const metadata = {
  title: 'Recruitment | CPR Global Prospects',
};

export default function RecruitmentPage() {
  return (
    <main className="subpage">
      <section className="subpage-hero">
        <div className="container">
          <h1 className="display">Recruitment</h1>
          <p>
            CPR helps student-athletes prepare, build their profile, gain exposure, and connect
            with coaches and Athletic Directors throughout North America.
          </p>
          <Link href="/" className="subpage-back">BACK TO HOME</Link>
        </div>
      </section>
      <section className="section">
        <div className="container spotlight-grid">
          <div>
            <h2 className="display">Finding opportunity. Building futures.</h2>
            <p className="lc-lead">
              Recruitment support includes profile building, coach outreach, guidance for families,
              exposure strategy, and ongoing support as athletes navigate the journey to the next level.
            </p>
            <a className="btn" href={site.links.apply}>Apply Now</a>
          </div>
          <img src="/dashboard.png" alt="CPR recruiting dashboard" className="lc-portal-shot" />
        </div>
      </section>
    </main>
  );
}
