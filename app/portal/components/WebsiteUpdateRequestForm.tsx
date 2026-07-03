'use client';

import { useState } from 'react';

const REQUEST_TYPES = [
  'Profile copy',
  'Highlight video',
  'Photo update',
  'Camp or event',
  'Stats or achievement',
  'Other',
];

export default function WebsiteUpdateRequestForm({
  portalType,
  slug,
}: {
  portalType: 'athlete' | 'parent';
  slug: string;
}) {
  const [type, setType] = useState(REQUEST_TYPES[0]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus('');

    try {
      const res = await fetch('/api/website-update-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portalType, slug, type, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not submit update request.');
      setMessage('');
      setStatus('Request sent to CPR for admin approval.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not submit update request.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="website-request-panel" data-orbie-target="website-update-request">
      <div>
        <p className="pp-section-eyebrow">Website Updates</p>
        <h2>Request a profile or website change</h2>
        <p>
          Send new photos, video notes, accomplishments, or copy changes to CPR. The admin team
          reviews requests before anything is published.
        </p>
      </div>
      <form onSubmit={submitRequest}>
        <label>
          <span>Request Type</span>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            {REQUEST_TYPES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          <span>What should CPR review?</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Example: Please replace my profile video with this new link and mention the latest tournament result."
            required
            maxLength={1600}
          />
        </label>
        <div className="website-request-actions">
          <button type="submit" disabled={busy || message.trim().length < 5}>
            {busy ? 'Sending...' : 'Send for approval'}
          </button>
          {status && <span>{status}</span>}
        </div>
      </form>
    </section>
  );
}
