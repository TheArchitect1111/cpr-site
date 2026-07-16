import { eaChassis } from '@/config/ea-chassis';
import type { PortalUpdate } from '@/lib/portal-updates';
import type { ContentRequestRecord } from '@/lib/content-requests';
import type { UpdateHubFeedItem } from '@/lib/update-hub-feed';
import RichTextContent from '@/app/components/RichTextContent';

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

function fmtPending(value?: string): string {
  if (!value) return '—';
  return new Date(value.includes('T') ? value : `${value}T12:00:00`).toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function UpdatePortalFeed({
  publishedFeed,
  pendingRequests,
  activityUpdates,
  athleteName,
  live,
  requestUrl,
  ownerPostUrl,
}: {
  publishedFeed: UpdateHubFeedItem[];
  pendingRequests: ContentRequestRecord[];
  activityUpdates: PortalUpdate[];
  athleteName: string;
  live: boolean;
  requestUrl?: string;
  ownerPostUrl?: string;
}) {
  return (
    <div className="update-portal">
      <div className="update-portal-hero">
        <p className="pp-portal-label">Update Hub™</p>
        <h1 className="update-portal-title">
          {eaChassis.portalCopy.updateFeedTitle.replace('{name}', athleteName)}
        </h1>
        <p className="update-portal-sub">
          Published updates and request status in one place.
          {!live && ' Showing available data; connect Airtable for live Content Requests.'}
        </p>
        <div className="update-portal-cta-row">
          {requestUrl ? (
            <a className="owner-primary owner-link-cta" href={requestUrl}>
              Request update
            </a>
          ) : null}
          {ownerPostUrl ? (
            <a className="owner-secondary owner-link-cta" href={ownerPostUrl}>
              Staff publish
            </a>
          ) : null}
        </div>
      </div>

      <section className="update-hub-section">
        <h2 className="update-hub-section-title">Published updates</h2>
        {publishedFeed.length === 0 ? (
          <div className="update-portal-empty pp-section">
            <p>No published Update Hub items yet. Submit a request to get started.</p>
          </div>
        ) : (
          <div className="update-portal-feed">
            {publishedFeed.map((item) => (
              <article key={item.id} className="update-portal-item">
                <div className="update-portal-meta">
                  <span className="update-portal-badge update-portal-badge-recruiting">
                    {item.requestType || 'Update'}
                  </span>
                  <time dateTime={item.date}>{formatWhen(item.date)}</time>
                </div>
                <h2>{item.title}</h2>
                {item.body ? <RichTextContent html={item.body} as="p" /> : null}
              </article>
            ))}
          </div>
        )}
      </section>

      {pendingRequests.length > 0 ? (
        <section className="update-hub-section">
          <h2 className="update-hub-section-title">Pending requests</h2>
          <div className="update-hub-pending">
            {pendingRequests.map((request) => (
              <article key={request.id} className="update-hub-pending-item">
                <div className="update-portal-meta">
                  <span className="update-portal-badge">{request.status}</span>
                  <time dateTime={request.dateSubmitted}>{fmtPending(request.dateSubmitted)}</time>
                </div>
                <h3>{request.title}</h3>
                <p>
                  {request.requestType}
                  {request.priority && request.priority !== 'Normal' ? ` · ${request.priority}` : ''}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="update-hub-section">
        <h2 className="update-hub-section-title">Recruiting activity</h2>
        <p className="update-hub-section-sub">
          Secondary feed from portal messages, opportunities, and tracked activity.
        </p>
        {activityUpdates.length === 0 ? (
          <div className="update-portal-empty pp-section">
            <p>{eaChassis.portalCopy.emptyUpdates}</p>
          </div>
        ) : (
          <div className="update-portal-feed">
            {activityUpdates.map((item) => (
              <article key={item.id} className="update-portal-item update-portal-item-secondary">
                <div className="update-portal-meta">
                  <span className={`update-portal-badge update-portal-badge-${item.category}`}>
                    {CATEGORY_LABEL[item.category]}
                  </span>
                  <time dateTime={item.date}>{formatWhen(item.date)}</time>
                </div>
                <h2>{item.title}</h2>
                <RichTextContent html={item.body} as="p" />
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
