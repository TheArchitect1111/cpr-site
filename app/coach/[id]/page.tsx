import '../../landing.css';
import '../../athletes/[slug]/profile.css';
import { notFound } from 'next/navigation';
import { embedUrl, getAthlete } from '@/lib/athletes';
import RichTextContent from '@/app/components/RichTextContent';
import { getOutreachByRecordId, trackCoachShareView, verifyOutreachShareToken } from '@/lib/outreach';
import { site } from '@/config/site';

export const dynamic = 'force-dynamic';

export default async function CoachShareProfile({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string; thanks?: string }>;
}) {
  const { id } = await params;
  const { token = '', thanks = '' } = await searchParams;
  if (!verifyOutreachShareToken(id, token)) notFound();

  const outreach = await getOutreachByRecordId(id);
  if (!outreach?.prospectSlug) notFound();

  const athlete = await getAthlete(outreach.prospectSlug, { includeHidden: true });
  if (!athlete) notFound();

  await trackCoachShareView(id);

  const video = athlete.videoUrl ? embedUrl(athlete.videoUrl) : null;
  const athleticRows: [string, string][] = ([
    ['Position', athlete.position],
    ['Height', athlete.height],
    ['Weight', athlete.weight],
    ['Club Team', athlete.team],
    ['Jersey Number', athlete.jersey],
    ['Dominant Hand', athlete.hand],
  ] as [string, string][]).filter(row => row[1]);
  const academicRows: [string, string][] = ([
    ['High School', athlete.school],
    ['Grad Year', athlete.gradYear],
    ['GPA', athlete.gpa],
    ['SAT', athlete.sat],
    ['ACT', athlete.act],
    ['NCAA Eligibility', athlete.ncaa],
  ] as [string, string][]).filter(row => row[1]);

  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <a href="/"><img src={site.brand.logo} alt="CPR Global Prospects" className="nav-logo" /></a>
          <div className="nav-brand display">
            <div className="b1">{site.brand.nameLine1}</div>
            <div className="b2">{site.brand.nameLine2}</div>
            <div className="b3">{site.brand.tagline}</div>
          </div>
          <nav className="nav-links">
            <a className="btn" href={`mailto:${site.footer.email}?subject=Coach inquiry: ${athlete.firstName} ${athlete.lastName} (${athlete.slug})`}>CONTACT CPR</a>
          </nav>
        </div>
      </header>

      <section className="phero">
        <div className="container coach-banner">
          Private coach share for {outreach.school || outreach.coach || 'coach contact'}
        </div>
        <div className="container phero-grid">
          <img className="phero-photo" src={athlete.photoUrl} alt={`${athlete.firstName} ${athlete.lastName}`} />
          <div>
            <h1 className="display">{athlete.firstName.toUpperCase()} {athlete.lastName.toUpperCase()}</h1>
            <p className="phero-meta">{[athlete.position, athlete.height, athlete.weight].filter(Boolean).join('  |  ')}</p>
            <p className="phero-tags">
              {athlete.gradYear && <span className="ptag red-tag">Class of {athlete.gradYear}</span>}
              {athlete.ncaa && <span className="ptag green-tag">NCAA {athlete.ncaa}</span>}
              <span className="ptag">Coach Review Link</span>
            </p>
            <div className="phero-contact">
              {athlete.location && <span>{athlete.location}</span>}
              {athlete.parentName && <span>Parent: {athlete.parentName}</span>}
            </div>
          </div>
        </div>
        <div className="container pstats">
          {athlete.gpa && <div className="pstat-cell"><div className="k">GPA</div><div className="v display">{athlete.gpa}</div></div>}
          {athlete.school && <div className="pstat-cell"><div className="k">High School</div><div className="v display">{athlete.school}</div></div>}
          {athlete.gradYear && <div className="pstat-cell"><div className="k">Grad Year</div><div className="v display">{athlete.gradYear}</div></div>}
          {athlete.team && <div className="pstat-cell"><div className="k">Club Team</div><div className="v display">{athlete.team}</div></div>}
        </div>
      </section>

      <section className="section psection">
        <div className="container trio">
          <div className="pcard">
            <h3 className="display"><span className="red">&#9658;</span> ATHLETIC PROFILE</h3>
            <table className="ptable"><tbody>{athleticRows.map(row => <tr key={row[0]}><td>{row[0]}</td><td>{row[1]}</td></tr>)}</tbody></table>
          </div>
          <div className="pcard">
            <h3 className="display"><span className="red">&#9658;</span> ACADEMIC PROFILE</h3>
            <table className="ptable"><tbody>{academicRows.map(row => <tr key={row[0]}><td>{row[0]}</td><td>{row[1]}</td></tr>)}</tbody></table>
          </div>
          <div className="pcard">
            <h3 className="display"><span className="red">&#9658;</span> PLAYER BIO</h3>
            {athlete.bio && <RichTextContent className="pbio" html={athlete.bio} as="p" />}
            {athlete.strengths.length > 0 && <div className="chips">{athlete.strengths.map(s => <span className="chip" key={s}>{s}</span>)}</div>}
          </div>
        </div>
      </section>

      <section className="section psection" style={{ paddingTop: 0 }}>
        <div className="container duo">
          <div className="pcard">
            <h3 className="display"><span className="red">&#9658;</span> HIGHLIGHT VIDEO</h3>
            {video ? <div className="pvideo"><iframe src={video} title="Highlight video" allowFullScreen /></div> : <p className="pmuted">Highlight video coming soon.</p>}
            {athlete.videoUrl && <a className="plink" href={athlete.videoUrl} target="_blank" rel="noopener noreferrer">VIEW ON YOUTUBE &#8599;</a>}
          </div>
          <div className="pcard">
            <h3 className="display"><span className="red">&#9658;</span> COACH NEXT STEP</h3>
            {thanks === '1' && <p className="coach-thanks">Thanks. Your response has been sent to CPR.</p>}
            <p className="pbio">Share your recruiting feedback and CPR will coordinate the right next step for {athlete.firstName} {athlete.lastName}.</p>
            <form className="coach-response-form" action={`/api/coach/${encodeURIComponent(id)}/response?token=${encodeURIComponent(token)}`} method="post">
              <div className="coach-response-buttons">
                <button name="response" value="interested">Interested</button>
                <button name="response" value="maybe">Maybe</button>
                <button name="response" value="request_info">Request Info</button>
                <button name="response" value="not_fit">Not a Fit</button>
              </div>
              <textarea name="detail" placeholder="Optional note for CPR" />
            </form>
            <a className="btn" href={`mailto:${site.footer.email}?subject=Coach inquiry: ${athlete.firstName} ${athlete.lastName} (${athlete.slug})`}>CONTACT CPR &nbsp;&#10140;</a>
          </div>
        </div>
      </section>
    </>
  );
}
