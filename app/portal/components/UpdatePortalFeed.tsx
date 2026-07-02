import { eaChassis } from '@/config/ea-chassis';
import type { PortalUpdate } from '@/lib/portal-updates';

const CATEGORY_LABEL: Record<PortalUpdate['category'], string> = {
  recruiting: 'Recruiting',
  onboarding: 'Onboarding',
  message: 'Message',
  opportunity: 'Opportunity',
  system: eaChassis.portalCopy.categorySystemLabel,
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
  ownerPostUrl,
}: {
  updates: PortalUpdate[];
  athleteName: string;
  live: boolean;
  ownerPostUrl?: string;
}) {
  return (
    <div className="update-portal">
      <div className="update-portal-hero">
        <p className="pp-portal-label">{eaChassis.navigation.tabs.updates}</p>
        <h1 className="update-portal-title">
          {eaChassis.portalCopy.updateFeedTitle.replace('{name}', athleteName)}
        </h1>
        <p className="update-portal-sub">
          {eaChassis.portalCopy.updateFeedSub}
          {!live && ' Showing sample updates until live data is available.'}
        </p>
        {ownerPostUrl && (
          <p className="update-portal-owner-cta">
            <a className="owner-primary owner-link-cta" href={ownerPostUrl}>Post update via Update Hub</a>
          </p>
        )}
      </div>

      {updates.length === 0 ? (
        <div className="update-portal-empty pp-section">
          <p>{eaChassis.portalCopy.emptyUpdates}</p>
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
