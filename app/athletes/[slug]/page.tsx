import '../../landing.css';
import './profile.css';
import { notFound } from 'next/navigation';
import { getAthlete, embedUrl } from '@/lib/athletes';
import { site } from '@/config/site';
import CoachInquiryModal from './CoachInquiryModal';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await getAthlete(slug);
  if (!a) return { title: 'Athlete Not Found · Canadian Prospects Recruitment' };
  return {
    title: `${a.firstName} ${a.lastName} · Canadian Prospects Recruitment`,
    description: `${a.position} | Class of ${a.gradYear} | ${a.school}. Official CPR recruiting profile.`,
  };
}

export default async function AthleteProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await getAthlete(slug);
  if (!a) notFound();

  const video = a.videoUrl ? embedUrl(a.videoUrl) : null;
  const schools = [...new Set(a.responses.map(r => r.school))];
  const statusClass = (s: string) =>
    'pstat ' + s.toLowerCase().replace(/[^a-z]+/g, '-');

  const athleticRows: [string, string][] = ([
    ['Position', a.position], ['Height', a.height], ['Weight', a.weight],
    ['Vertical Jump', a.vertical], ['Standing Reach', a.reach],
    ['Dominant Hand', a.hand], ['Jersey Number', a.jersey],
  ] as [string, string][]).filter(r => r[1]);

  const academicRows: [string, string][] = ([
    ['High School', a.school], ['Grad Year', a.gradYear], ['GPA', a.gpa],
    ['SAT (Est.)', a.sat], ['ACT (Est.)', a.act], ['NCAA Eligibility', a.ncaa],
  ] as [string, string][]).filter(r => r[1]);

  const recruitRows: [string, string][] = ([
    ['Profile Status', a.status],
    ['Profile Views', a.profileViews],
    ['Schools Interested', schools.length ? String(schools.length) : ''],
    ['Coach Responses', a.responses.length ? String(a.responses.length) : ''],
    ['Offers', a.offers], ['Visits', a.visits],
  ] as [string, string][]).filter(r => r[1]);

  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <a href="/"><img src={site.brand.logo} alt="Canadian Prospects Recruitment" className="nav-logo" /></a>
          <div className="nav-brand display">
            <div className="b1">{site.brand.nameLine1}</div>
            <div className="b2">{site.brand.nameLine2}</div>
            <div className="b3">{site.brand.tagline}</div>
          </div>
          <nav className="nav-links">
            <a href="/">HOME</a>
            <a className="btn" href={`mailto:${site.footer.email}?subject=Recruiting inquiry: ${a.firstName} ${a.lastName} (${a.slug})`}>CONTACT CPR</a>
          </nav>
        </div>
      </header>

      {a.status === 'Pending' && (
        <div className="profile-pending-banner">
          Recruiting profile in progress — visible to CPR staff. This profile goes fully live for coach outreach once enrollment is complete.
        </div>
      )}

      {/* PROFILE HERO */}
      <section className="phero">
        <div className="container phero-grid">
          <img className="phero-photo" src={a.photoUrl} alt={`${a.firstName} ${a.lastName}`} />
          <div>
            <h1 className="display">{a.firstName.toUpperCase()} {a.lastName.toUpperCase()}</h1>
            <p className="phero-meta">
              {[a.position, a.height, a.weight].filter(Boolean).join('  |  ')}
            </p>
            <p className="phero-tags">
              <span className="ptag red-tag">Class of {a.gradYear}</span>
              {a.ncaa && <span className="ptag green-tag">NCAA {a.ncaa}</span>}
              <span className="ptag">Profile ID: CPR{a.gradYear}-{a.slug.slice(0, 6).toUpperCase()}</span>
            </p>
            <div className="phero-contact">
              {(a.city || a.country || a.location) && (
                <span>&#9873; {a.city && a.country ? `${a.city}, ${a.country}` : (a.city || a.country || a.location)}</span>
              )}
              {a.parentName && <span>&#128100; Parent: {a.parentName}</span>}
            </div>
          </div>
        </div>
        {/* STAT BAND */}
        <div className="container pstats">
          {a.gpa && <div className="pstat-cell"><div className="k">GPA</div><div className="v display">{a.gpa}</div></div>}
          {a.sat && <div className="pstat-cell"><div className="k">SAT (Est.)</div><div className="v display">{a.sat}</div></div>}
          {a.school && <div className="pstat-cell"><div className="k">High School</div><div className="v display">{a.school}</div></div>}
          {a.gradYear && <div className="pstat-cell"><div className="k">Grad Year</div><div className="v display">{a.gradYear}</div></div>}
          {a.team && <div className="pstat-cell"><div className="k">Club Team</div><div className="v display">{a.team}</div></div>}
        </div>
      </section>

      {/* THREE PROFILE CARDS */}
      <section className="section psection">
        <div className="container trio">
          <div className="pcard">
            <h3 className="display"><span className="red">&#9658;</span> ATHLETIC PROFILE</h3>
            <table className="ptable"><tbody>
              {athleticRows.map(r => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td></tr>)}
            </tbody></table>
          </div>
          <div className="pcard">
            <h3 className="display"><span className="red">&#9658;</span> ACADEMIC PROFILE</h3>
            <table className="ptable"><tbody>
              {academicRows.map(r => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td></tr>)}
            </tbody></table>
          </div>
          <div className="pcard">
            <h3 className="display"><span className="red">&#9658;</span> RECRUITMENT STATUS</h3>
            <table className="ptable"><tbody>
              {recruitRows.map(r => (
                <tr key={r[0]}><td>{r[0]}</td><td>
                  {r[0] === 'Profile Status' ? <span className="pstat active">{r[1]}</span> : r[1]}
                </td></tr>
              ))}
            </tbody></table>
          </div>
        </div>
      </section>

      {/* VIDEO + BIO */}
      <section className="section psection" style={{ paddingTop: 0 }}>
        <div className="container duo">
          <div className="pcard">
            <h3 className="display"><span className="red">&#9658;</span> HIGHLIGHT VIDEO</h3>
            {video ? (
              <div className="pvideo"><iframe src={video} title="Highlight video" allowFullScreen /></div>
            ) : (
              <p className="pmuted">Highlight video coming soon.</p>
            )}
            {a.videoUrl && <a className="plink" href={a.videoUrl} target="_blank" rel="noopener noreferrer">VIEW ON YOUTUBE &#8599;</a>}
          </div>
          <div className="pcard">
            <h3 className="display"><span className="red">&#9658;</span> PLAYER BIO</h3>
            {a.bio && <p className="pbio">{a.bio}</p>}
            {a.strengths.length > 0 && (
              <>
                <div className="hl-label display">STRENGTHS</div>
                <div className="chips">{a.strengths.map(s => <span className="chip" key={s}>{s}</span>)}</div>
              </>
            )}
            {a.globalCities.length > 0 && (
              <>
                <div className="hl-label display">CITIES OF INTEREST</div>
                <div className="city-tags">{a.globalCities.map(c => <span className="city-tag" key={c}>{c}</span>)}</div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* SCHOOLS + RESPONSES */}
      {a.responses.length > 0 && (
        <section className="section psection" style={{ paddingTop: 0 }}>
          <div className="container duo">
            <div className="pcard">
              <h3 className="display"><span className="red">&#9658;</span> SCHOOLS INTERESTED ({schools.length})</h3>
              <table className="ptable wide"><thead><tr><th>School</th><th>Coach</th><th>Status</th><th>Date</th></tr></thead><tbody>
                {a.responses.map((r, i) => (
                  <tr key={i}><td>{r.school}</td><td>{r.coach}</td><td><span className={statusClass(r.status)}>{r.status}</span></td><td>{r.date}</td></tr>
                ))}
              </tbody></table>
            </div>
            <div className="pcard">
              <h3 className="display"><span className="red">&#9658;</span> RECENT COACH RESPONSES</h3>
              <table className="ptable wide"><thead><tr><th>Coach</th><th>School</th><th>Response</th></tr></thead><tbody>
                {a.responses.slice(0, 6).map((r, i) => (
                  <tr key={i}><td>{r.coach}</td><td>{r.school}</td><td><span className={statusClass(r.status)}>{r.status}</span></td></tr>
                ))}
              </tbody></table>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section psection" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <div>
              <h2 className="display">YOUR NEXT OPPORTUNITY IS CLOSER THAN YOU THINK.</h2>
              <p>Interested in {a.firstName}? Reach out and we will connect you directly.</p>
            </div>
            <CoachInquiryModal athleteSlug={a.slug} />
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="copyright">
            <span>{site.footer.copyright}</span>
            <span><a href="/">canadianprospects &middot; powered by Next Steps Pro</a></span>
          </div>
        </div>
      </footer>
    </>
  );
}
