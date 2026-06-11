import './landing.css';
import { site } from '@/config/site';

const I = ({ d, className = 'icon' }: { d: string; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const icons: Record<string, string> = {
  apply: 'M9 2h8a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V6zm0 0v4H5m6 4h6m-6 4h6m-9-7l1.5 1.5L12 9',
  upload: 'M20 16.6A4.5 4.5 0 0017.5 8.5a6 6 0 00-11.4 1.9A4 4 0 006 18h12.6zM12 12v6m0-6l-2.5 2.5M12 12l2.5 2.5',
  agreement: 'M9 2h8a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V6zm4 9l5-5m0 0h-3.5M18 6v3.5M9 14h3m-3 4h6',
  recruiting: 'M3 11l13-5v12L3 13v-2zm13-5a4 4 0 010 12M7 13v5a2 2 0 002 2h1',
  opportunities: 'M4 21V10l8-6 8 6v11M9 21v-6h6v6M2 21h20M12 7v.01',
  film: 'M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zm6 4l5 3-5 3V9z',
  youtube: 'M3 8a3 3 0 013-3h12a3 3 0 013 3v8a3 3 0 01-3 3H6a3 3 0 01-3-3V8zm7 1l5 3-5 3V9z',
  photos: 'M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zm4 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-4 7l5-5 3 3 4-4 5 5',
  teams: 'M16 14a4 4 0 10-8 0m12 6a4 4 0 00-4-4H8a4 4 0 00-4 4m8-12a3 3 0 100-6 3 3 0 000 6z',
  doc: 'M14 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V7zm0 0v5h5M9 13h6m-6 4h6',
  report: 'M14 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V7zm0 0v5h5M9 13l2 2 4-4',
  trophy: 'M8 4h8v5a4 4 0 11-8 0V4zm0 1H5a3 3 0 003 4m8-4h3a3 3 0 01-3 4m-4 4v3m-3 4h6m-6 0a3 3 0 013-3 3 3 0 013 3',
  folder: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  manage: 'M16 4h4v4m0-4l-6 6M8 20H4v-4m0 4l6-6m6 6h4v-4m-4 4l-6-6M8 4H4v4m4-4l6 6',
  trackicon: 'M3 12h4l3-8 4 16 3-8h4',
  updates: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  school: 'M22 9L12 4 2 9l10 5 10-5zm-16 4v4c0 1.7 2.7 3 6 3s6-1.3 6-3v-4',
  lock: 'M6 11h12a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1v-8a1 1 0 011-1zm2 0V7a4 4 0 118 0v4m-4 5v2',
  mail: 'M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zm0 2l8 6 8-6',
  insta: 'M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm5 12a3.5 3.5 0 100-7 3.5 3.5 0 000 7zm5.2-8.7v.01',
  pin: 'M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11zm0-8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
};

const id = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, '-');

export default function Home() {
  const s = site;
  return (
    <>
      {/* NAV */}
      <header className="nav">
        <div className="nav-inner">
          <img src={s.brand.logo} alt="Canadian Prospects Recruitment" className="nav-logo" />
          <div className="nav-brand display">
            <div className="b1">{s.brand.nameLine1}</div>
            <div className="b2">{s.brand.nameLine2}</div>
            <div className="b3">{s.brand.tagline}</div>
          </div>
          <nav className="nav-links">
            {s.nav.map((n, i) => (
              <a key={n} href={i === 0 ? '#top' : `#${id(n)}`} className={i === 0 ? 'active' : ''}>{n}</a>
            ))}
            <a className="btn" href={s.links.apply}>APPLY NOW</a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="hero" id="top">
        <div className="hero-grid">
          <div className="hero-copy">
            <h1 className="display">{s.hero.line1}<br /><span className="l2">{s.hero.line2}</span><br />{s.hero.line3}</h1>
            <p>{s.hero.sub}</p>
            <div className="hero-btns">
              <a className="btn" href={s.links.apply}>APPLY NOW</a>
              <a className="btn btn-outline" href={s.links.video}>&#9654;&nbsp; WATCH VIDEO</a>
            </div>
          </div>
          <div className="hero-img" style={{ backgroundImage: `url('${s.hero.image}')` }} />
        </div>
      </section>

      {/* PROCESS */}
      <section className="section" id="how-it-works">
        <div className="container">
          <div className="sec-head">
            <h2 className="display">{s.process.heading[0]}<span className="red">{s.process.heading[1]}</span>{s.process.heading[2]}</h2>
            <p>{s.process.sub}</p>
          </div>
          <div className="process-grid">
            {s.process.steps.map((st, i) => (
              <div className="process-card" key={st.n}>
                <I d={icons[st.icon]} />
                <h3 className="display">{st.n}</h3>
                <p>{st.d}</p>
                {i < s.process.steps.length - 1 && <span className="arrow">&#10140;</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOWCASE + COACH PANEL */}
      <section className="section" id="about-us" style={{ paddingTop: 0 }}>
        <div className="container duo">
          <div className="panel">
            <h2 className="display"><span className="red">{s.showcase.heading[0]}</span>{s.showcase.heading[1]}</h2>
            <p className="sub">{s.showcase.sub}</p>
            <div className="tile-grid">
              {s.showcase.tiles.map((t, i) => (
                <div className={`tile${i === 1 || i === 6 ? ' hot' : ''}`} key={t.label}>
                  <I d={icons[t.icon]} />
                  <span>{t.label}</span>
                </div>
              ))}
            </div>
            <a className="btn" href={s.links.apply}>{s.showcase.cta}</a>
          </div>
          <div className="panel panel-dark">
            <h2 className="display">{s.coachPanel.heading[0]}<span style={{ color: 'var(--red-bright)' }}>{s.coachPanel.heading[1]}</span>{s.coachPanel.heading[2]}</h2>
            <p className="sub">{s.coachPanel.sub}</p>
            <div className="profile-card">
              <div className="profile-top">
                <img src={s.coachPanel.athlete.photo} alt={s.coachPanel.athlete.name} />
                <div>
                  <h3 className="display">{s.coachPanel.athlete.name}</h3>
                  <p className="profile-meta">{s.coachPanel.athlete.meta}</p>
                  <p className="profile-team">{s.coachPanel.athlete.team}</p>
                  <table className="profile-rows"><tbody>
                    {s.coachPanel.athlete.rows.map(r => (
                      <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td></tr>
                    ))}
                  </tbody></table>
                </div>
              </div>
              <div className="hl-label display">HIGHLIGHT VIDEO</div>
              <div className="hl-strip">
                {s.coachPanel.athlete.videos.map(v => <img key={v} src={v} alt="Highlight" />)}
              </div>
            </div>
            <div className="panel-cta"><a className="btn" href="/athletes/jayden-thompson">{s.coachPanel.cta}</a></div>
          </div>
        </div>
      </section>

      {/* TRACK */}
      <section className="section track">
        <div className="container track-grid">
          <div>
            <h2 className="display">{s.track.heading[0]}<span className="red">{s.track.heading[1]}</span>{s.track.heading[2]}</h2>
            <p className="lead">{s.track.sub}</p>
            <div className="feat-grid">
              {s.track.features.map(f => (
                <div className="feat" key={f.t}>
                  <I d={icons[f.icon]} />
                  <div><h4>{f.t}</h4><p>{f.d}</p></div>
                </div>
              ))}
            </div>
          </div>
          <img src={s.track.image} alt="Recruitment Dashboard" />
        </div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div className="container stats-grid">
          {s.stats.map(st => (
            <div className="stat" key={st.l}>
              <div className="v display">{st.v}</div>
              <div className="l">{st.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* STORIES */}
      <section className="section" id="success-stories">
        <div className="container">
          <div className="sec-head"><h2 className="display">{s.stories.heading}</h2></div>
          <div className="stories-grid">
            {s.stories.items.map(t => (
              <div className="story proof" key={t.img}>
                <img src={t.img} alt={t.caption} className="proof-img" />
                <p className="proof-cap">{t.caption}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="section" id="faq" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <div>
              <h2 className="display">{s.cta.heading}</h2>
              <p>{s.cta.sub}</p>
            </div>
            <a className="btn btn-white" href={s.links.apply}>{s.cta.button} &nbsp;&#10140;</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer" id="contact">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <img src={s.brand.logo} alt="CPR logo" />
              <div>
                <div className="t display">CANADIAN PROSPECTS RECRUITMENT</div>
                <p>{s.footer.about}</p>
              </div>
            </div>
            <div>
              <h5 className="display">QUICK LINKS</h5>
              <ul>{s.footer.quickLinks.map(l => <li key={l}><a href={`#${id(l)}`}>{l}</a></li>)}</ul>
            </div>
            <div>
              <h5 className="display">RESOURCES</h5>
              <ul>{s.footer.resources.map(l => <li key={l}><a href={s.links.apply}>{l}</a></li>)}</ul>
            </div>
            <div>
              <h5 className="display">CONTACT US</h5>
              <div className="contact-row"><I d={icons.mail} /><a href={`mailto:${s.footer.email}`}>{s.footer.email}</a></div>
              <div className="contact-row"><I d={icons.insta} /><a href={s.links.instagram}>{s.footer.instagramLabel}</a></div>
              <div className="contact-row"><I d={icons.pin} /><span>{s.footer.location}</span></div>
            </div>
          </div>
          <div className="copyright">
            <span>{s.footer.copyright}</span>
            <span><a href="#top">Privacy Policy</a><a href="#top">Terms of Service</a></span>
          </div>
        </div>
      </footer>
    </>
  );
}
