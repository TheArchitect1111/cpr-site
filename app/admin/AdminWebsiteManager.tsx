'use client';

import { useMemo, useState } from 'react';
import type { WebsiteUpdateRequest } from '@/lib/website-update-requests';
import WebsiteBuilderExperience from '@/app/portal/components/WebsiteBuilderExperience';

type Props = {
  requests: WebsiteUpdateRequest[];
  live: boolean;
};

export default function AdminWebsiteManager({ requests, live }: Props) {
  const [items, setItems] = useState(requests);
  const [busyId, setBusyId] = useState('');
  const [message, setMessage] = useState('');

  const pending = useMemo(
    () => items.filter((item) => item.status === 'Open' || item.status === 'Pending'),
    [items],
  );

  async function decide(id: string, decision: 'approved' | 'rejected') {
    setBusyId(id);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/website-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not update request.');
      setItems((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, status: decision === 'approved' ? 'Resolved' : 'Closed' }
            : item,
        ),
      );
      setMessage(decision === 'approved' ? 'Request approved.' : 'Request rejected.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not update request.');
    } finally {
      setBusyId('');
    }
  }

  return (
    <>
      <header className="ahead">
        <div>
          <h1 className="display">WEBSITE &amp; APPROVALS</h1>
          <p>Review client website requests, approve what belongs, then publish from the admin builder.</p>
        </div>
        {!live && <span className="demo-pill">SAMPLE DATA · staging approval flow</span>}
      </header>

      <section className="website-approval-board" data-orbie-target="website-approval-board">
        <div className="pm-head">
          <div>
            <h2>Client Update Requests</h2>
            <p>Kids and parents submit requests from their Update Portal. Admin decides what gets published.</p>
          </div>
          <span className="review-badge">{pending.length} pending</span>
        </div>

        {message && <div className="pm-message">{message}</div>}

        <div className="website-request-list">
          {items.length === 0 && (
            <p className="empty">No website update requests yet.</p>
          )}
          {items.map((item) => (
            <article key={item.id} className="website-request-card" data-orbie-target="website-request-card">
              <div>
                <span className={`pill st ${item.status === 'Resolved' ? 'active' : item.status === 'Closed' ? 'closed' : 'pending'}`}>
                  {item.status}
                </span>
                <h3>{item.subject.replace('Website update request: ', '')}</h3>
                <p>{item.message}</p>
                <div className="website-request-meta">
                  <span>{item.athleteName}</span>
                  <span>{item.athleteSlug}</span>
                  <span>{item.dateSubmitted || 'No date'}</span>
                </div>
              </div>
              <div className="website-request-admin-actions">
                <a href={`/portal/athlete/${item.athleteSlug}/updates`} target="_blank" rel="noopener noreferrer">
                  View portal
                </a>
                <button
                  type="button"
                  data-orbie-target="approve-website-request"
                  disabled={busyId === item.id || item.status === 'Resolved'}
                  onClick={() => decide(item.id, 'approved')}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="danger"
                  disabled={busyId === item.id || item.status === 'Closed'}
                  onClick={() => decide(item.id, 'rejected')}
                >
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <WebsiteBuilderExperience />
    </>
  );
}
