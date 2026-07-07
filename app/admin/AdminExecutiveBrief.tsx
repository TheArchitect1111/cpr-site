type AdminExecutiveBriefProps = {
  eyebrow: string;
  title: string;
  situation: string;
  recommendation: string;
  why: string;
  nextBestAction: string;
  expectedOutcome: string;
  confidence: string;
  successMetric: string;
  urgency?: 'low' | 'medium' | 'high';
  followUpMeasurement?: string;
  actionHref?: string;
  actionLabel?: string;
};

export default function AdminExecutiveBrief({
  eyebrow,
  title,
  situation,
  recommendation,
  why,
  nextBestAction,
  expectedOutcome,
  confidence,
  successMetric,
  urgency,
  followUpMeasurement,
  actionHref,
  actionLabel = 'Start action',
}: AdminExecutiveBriefProps) {
  const urgencyLabel = urgency === 'high' ? 'High' : urgency === 'low' ? 'Low' : 'Medium';
  const followUp = followUpMeasurement || 'Review the same signal after the action and confirm the status, owner, or outcome changed.';

  return (
    <section className="ea-executive-brief" aria-labelledby={`brief-${eyebrow.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
      <div className="ea-brief-main">
        <p className="ea-eyebrow">{eyebrow}</p>
        <h1 id={`brief-${eyebrow.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>{title}</h1>
        <div className="ea-brief-grid">
          <div>
            <span>Situation</span>
            <p>{situation}</p>
          </div>
          <div>
            <span>Recommendation</span>
            <p>{recommendation}</p>
          </div>
          <div>
            <span>Why</span>
            <p>{why}</p>
          </div>
        </div>
      </div>
      <aside className="ea-brief-action" aria-label="Recommended action">
        <span>Next Best Action</span>
        <strong>{nextBestAction}</strong>
        <small>{expectedOutcome}</small>
        <dl>
          <div>
            <dt>Confidence</dt>
            <dd>{confidence}</dd>
          </div>
          <div>
            <dt>Success Metric</dt>
            <dd>{successMetric}</dd>
          </div>
          <div>
            <dt>Urgency</dt>
            <dd>{urgencyLabel}</dd>
          </div>
          <div>
            <dt>Follow-up</dt>
            <dd>{followUp}</dd>
          </div>
        </dl>
        {actionHref ? <a href={actionHref}>{actionLabel}</a> : null}
      </aside>
    </section>
  );
}
