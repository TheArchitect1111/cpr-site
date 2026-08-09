'use client';

import { useMemo, useState } from 'react';
import type { ContentRequestRecord } from '@/lib/content-requests';
import { getQueueRequests } from '@/lib/update-hub-feed';
import {
  eaAmplifiSearchUrl,
  isAmplifiSocialRequest,
  parseAmplifiResearchNotes,
} from '@/lib/amplifi-research-notes';

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
  const amplifiCount = useMemo(
    () =>
      requests.filter(
        (r) =>
          isAmplifiSocialRequest(r.requestType) || Boolean(parseAmplifiResearchNotes(r.additionalNotes)),
      ).length,
    [requests],
  );

  const displayed = requests.filter((request) => {
    if (statusFilter === 'queue') {
      return ['Pending Review', 'In Progress', 'Awaiting Approval', 'Scheduled'].includes(
        request.status,
      );
    }
    if (statusFilter === 'amplifi') {
      return (
        isAmplifiSocialRequest(request.requestType) ||
        Boolean(parseAmplifiResearchNotes(request.additionalNotes))
      );
    }
    if (!statusFilter) return true;
    return request.status === statusFilter;
  });

  function draftFor(request: ContentRequestRecord) {
    return (
      publishDrafts[request.id] ??
      request.publishedContent ??
      request.content ??
      request.description ??
      ''
    );
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
      const data = (await res.json()) as {
        ok?: boolean;
        status?: string;
        datePublished?: string;
        error?: string;
      };
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
        <div>
          <p className="cr-queue-count">{queueCount} in publish queue</p>
          <p className="cr-queue-amplifi-hint">
            {amplifiCount} Amplifi item(s) · Topic Search drafts show sources + date window below
          </p>
        </div>
        <div className="cr-queue-toolbar-actions">
          <a className="owner-secondary" href="/admin/amplifi">
            Amplifi™ admin
          </a>
          <a className="owner-secondary" href={eaAmplifiSearchUrl()} target="_blank" rel="noreferrer">
            Open Amplifi Search
          </a>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="queue">Publish queue</option>
            <option value="amplifi">Amplifi / social only</option>
            <option value="">All statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <p className="update-hub-error">{error}</p> : null}

      {displayed.length === 0 ? (
        <p className="cr-queue-empty">No content requests in this view.</p>
      ) : (
        <div className="cr-queue-list">
          {displayed.map((request) => {
            const research = parseAmplifiResearchNotes(request.additionalNotes);
            const social = isAmplifiSocialRequest(request.requestType) || Boolean(research);
            return (
              <article
                key={request.id}
                className={`cr-queue-card${social ? ' cr-queue-card-amplifi' : ''}`}
              >
                <div className="cr-queue-card-head">
                  <div>
                    <p className="cr-queue-meta">
                      {request.organizationName || request.athleteSlug || 'CPR'}
                      {request.athleteName ? ` · ${request.athleteName}` : ''}
                      {' · '}
                      {request.requestType}
                      {research ? ' · Amplifi Search' : social ? ' · Amplifi social' : ''}
                    </p>
                    <h2>{request.title}</h2>
                    <p className="cr-queue-status">{request.status}</p>
                    {research ? (
                      <p className="cr-queue-research">
                        Topic: <strong>{research.topic}</strong> · {research.dateFrom} →{' '}
                        {research.dateTo}
                      </p>
                    ) : null}
                    {request.videoLink ? (
                      <p className="cr-queue-meta">
                        Source:{' '}
                        <a href={request.videoLink} target="_blank" rel="noreferrer">
                          {request.videoLink}
                        </a>
                      </p>
                    ) : null}
                  </div>
                  <p className="cr-queue-date">{request.dateSubmitted || '—'}</p>
                </div>
                {request.content || request.description ? (
                  <p className="cr-queue-desc">{request.content || request.description}</p>
                ) : null}
                {research?.sources?.length ? (
                  <div className="cr-queue-sources">
                    <p className="cr-queue-sources-label">Research sources</p>
                    <ul>
                      {research.sources.map((source) => (
                        <li key={source.url}>
                          <a href={source.url} target="_blank" rel="noreferrer">
                            {source.title || source.url}
                          </a>
                          <span>
                            {' '}
                            · {source.kind}
                            {source.publishedAt ? ` · ${source.publishedAt}` : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <label className="cr-queue-publish-label">
                  {social ? 'Publish caption (Amplifi)' : 'Published content'}
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
                    {social ? 'Approve & publish social' : 'Publish'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
