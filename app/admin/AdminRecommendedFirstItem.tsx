type AdminRecommendedFirstItemProps = {
  eyebrow?: string;
  title: string;
  reason: string;
  action: string;
  outcome: string;
  trigger?: string;
  risk?: string;
  followUpMeasurement?: string;
  urgency?: 'low' | 'medium' | 'high';
  href?: string;
  actionLabel?: string;
};

export default function AdminRecommendedFirstItem({
  eyebrow = 'Recommended First Item',
  title,
  reason,
  action,
  outcome,
  trigger,
  risk,
  followUpMeasurement,
  urgency,
  href,
  actionLabel = 'Start here',
}: AdminRecommendedFirstItemProps) {
  const whyTrigger = trigger || reason;
  const whyRisk = risk || 'Reduces delay, stale work, and unclear ownership before the owner moves to lower-value tasks.';
  const followUp = followUpMeasurement || 'After this action, the item should have a clearer status, owner, date, or next step.';

  return (
    <section className={`ea-first-item${urgency ? ` urgency-${urgency}` : ''}`} aria-label={eyebrow}>
      <div>
        <span>{eyebrow}</span>
        <strong>{title}</strong>
        <p>{reason}</p>
        <div className="ea-first-why">
          <span>Why this first?</span>
          <p>{whyTrigger}</p>
          <p>{whyRisk}</p>
        </div>
      </div>
      <dl>
        <div>
          <dt>Action</dt>
          <dd>{action}</dd>
        </div>
        <div>
          <dt>Expected Outcome</dt>
          <dd>{outcome}</dd>
        </div>
        <div>
          <dt>Follow-up Measurement</dt>
          <dd>{followUp}</dd>
        </div>
      </dl>
      {href ? <a href={href}>{actionLabel}</a> : null}
    </section>
  );
}
