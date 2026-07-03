'use client';

import { useMemo, useState } from 'react';
import type { AthleteAdmin } from '@/lib/athletes';
import { getRegistrantProgress, sortByNewest } from '@/lib/registrant-progress';

interface Props {
  athletes: AthleteAdmin[];
  live: boolean;
}

export default function AdminRegistrants({ athletes, live }: Props) {
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
      <header className="ahead">
        <div>
          <h1 className="display">REGISTRANTS &amp; PROGRESS</h1>
          <p>
            Every kid who registers appears here automatically with a recruiting profile and live progress tracking.
          </p>
        </div>
        {!live && <span className="demo-pill">SAMPLE DATA · connect Airtable to go live</span>}
      </header>

      <div className="admission-stats registrant-stats" data-orbie-target="registrant-stats">
        <div><span>Total registrants</span><b>{stats.total}</b></div>
        <div><span>Profiles created</span><b>{stats.withProfile}</b></div>
        <div><span>Agreements</span><b>{stats.agreements}</b></div>
        <div><span>Portal active</span><b>{stats.portalActive}</b></div>
        <div><span>Pending review</span><b>{stats.pending}</b></div>
      </div>

      <div className="work">
        <div className="table-wrap">
          <div className="filters">
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
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="otable registrants-table" data-orbie-target="registrants-table">
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
                    <td colSpan={6} className="empty">No registrants match your filters.</td>
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
                        <span className={`pill st ${athlete.status === 'Active' ? 'active' : 'pending'}`}>
                          {(athlete.status || 'Pending').toUpperCase()}
                        </span>
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
                      <td style={{ whiteSpace: 'nowrap' }}>{athlete.submittedAt || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="count">Showing {rows.length} registrant{rows.length !== 1 ? 's' : ''}</div>
        </div>
      </div>
    </>
  );
}
