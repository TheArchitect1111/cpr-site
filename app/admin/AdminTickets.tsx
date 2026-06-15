'use client';

import { Fragment, useState } from 'react';
import { serverUpdateTicket } from './actions';
import type { Ticket } from '@/lib/sections-data';

function statusClass(status: string): string {
  const s = status.toLowerCase();
  if (s === 'open') return 'pill follow-up';
  if (s === 'resolved') return 'pill interested';
  return 'pill';
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface Props {
  tickets: Ticket[];
  live: boolean;
}

export default function AdminTickets({ tickets, live }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = tickets.filter((t) => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (filter) {
      const q = filter.toLowerCase();
      return (
        t.athleteSlug.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const open = tickets.filter((t) => t.status === 'Open').length;

  return (
    <>
      <header className="ahead">
        <div>
          <h1 className="display">ASK CPR TICKETS</h1>
          <p>
            {open} open {open === 1 ? 'ticket' : 'tickets'} &middot;{' '}
            {tickets.length} total
          </p>
        </div>
        {!live && <span className="demo-pill">SAMPLE DATA &middot; connect Airtable to go live</span>}
      </header>

      <div className="work">
        <div className="table-wrap">
          <div className="filters">
            <input
              type="text"
              placeholder="Search tickets..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All</option>
              <option>Open</option>
              <option>Resolved</option>
              <option>Closed</option>
            </select>
          </div>

          <table className="otable">
            <thead>
              <tr>
                <th>Athlete Slug</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty">No tickets found.</td>
                </tr>
              )}
              {filtered.map((t) => (
                <Fragment key={t.id}>
                  <tr
                    className={expanded === t.id ? 'selrow' : ''}
                    onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                  >
                    <td className="bold">{t.athleteSlug}</td>
                    <td>{t.subject}</td>
                    <td><span className={statusClass(t.status)}>{t.status}</span></td>
                    <td className="sub">{formatDate(t.dateSubmitted)}</td>
                  </tr>
                  {expanded === t.id && (
                    <tr>
                      <td colSpan={4} style={{ padding: '0 10px 16px', background: '#FAFAFA' }}>
                        <div style={{ padding: '14px 0 0' }}>
                          <div className="dlabel">MESSAGE</div>
                          <p className="dnotes">{t.message}</p>

                          <div className="dlabel" style={{ marginTop: 16 }}>UPDATE TICKET</div>
                          <form
                            action={serverUpdateTicket}
                            style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}
                          >
                            <input type="hidden" name="id" value={t.id} />
                            <select
                              name="status"
                              defaultValue={t.status}
                              style={{ padding: '8px 10px', border: '1px solid #DDD', borderRadius: 5, fontSize: 13, background: '#fff' }}
                            >
                              <option>Open</option>
                              <option>Resolved</option>
                              <option>Closed</option>
                            </select>
                            <input
                              type="text"
                              name="adminNotes"
                              defaultValue={t.adminNotes}
                              placeholder="Admin notes (visible to athlete)..."
                              style={{ flex: 1, minWidth: 220, padding: '8px 12px', border: '1px solid #DDD', borderRadius: 5, fontSize: 13 }}
                            />
                            <button
                              type="submit"
                              style={{ padding: '8px 18px', background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 5, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
                            >
                              Save
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          <div className="count">{filtered.length} ticket{filtered.length !== 1 ? 's' : ''}</div>
        </div>
      </div>
    </>
  );
}
