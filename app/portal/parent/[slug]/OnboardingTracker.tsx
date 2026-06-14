import type { OnboardingData } from '@/lib/portal-data';

const STEPS: { key: keyof OnboardingData; label: string }[] = [
  { key: 'profileComplete',    label: 'Athlete profile complete' },
  { key: 'videoUploaded',      label: 'Highlight video uploaded' },
  { key: 'photosUploaded',     label: 'Photos uploaded' },
  { key: 'assessmentComplete', label: 'Recruiting assessment complete' },
  { key: 'parentOrientation',  label: 'Parent orientation complete' },
  { key: 'cprReview',          label: 'CPR profile review complete' },
  { key: 'readyForPromotion',  label: 'Ready for promotion' },
];

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function OnboardingTracker({
  onboarding,
  athleteName,
}: {
  onboarding: OnboardingData;
  athleteName: string;
}) {
  const doneCount = STEPS.filter(s => onboarding[s.key]).length;
  const pct = Math.round((doneCount / STEPS.length) * 100);

  return (
    <section className="pp-section">
      <p className="pp-section-eyebrow">Onboarding</p>
      <h2 className="pp-section-title">Getting {athleteName} Set Up</h2>

      <div className="pp-progress-row">
        <div className="pp-progress-bar-wrap">
          <div className="pp-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="pp-progress-pct">{pct}%</div>
      </div>

      <div className="pp-steps">
        {STEPS.map(({ key, label }) => {
          const done = onboarding[key];
          return (
            <div key={key} className="pp-step">
              <div className={`pp-step-icon ${done ? 'done' : 'pending'}`}>
                {done && <CheckIcon />}
              </div>
              <span className={`pp-step-label ${done ? 'done' : 'pending'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
