'use client';

import { useMemo, useState } from 'react';
import type { ContentRequestRecord } from '@/lib/content-requests';
import { getQueueRequests } from '@/lib/update-hub-feed';

const STATUSES = [
  'Pending Review',
  'In Progress',
  'Awaiting Approval',
  'Needs Additional Information',
  'Scheduled',
  'Published',
  'Completed',
];

export default function ContentRequestsQueue({
  initialData,
}: {
  initialData: ContentRequestRecord[];
}) {
  const [requests, setRequests] = useState(initialData);
  const [statusFilter, setStatusFilter] = useState('queue');
  const [publishDrafts, setPublishDrafts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  const queueCount = useMemo(() => getQueueRequests(requests).length, [requests]);

  const displayed = requests.filter((request) => {
    if (statusFilter === 'queue') {
      return ['Pending Review', 'In Progress', 'Awaiting Approval', 'Scheduled'].includes(
        request.status,
      );
    }
    if (!statusFilter) return true;
    return request.status === statusFilter;
  });

  function draftFor(request: ContentRequestRecord) {
    return publishDrafts[request.id] ?? request.publishedContent ?? request.description ?? '';
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    setError('');
    try {
      const res = await fetch(`/api/admin/content-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok?: boolean; status?: string; datePublished?: string; error?: string };
      if (!res.ok) {
        setError(data.error || 'Update failed.');
        return;
      }
      setRequests((prev) =>
        prev.map((request) => {
          if (request.id !== id) return request;
          const status = body.markPublished
            ? 'Published'
            : body.markScheduled
              ? 'Scheduled'
              : String(body.status ?? request.status);
          return {
            ...request,
            status,
            datePublished: body.markPublished
              ? data.datePublished ?? new Date().toISOString().slice(0, 10)
              : request.datePublished,
            publishedContent: body.publishedBody
              ? String(body.publishedBody)
              : request.publishedContent,
          };
        }),
      );
    } catch {
      setError('Network error.');
    } finally {
      setBusyId('');
    }
  }

  return (
    <div className="cr-queue">
      <div className="cr-queue-toolbar">
        <p className="cr-queue-count">{queueCount} in publish queue</p>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="queue">Publish queue</option>
          <option value="">All statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="update-hub-error">{error}</p> : null}

      {displayed.length === 0 ? (
        <p className="cr-queue-empty">No content requests in this view.</p>
      ) : (
        <div className="cr-queue-list">
          {displayed.map((request) => (
            <article key={request.id} className="cr-queue-card">
              <div className="cr-queue-card-head">
                <div>
                  <p className="cr-queue-meta">
                    {request.athleteSlug}
                    {request.athleteName ? ` · ${request.athleteName}` : ''}
                    {' · '}
                    {request.requestType}
                  </p>
                  <h2>{request.title}</h2>
                  <p className="cr-queue-status">{request.status}</p>
                </div>
                <p className="cr-queue-date">{request.dateSubmitted || '—'}</p>
              </div>
              {request.description ? <p className="cr-queue-desc">{request.description}</p> : null}
              <label className="cr-queue-publish-label">
                Published content
                <textarea
                  rows={3}
                  value={draftFor(request)}
                  onChange={(e) =>
                    setPublishDrafts((prev) => ({ ...prev, [request.id]: e.target.value }))
                  }
                />
              </label>
              <div className="cr-queue-actions">
                <select
                  value={request.status}
                  disabled={busyId === request.id}
                  onChange={(e) => patch(request.id, { status: e.target.value })}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="owner-secondary"
                  disabled={busyId === request.id}
                  onClick={() => patch(request.id, { markScheduled: true })}
                >
                  Schedule
                </button>
                <button
                  type="button"
                  className="owner-primary"
                  disabled={busyId === request.id}
                  onClick={() =>
                    patch(request.id, {
                      markPublished: true,
                      publishedBody: draftFor(request),
                    })
                  }
                >
                  Publish
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
