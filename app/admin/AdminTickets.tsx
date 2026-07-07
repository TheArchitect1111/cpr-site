'use client';

import { Fragment, useState } from 'react';
import { serverUpdateTicket } from './actions';
import type { Ticket } from '@/lib/sections-data';

function ChassisPageHeader({ title, description, actions }: { title: string; description: React.ReactNode; actions?: React.ReactNode }) {
  return <header className="ea-page-header"><div><h1>{title}</h1><p>{description}</p></div>{actions}</header>;
}

function ChassisDemoPill({ children }: { children: React.ReactNode }) {
  return <span className="demo-pill">{children}</span>;
}

function ChassisWorkspace({ children }: { children: React.ReactNode }) {
  return <div className="ea-workspace">{children}</div>;
}

function ChassisTableSurface({ children }: { children: React.ReactNode }) {
  return <section className="ea-table-surface">{children}</section>;
}

function ChassisFilterBar({ children }: { children: React.ReactNode }) {
  return <div className="ea-filter-bar">{children}</div>;
}

function ChassisEmptyTableCell({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return <td colSpan={colSpan} className="ea-empty-cell">{children}</td>;
}

function ChassisStatusBadge({ children }: { tone?: string; children: React.ReactNode }) {
  return <span className="ea-status-badge">{children}</span>;
}

function statusTone(status: string): 'follow-up' | 'interested' | undefined {
  const s = status.toLowerCase();
  if (s === 'open') return 'follow-up';
  if (s === 'resolved') return 'interested';
  return undefined;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface Props {
  tickets: Ticket[];
  live: boolean;
  showHeader?: boolean;
}

export default function AdminTickets({ tickets, live, showHeader = true }: Props) {
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
  const toggleTicket = (id: string) => setExpanded(expanded === id ? null : id);

  return (
    <>
      {showHeader && (
        <ChassisPageHeader
          title="ASK CPR TICKETS"
          description={<>{open} open {open === 1 ? 'ticket' : 'tickets'} &middot; {tickets.length} total</>}
          actions={!live && <ChassisDemoPill>SAMPLE DATA &middot; connect production data to go live</ChassisDemoPill>}
        />
      )}

      <ChassisWorkspace>
        <ChassisTableSurface>
          <ChassisFilterBar>
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
          </ChassisFilterBar>

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
                  <ChassisEmptyTableCell colSpan={4}>No action needed right now. What this means: no tickets match this view; clear filters or return to Attention.</ChassisEmptyTableCell>
                </tr>
              )}
              {filtered.map((t) => (
                <Fragment key={t.id}>
                  <tr
                    className={expanded === t.id ? 'selrow' : ''}
                    role="button"
                    tabIndex={0}
                    aria-expanded={expanded === t.id}
                    onClick={() => toggleTicket(t.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        toggleTicket(t.id);
                      }
                    }}
                  >
                    <td className="bold">{t.athleteSlug}</td>
                    <td>{t.subject}</td>
                    <td><ChassisStatusBadge tone={statusTone(t.status)}>{t.status}</ChassisStatusBadge></td>
                    <td className="sub">{formatDate(t.dateSubmitted)}</td>
                  </tr>
                  {expanded === t.id && (
                    <tr>
                      <td colSpan={4} className="ticket-expanded-cell">
                        <div className="ticket-expanded-panel">
                          <div className="dlabel">MESSAGE</div>
                          <p className="dnotes">{t.message}</p>

                          <div className="dlabel ticket-update-label">UPDATE TICKET</div>
                          <form
                            action={serverUpdateTicket}
                            className="ticket-update-form"
                          >
                            <input type="hidden" name="id" value={t.id} />
                            <select
                              name="status"
                              defaultValue={t.status}
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
                            />
                            <button
                              type="submit"
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
        </ChassisTableSurface>
      </ChassisWorkspace>
    </>
  );
}
