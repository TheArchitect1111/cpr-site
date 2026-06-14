import { getYearsUntilGrad } from '@/lib/portal-data';

type ActionItem = string;

const PLAN_BY_BUCKET: Record<string, { heading: string; items: ActionItem[] }> = {
  senior: {
    heading: 'Your athlete is in the final stretch. Here is what matters most right now.',
    items: [
      'Schedule and complete campus visits at schools that have shown interest.',
      'Evaluate any offers carefully -- consider academics, fit, and financial aid.',
      'Work through the commitment decision process with Coach Mike.',
      'Keep your grades up through the end of the school year.',
    ],
  },
  junior: {
    heading: 'Junior year is the most active time in the recruiting process. Stay on top of it.',
    items: [
      'Respond to all coach messages within 24 hours -- responsiveness matters.',
      'Track every recruiting conversation in your CPR portal as it happens.',
      'Attend evaluation events and showcases where college coaches will be present.',
      'Keep your academic record strong -- coaches check grades.',
    ],
  },
  sophomore: {
    heading: 'This is a great time to build exposure and get your profile in front of coaches.',
    items: [
      'Complete and polish your CPR recruiting profile with updated stats and video.',
      'Attend camps and showcases to get seen by college coaching staffs.',
      'Start researching schools and programs that fit your athlete academically and athletically.',
      'Build your highlight reel from game footage this season.',
    ],
  },
  younger: {
    heading: 'Your athlete is early in the process. The focus right now is building a strong foundation.',
    items: [
      'Prioritize academics -- grades open doors that talent alone cannot.',
      'Build consistent daily habits around training and recovery.',
      'Focus on skill development and competing at the highest level available.',
    ],
  },
};

function getBucket(yearsUntil: number): keyof typeof PLAN_BY_BUCKET {
  if (yearsUntil <= 0) return 'senior';
  if (yearsUntil === 1) return 'junior';
  if (yearsUntil === 2) return 'sophomore';
  return 'younger';
}

const BulletIcon = () => (
  <svg className="pp-map-icon" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
    <polyline points="5.5,9 8,11.5 12.5,6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function MonthlyActionPlan({
  gradYear,
  currentYear,
}: {
  gradYear: number;
  currentYear: number;
}) {
  const yearsUntil = getYearsUntilGrad(gradYear, currentYear);
  const bucket = getBucket(yearsUntil);
  const plan = PLAN_BY_BUCKET[bucket];

  return (
    <section className="pp-section">
      <p className="pp-section-eyebrow">Monthly Action Plan</p>
      <h2 className="pp-section-title">What Should You Be Doing Right Now?</h2>

      <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--gray)', lineHeight: '1.5' }}>
        {plan.heading}
      </p>

      <div className="pp-map-items">
        {plan.items.map((item, i) => (
          <div key={i} className="pp-map-item">
            <BulletIcon />
            <span className="pp-map-text">{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
