'use client';

import { useState } from 'react';
import type { Ticket } from '@/lib/sections-data';

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
}

function statusClass(status: string): string {
  const s = status.toLowerCase();
  if (s === 'open') return 'ask-status-open';
  if (s === 'resolved') return 'ask-status-resolved';
  return 'ask-status-closed';
}

interface Props {
  initialTickets: Ticket[];
}

export default function AskCprSection({ initialTickets }: Props) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('/api/ask-cpr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.trim(), message: message.trim() }),
      });
      const data = (await res.json()) as { ticket?: Ticket; error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Failed to submit ticket.');
        return;
      }
      if (data.ticket) setTickets((prev) => [data.ticket!, ...prev]);
      setSubject('');
      setMessage('');
      setSuccess(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="sec-card">
        <div className="sec-label">SUBMIT A QUESTION</div>
        <h1 className="sec-heading">Ask CPR</h1>
        <p className="sec-sub">
          Have a question about your recruiting process? Send it directly to Coach Mike and
          the CPR team.
        </p>

        {success && (
          <div className="ask-success" style={{ marginBottom: 18 }}>
            &#10003; Your question has been submitted. We will respond within 1 business day.
          </div>
        )}
        {error && (
          <div className="ask-error" style={{ marginBottom: 18 }}>
            {error}
          </div>
        )}

        <form className="ask-form" onSubmit={handleSubmit}>
          <div className="ask-field">
            <label htmlFor="ask-subject">Subject</label>
            <input
              id="ask-subject"
              type="text"
              className="ask-input"
              placeholder="e.g. Question about D2 eligibility"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              required
              disabled={submitting}
            />
          </div>
          <div className="ask-field">
            <label htmlFor="ask-message">Message</label>
            <textarea
              id="ask-message"
              className="ask-textarea"
              placeholder="Describe your question or situation in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={5000}
              required
              disabled={submitting}
            />
          </div>
          <button type="submit" className="ask-btn" disabled={submitting || !subject.trim() || !message.trim()}>
            {submitting ? 'Submitting...' : 'Submit Question'}
          </button>
        </form>
      </div>

      {tickets.length > 0 && (
        <div className="sec-card">
          <div className="ask-history-label">Your Previous Questions</div>
          <div className="ask-history">
            {tickets.map((t) => (
              <div key={t.id} className="ask-ticket">
                <div className="ask-ticket-head">
                  <div className="ask-ticket-subject">{t.subject}</div>
                  <span className={`ask-status-pill ${statusClass(t.status)}`}>{t.status}</span>
                </div>
                <div className="ask-ticket-date">
                  Submitted {formatDate(t.dateSubmitted)}
                  {t.dateResolved ? ` &middot; Resolved ${formatDate(t.dateResolved)}` : ''}
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.5 }}>{t.message}</div>
                {t.adminNotes && (
                  <div className="ask-ticket-notes">
                    <div className="ask-ticket-notes-label">CPR Response</div>
                    {t.adminNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tickets.length === 0 && (
        <div className="sec-card">
          <div className="sec-empty">
            <div className="sec-empty-icon">&#128172;</div>
            <p>No questions submitted yet. Use the form above to get started.</p>
          </div>
        </div>
      )}
    </div>
  );
}
