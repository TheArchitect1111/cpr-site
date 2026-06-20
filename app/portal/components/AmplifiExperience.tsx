import '../amplifi.css';

type Props = {
  firstName: string;
  lastName: string;
  gradYear: number;
  sport: string;
  onboardingPct: number;
  opportunityCount: number;
  portalType: 'athlete' | 'parent';
  slug: string;
};

const JOURNEY = [
  { title: 'Potential', copy: 'The talent is already there. The opportunity is finding the right stage.' },
  { title: 'Development', copy: 'Film, academics, and habits that coaches evaluate every season.' },
  { title: 'Exposure', copy: 'Profiles, showcases, and outreach that put you in front of decision-makers.' },
  { title: 'Opportunity', copy: 'Real conversations with programs that fit your goals and your game.' },
  { title: 'Success', copy: 'The right school, the right fit, and a future you can see clearly.' },
];

export default function AmplifiExperience({
  firstName,
  lastName,
  gradYear,
  sport,
  onboardingPct,
  opportunityCount,
  portalType,
  slug,
}: Props) {
  const name = firstName || 'Athlete';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || name;
  const base = `/portal/${portalType}/${slug}`;

  return (
    <div className="amplifi-page">
      <section className="amplifi-reveal">
        <p className="amplifi-kicker">Amplifi™ · Athlete Development</p>
        <h1>
          {name}, your future
          <span> is bigger than you think.</span>
        </h1>
        <p className="amplifi-lede">
          This is not a report. This is your recruiting story — told the way it deserves to be told.
        </p>
      </section>

      <section className="amplifi-journey">
        <p className="amplifi-section-label">Your journey</p>
        <div className="amplifi-steps">
          {JOURNEY.map((step, index) => (
            <div key={step.title} className="amplifi-step" style={{ animationDelay: `${index * 0.08}s` }}>
              <div className="amplifi-step-num">{index + 1}</div>
              <div>
                <h2>{step.title}</h2>
                <p>{step.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="amplifi-hidden">
        <p className="amplifi-section-label">What CPR sees today</p>
        <div className="amplifi-stat-grid">
          <div className="amplifi-stat">
            <strong>{fullName}</strong>
            <span>{sport || 'Basketball'} · Class of {gradYear || '—'}</span>
          </div>
          <div className="amplifi-stat">
            <strong>{onboardingPct}%</strong>
            <span>Onboarding complete</span>
          </div>
          <div className="amplifi-stat">
            <strong>{opportunityCount}</strong>
            <span>Active school opportunities</span>
          </div>
        </div>
        <p className="amplifi-hidden-copy">
          Coaches are not looking for perfect. They are looking for prepared, visible, and ready.
          CPR exists to make that preparation impossible to miss.
        </p>
      </section>

      <section className="amplifi-future">
        <p className="amplifi-section-label">Twelve months from now</p>
        <h2>Imagine this.</h2>
        <ul>
          <li>Your profile is active with programs that match your level and goals.</li>
          <li>Parents see every update in the Update Portal — no guessing, no silence.</li>
          <li>Coach conversations turn into visits, offers, and decisions you control.</li>
          <li>You are not chasing opportunity. Opportunity knows where to find you.</li>
        </ul>
      </section>

      <section className="amplifi-cta">
        <p>I can see it. I believe it. I know how to get there.</p>
        <div className="amplifi-cta-actions">
          <a href={base} className="amplifi-btn amplifi-btn-primary">Return to portal</a>
          <a href={`${base}/updates`} className="amplifi-btn amplifi-btn-secondary">View live updates</a>
        </div>
      </section>
    </div>
  );
}
