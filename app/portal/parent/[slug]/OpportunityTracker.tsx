import type { Opportunity } from '@/lib/portal-data';

const STATUS_CLASS: Record<string, string> = {
  'Interested':           'pp-badge-interested',
  'Contacted':            'pp-badge-contacted',
  'Responded':            'pp-badge-responded',
  'Evaluation Scheduled': 'pp-badge-evaluation',
  'Showcase Attended':    'pp-badge-showcase',
  'Campus Visit':         'pp-badge-campus',
  'Offer Received':       'pp-badge-offer',
};

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function OpportunityTracker({
  opportunities,
}: {
  opportunities: Opportunity[];
}) {
  return (
    <section className="pp-section">
      <p className="pp-section-eyebrow">Recruiting Pipeline</p>
      <h2 className="pp-section-title">School and Coach Interest Tracker</h2>

      {opportunities.length === 0 ? (
        <div className="pp-opp-empty">
          <p>
            Your recruiting opportunities will appear here as CPR identifies and tracks
            interest from schools and coaches. Check back as your athlete gets active in
            camps and showcases.
          </p>
        </div>
      ) : (
        <div className="pp-opp-table-wrap">
          <table className="pp-opp-table">
            <thead>
              <tr>
                <th>School</th>
                <th>Status</th>
                <th>Last Contact</th>
                <th>Follow-Up Date</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map(opp => {
                const badgeClass = STATUS_CLASS[opp.status] || 'pp-badge-interested';
                const lastContact = formatDate(opp.lastContactDate);
                const followUp = formatDate(opp.followUpDate);
                return (
                  <tr key={opp.id}>
                    <td>
                      <div className="pp-opp-name">{opp.schoolName || '--'}</div>
                      {opp.coachName && (
                        <div className="pp-opp-coach">{opp.coachName}</div>
                      )}
                    </td>
                    <td>
                      <span className={`pp-badge ${badgeClass}`}>
                        {opp.status || 'Unknown'}
                      </span>
                    </td>
                    <td>
                      {lastContact
                        ? <span className="pp-opp-date">{lastContact}</span>
                        : <span className="pp-opp-nodate">--</span>}
                    </td>
                    <td>
                      {followUp
                        ? <span className="pp-opp-date">{followUp}</span>
                        : <span className="pp-opp-nodate">--</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
