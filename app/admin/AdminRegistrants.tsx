'use client';

import { useMemo, useState } from 'react';
import type { AthleteAdmin } from '@/lib/athletes';
import { getRegistrantProgress, sortByNewest } from '@/lib/registrant-progress';

function ChassisPageHeader({ title, description, actions }: { title: string; description: React.ReactNode; actions?: React.ReactNode }) {
  return <header className="ea-page-header"><div><h1>{title}</h1><p>{description}</p></div>{actions}</header>;
}

function ChassisDemoPill({ children }: { children: React.ReactNode }) {
  return <span className="demo-pill">{children}</span>;
}

function ChassisStatGrid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`ea-stat-grid ${className}`}>{children}</div>;
}

function ChassisStatCard({ label, value }: { label: string; value: string | number }) {
  return <div className="ea-stat-card"><span>{label}</span><strong>{value}</strong></div>;
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

function ChassisTableScroll({ children }: { children: React.ReactNode }) {
  return <div className="ea-table-scroll">{children}</div>;
}

function ChassisEmptyTableCell({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return <td colSpan={colSpan} className="ea-empty-cell">{children}</td>;
}

function ChassisStatusBadge({ children }: { status?: string; children: React.ReactNode }) {
  return <span className="ea-status-badge">{children}</span>;
}

interface Props {
  athletes: AthleteAdmin[];
  live: boolean;
  showHeader?: boolean;
}

export default function AdminRegistrants({ athletes, live, showHeader = true }: Props) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...athletes]
      .filter((a) => a.status !== 'Archived')
      .filter((a) => {
        if (statusFilter === 'All') return true;
        if (statusFilter === 'Pending') return a.status === 'Pending';
        if (statusFilter === 'Active') return a.status === 'Active';
        if (statusFilter === 'In progress') return a.status === 'Pending' || !a.feeStage1;
        return true;
      })
      .filter((a) => {
        if (!q) return true;
        const hay = `${a.firstName} ${a.lastName} ${a.email} ${a.parentEmail} ${a.slug}`.toLowerCase();
        return hay.includes(q);
      })
      .sort(sortByNewest);
  }, [athletes, query, statusFilter]);

  const stats = useMemo(() => {
    const active = athletes.filter((a) => a.status !== 'Archived');
    return {
      total: active.length,
      pending: active.filter((a) => a.status === 'Pending').length,
      withProfile: active.filter((a) => a.slug).length,
      agreements: active.filter((a) => a.termsAgreed || a.agreementSubmitted).length,
      portalActive: active.filter((a) => a.status === 'Active').length,
    };
  }, [athletes]);

  return (
    <>
      {showHeader && (
        <ChassisPageHeader
          title="REGISTRANTS &amp; PROGRESS"
          description="Every kid who registers appears here automatically with a recruiting profile and live progress tracking."
          actions={!live && <ChassisDemoPill>SAMPLE DATA &middot; connect production data to go live</ChassisDemoPill>}
        />
      )}

      <ChassisStatGrid className="registrant-stats">
        <ChassisStatCard label="Total registrants" value={stats.total} />
        <ChassisStatCard label="Profiles created" value={stats.withProfile} />
        <ChassisStatCard label="Agreements" value={stats.agreements} />
        <ChassisStatCard label="Portal active" value={stats.portalActive} />
        <ChassisStatCard label="Pending review" value={stats.pending} />
      </ChassisStatGrid>

      <ChassisWorkspace>
        <ChassisTableSurface>
          <ChassisFilterBar>
            <input
              type="search"
              placeholder="Search name, email, or slug…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {['All', 'Pending', 'Active', 'In progress'].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </ChassisFilterBar>

          <ChassisTableScroll>
            <table className="otable registrants-table">
              <thead>
                <tr>
                  <th>Registrant</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Current step</th>
                  <th>Profile</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <ChassisEmptyTableCell colSpan={6}>No action needed right now. What this means: no registrants match this view; clear filters or return to Attention.</ChassisEmptyTableCell>
                  </tr>
                )}
                {rows.map((athlete) => {
                  const progress = getRegistrantProgress(athlete);
                  return (
                    <tr key={athlete.id}>
                      <td>
                        <div className="bold">{athlete.firstName} {athlete.lastName}</div>
                        <div className="sub">{athlete.email || athlete.parentEmail || 'No email'}</div>
                        {athlete.parentName && <div className="sub">Parent: {athlete.parentName}</div>}
                      </td>
                      <td>
                        <ChassisStatusBadge status={athlete.status === 'Active' ? 'active' : 'pending'}>
                          {(athlete.status || 'Pending').toUpperCase()}
                        </ChassisStatusBadge>
                      </td>
                      <td>
                        <div className="registrant-progress-cell">
                          <span className="registrant-progress-pct">{progress.percent}%</span>
                          <div className="registrant-progress-bar">
                            <div className="registrant-progress-fill" style={{ width: `${progress.percent}%` }} />
                          </div>
                          <div className="registrant-progress-steps">
                            {progress.steps.map((step) => (
                              <span
                                key={step.key}
                                className={`registrant-step${step.done ? ' done' : ''}`}
                                title={step.label}
                              >
                                {step.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td>{progress.currentStep}</td>
                      <td>
                        {progress.adminProfileUrl ? (
                          <a href={progress.adminProfileUrl} target="_blank" rel="noopener noreferrer" className="profile-link-btn">
                            View profile →
                          </a>
                        ) : (
                          <span className="no">—</span>
                        )}
                      </td>
                      <td className="nowrap">{athlete.submittedAt || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ChassisTableScroll>
          <div className="count">Showing {rows.length} registrant{rows.length !== 1 ? 's' : ''}</div>
        </ChassisTableSurface>
      </ChassisWorkspace>
    </>
  );
}
