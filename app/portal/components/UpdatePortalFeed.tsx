import type { PortalUpdate } from '@/lib/portal-updates';

const CATEGORY_LABEL: Record<PortalUpdate['category'], string> = {
  recruiting: 'Recruiting',
  onboarding: 'Onboarding',
  message: 'Message',
  opportunity: 'Opportunity',
  system: 'CPR Activity',
};

function formatWhen(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`);
  return d.toLocaleDateString('en-CA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function UpdatePortalFeed({
  updates,
  athleteName,
  live,
}: {
  updates: PortalUpdate[];
  athleteName: string;
  live: boolean;
}) {
  return (
    <div className="update-portal">
      <div className="update-portal-hero">
        <p className="pp-portal-label">Update Portal</p>
        <h1 className="update-portal-title">Recruiting activity for {athleteName}</h1>
        <p className="update-portal-sub">
          Every outreach, message, and milestone — in one live feed.
          {!live && ' Showing sample updates until live data is available.'}
        </p>
      </div>

      {updates.length === 0 ? (
        <div className="update-portal-empty pp-section">
          <p>No updates yet. As CPR tracks coach outreach and school interest, activity will appear here.</p>
        </div>
      ) : (
        <div className="update-portal-feed">
          {updates.map((item) => (
            <article key={item.id} className="update-portal-item">
              <div className="update-portal-meta">
                <span className={`update-portal-badge update-portal-badge-${item.category}`}>
                  {CATEGORY_LABEL[item.category]}
                </span>
                <time dateTime={item.date}>{formatWhen(item.date)}</time>
              </div>
              <h2>{item.title}</h2>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
