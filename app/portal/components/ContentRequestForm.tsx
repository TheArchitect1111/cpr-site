'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const REQUEST_TYPES = [
  'Profile Update',
  'Recruiting News',
  'Game Result',
  'Highlight / Film',
  'Announcement',
  'Schedule Update',
  'Academic Update',
  'General Update',
];

type Props = {
  slug: string;
  portalType: 'athlete' | 'parent';
  athleteName: string;
  updatesUrl: string;
};

export default function ContentRequestForm({ slug, portalType, athleteName, updatesUrl }: Props) {
  const router = useRouter();
  const [requestType, setRequestType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ requestId?: string } | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!requestType || !title.trim()) {
      setError('Choose a request type and add a title.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/portal/content-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          requestType,
          title: title.trim(),
          description: description.trim(),
          priority,
        }),
      });
      const data = (await res.json()) as { requestId?: string; error?: string };
      if (!res.ok) {
        setError(data.error || 'Request could not be submitted.');
        return;
      }
      setDone({ requestId: data.requestId });
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="update-hub-request-form">
        <p className="pp-portal-label">Update Hub™</p>
        <h1>Request received</h1>
        <p>
          Your update request for {athleteName} was submitted
          {done.requestId ? ` (ID: ${done.requestId})` : ''}. Status: Pending Review.
        </p>
        <a className="owner-primary owner-link-cta" href={updatesUrl}>
          Back to Update Hub
        </a>
      </div>
    );
  }

  return (
    <div className="update-hub-request-form">
      <p className="pp-portal-label">Update Hub™</p>
      <h1>Request an update</h1>
      <p>
        Submit a content request for {athleteName}. CPR staff will review and publish it to the Update Hub.
        {portalType === 'parent' ? ' Parents can request updates on behalf of their athlete.' : ''}
      </p>

      <form onSubmit={handleSubmit} className="update-hub-request-fields">
        <label>
          Request type
          <select value={requestType} onChange={(e) => setRequestType(e.target.value)} required>
            <option value="">Select type…</option>
            {REQUEST_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label>
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short headline for the update"
            required
          />
        </label>

        <label>
          Details
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="What should be published? Include dates, schools, stats, or links."
          />
        </label>

        <label>
          Priority
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </label>

        {error ? <p className="update-hub-error">{error}</p> : null}

        <div className="update-hub-request-actions">
          <button type="submit" className="owner-primary" disabled={busy}>
            {busy ? 'Submitting…' : 'Submit request'}
          </button>
          <a className="owner-secondary owner-link-cta" href={updatesUrl}>
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
