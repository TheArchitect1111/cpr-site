import { getYearsUntilGrad } from '@/lib/portal-data';

type StageStatus = 'done' | 'active' | 'future';

const STAGES = [
  {
    num: 1,
    name: 'Learn',
    desc: 'Build your foundation. Focus on school, training, and developing your game.',
  },
  {
    num: 2,
    name: 'Prepare',
    desc: 'Get your recruiting profile ready and start attending camps to get noticed.',
  },
  {
    num: 3,
    name: 'Evaluate',
    desc: 'College coaches are watching. CPR is helping identify the right fits for your athlete.',
  },
  {
    num: 4,
    name: 'Connect',
    desc: 'Direct conversations with coaches are happening. Stay on top of every communication.',
  },
  {
    num: 5,
    name: 'Visit',
    desc: 'Campus visits are your chance to see where your athlete would live and play.',
  },
  {
    num: 6,
    name: 'Commit',
    desc: 'Choosing the right school. This is the finish line.',
  },
];

function getActiveRange(yearsUntil: number): { first: number; last: number } {
  if (yearsUntil <= 0) return { first: 5, last: 6 };
  if (yearsUntil === 1) return { first: 3, last: 4 };
  if (yearsUntil === 2) return { first: 2, last: 2 };
  return { first: 1, last: 1 };
}

function stageStatus(stageNum: number, first: number, last: number): StageStatus {
  if (stageNum < first) return 'done';
  if (stageNum <= last) return 'active';
  return 'future';
}

const CheckTiny = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <polyline points="2.5,7 5.5,10 11.5,4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function RecruitingRoadmap({
  gradYear,
  currentYear,
}: {
  gradYear: number;
  currentYear: number;
}) {
  const yearsUntil = getYearsUntilGrad(gradYear, currentYear);
  const { first, last } = getActiveRange(yearsUntil);

  const yearLabel = gradYear > 0
    ? `Class of ${gradYear}`
    : 'Your athlete';

  return (
    <section className="pp-section">
      <p className="pp-section-eyebrow">Recruiting Roadmap</p>
      <h2 className="pp-section-title">Where {yearLabel} Stands Right Now</h2>

      <div className="pp-roadmap-wrap">
        <div className="pp-roadmap-track" aria-hidden="true" />
        <div className="pp-roadmap-row">
          {STAGES.map(stage => {
            const s = stageStatus(stage.num, first, last);
            return (
              <div key={stage.num} className="pp-roadmap-stage">
                <div className={`pp-stage-circle ${s}`}>
                  {s === 'done' ? <CheckTiny /> : stage.num}
                </div>
                <div className={`pp-stage-name ${s}`}>{stage.name}</div>
                <div className={`pp-stage-desc ${s}`}>{stage.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
