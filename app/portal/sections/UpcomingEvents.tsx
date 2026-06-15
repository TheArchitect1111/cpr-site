import type { PortalEvent } from '@/lib/sections-data';

function formatEventDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-CA', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });
}

interface Props {
  events: PortalEvent[];
}

export default function UpcomingEvents({ events }: Props) {
  return (
    <div>
      <div className="sec-card">
        <div className="sec-label">CALENDAR</div>
        <h1 className="sec-heading">Upcoming Events</h1>
        <p className="sec-sub">
          Showcases, webinars, and workshops curated for CPR athletes. Register early as spots are
          limited.
        </p>

        {events.length === 0 ? (
          <div className="sec-empty">
            <div className="sec-empty-icon">&#128197;</div>
            <p>No upcoming events right now. Check back soon.</p>
          </div>
        ) : (
          <div className="evt-list">
            {events.map((ev) => (
              <div key={ev.id} className="evt-card">
                <div className="evt-head">
                  <div className="evt-name">{ev.eventName}</div>
                  {ev.eventType && <span className="evt-type-badge">{ev.eventType}</span>}
                </div>
                <div className="evt-body">
                  <div className="evt-date-loc">
                    {ev.date && (
                      <div className="evt-date-loc-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        {formatEventDate(ev.date)}
                      </div>
                    )}
                    {ev.location && (
                      <div className="evt-date-loc-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        {ev.location}
                      </div>
                    )}
                  </div>
                  {ev.description && <p className="evt-desc">{ev.description}</p>}
                  {ev.registrationUrl && ev.registrationUrl !== '#' ? (
                    <a
                      href={ev.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="evt-register"
                    >
                      Register Now &#8594;
                    </a>
                  ) : (
                    <span className="evt-register" style={{ opacity: .5, cursor: 'default' }}>
                      Registration opening soon
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
