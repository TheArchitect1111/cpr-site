import { getCommunicationAnnouncements } from '@/lib/communication-center-data';
import './portal-announcements.css';

function formatWhen(value: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function PortalAnnouncements() {
  const { announcements } = await getCommunicationAnnouncements();
  const published = announcements
    .filter((a) => a.status === 'Published')
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return (b.publishedAt || b.createdAt || '').localeCompare(a.publishedAt || a.createdAt || '');
    })
    .slice(0, 4);

  if (published.length === 0) return null;

  return (
    <section className="pp-section portal-announce" data-portal-section="announcements" aria-label="Announcements">
      <p className="pp-section-eyebrow">Announcements</p>
      <div className="portal-announce-list">
        {published.map((a) => (
          <article key={a.id} className={`portal-announce-card${a.pinned ? ' is-pinned' : ''}`}>
            <div className="portal-announce-meta">
              {a.pinned && <span className="portal-announce-pin">Pinned</span>}
              <time>{formatWhen(a.publishedAt || a.createdAt || '')}</time>
            </div>
            <h3>{a.title}</h3>
            <p>{a.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
