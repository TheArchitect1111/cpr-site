'use client';

import { useState, useMemo } from 'react';
import type { AthleteActivity } from '@/lib/activity-data';

type SortCol = 'name' | 'gradYear' | 'lastLogin' | 'totalLogins' | 'onboarding' | 'score' | 'tickets';
type SortDir = 'asc' | 'desc';

function formatLastLogin(lastLogin: string, daysSince: number | null): string {
  if (!lastLogin || daysSince === null) return 'Never';
  if (daysSince === 0) return 'Today';
  if (daysSince === 1) return '1 day ago';
  return `${daysSince} days ago`;
}

function scoreColor(score: number): string {
  if (score >= 70) return '#1E7A38';
  if (score >= 40) return '#8A6D00';
  return '#A81D20';
}

function scoreBg(score: number): string {
  if (score >= 70) return '#DCF2E2';
  if (score >= 40) return '#FBF0D2';
  return '#FADDDD';
}

function SortTh({
  col,
  label,
  sortCol,
  sortDir,
  onSort,
}: {
  col: SortCol;
  label: string;
  sortCol: SortCol;
  sortDir: SortDir;
  onSort: (col: SortCol) => void;
}) {
  const active = sortCol === col;
  return (
    <th
      onClick={() => onSort(col)}
      className={active ? 'sort-active' : ''}
      style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
    >
      {label}
      {active ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
    </th>
  );
}

interface Props {
  athletes: AthleteActivity[];
  live: boolean;
}

export default function AdminActivity({ athletes, live }: Props) {
  const [sortCol, setSortCol] = useState<SortCol>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [gradYearFilter, setGradYearFilter] = useState('All');

  const gradYears = useMemo(
    () => [...new Set(athletes.map((a) => a.gradYear).filter((y) => y > 0))].sort(),
    [athletes]
  );

  function handleSort(col: SortCol) {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir(col === 'lastLogin' ? 'desc' : 'desc');
    }
  }

  const filtered = useMemo(() => {
    let list = [...athletes];
    if (gradYearFilter !== 'All') {
      list = list.filter((a) => String(a.gradYear) === gradYearFilter);
    }
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortCol) {
        case 'name':
          cmp = `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`);
          break;
        case 'gradYear':
          cmp = a.gradYear - b.gradYear;
          break;
        case 'lastLogin':
          if (!a.lastLogin && !b.lastLogin) cmp = 0;
          else if (!a.lastLogin) cmp = 1;
          else if (!b.lastLogin) cmp = -1;
          else cmp = new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime();
          return sortDir === 'asc' ? -cmp : cmp;
        case 'totalLogins':
          cmp = a.totalLogins - b.totalLogins;
          break;
        case 'onboarding':
          cmp = a.onboardingSteps - b.onboardingSteps;
          break;
        case 'score':
          cmp = a.engagementScore - b.engagementScore;
          break;
        case 'tickets':
          cmp = a.openTicketCount - b.openTicketCount;
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [athletes, sortCol, sortDir, gradYearFilter]);

  const inactive14 = athletes.filter(
    (a) => a.daysSinceLogin === null || a.daysSinceLogin >= 14
  ).length;

  return (
    <>
      <header className="ahead">
        <div>
          <h1 className="display">ATHLETE ACTIVITY</h1>
          <p>
            {athletes.length} athlete{athletes.length !== 1 ? 's' : ''} &middot;{' '}
            <span style={{ color: inactive14 > 0 ? '#A81D20' : undefined, fontWeight: inactive14 > 0 ? 700 : undefined }}>
              {inactive14} inactive 14+ days
            </span>
          </p>
        </div>
        {!live && <span className="demo-pill">SAMPLE DATA &middot; connect Airtable to go live</span>}
      </header>

      {inactive14 > 0 && (
        <div style={{
          background: '#FADDDD',
          color: '#A81D20',
          borderRadius: 7,
          padding: '10px 16px',
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 16,
        }}>
          {inactive14} athlete{inactive14 !== 1 ? 's have' : ' has'} not logged in for 14+ days. Consider proactive outreach.
        </div>
      )}

      <div className="work">
        <div className="table-wrap">
          <div className="filters">
            <select
              value={gradYearFilter}
              onChange={(e) => setGradYearFilter(e.target.value)}
            >
              <option value="All">All Grad Years</option>
              {gradYears.map((y) => (
                <option key={y} value={String(y)}>
                  Class of {y}
                </option>
              ))}
            </select>
            <span style={{ fontSize: 12, color: 'var(--gray)', alignSelf: 'center' }}>
              Click any column header to sort
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="otable" style={{ minWidth: 780 }}>
              <thead>
                <tr>
                  <SortTh col="name" label="Athlete" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortTh col="gradYear" label="Grad" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortTh col="lastLogin" label="Last Login" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <th style={{ whiteSpace: 'nowrap' }}>Login Type</th>
                  <SortTh col="totalLogins" label="Logins" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortTh col="onboarding" label="Onboarding" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortTh col="score" label="Score" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortTh col="tickets" label="Open Tickets" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="empty">No athletes found.</td>
                  </tr>
                )}
                {filtered.map((a) => {
                  const isInactive = a.daysSinceLogin === null || a.daysSinceLogin >= 14;
                  const pct = Math.round((a.onboardingSteps / 7) * 100);
                  return (
                    <tr key={a.id} style={isInactive ? { background: '#FFFAF9' } : {}}>
                      <td>
                        <div className="bold">{a.firstName} {a.lastName}</div>
                        <div className="sub">{a.slug}</div>
                      </td>
                      <td>{a.gradYear || '-'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span style={isInactive ? { color: '#A81D20', fontWeight: 700 } : {}}>
                          {formatLastLogin(a.lastLogin, a.daysSinceLogin)}
                        </span>
                        {isInactive && (
                          <span
                            className="pill not-interested"
                            style={{ marginLeft: 6, fontSize: 10, verticalAlign: 'middle' }}
                          >
                            {a.daysSinceLogin === null ? 'NEVER' : 'INACTIVE'}
                          </span>
                        )}
                      </td>
                      <td>
                        {a.lastLoginType ? (
                          <span className={`pill ${a.lastLoginType === 'Athlete' ? 'follow-up' : 'maybe'}`}>
                            {a.lastLoginType}
                          </span>
                        ) : (
                          <span className="no">-</span>
                        )}
                      </td>
                      <td>{a.totalLogins}</td>
                      <td>
                        <div style={{ whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 700, fontSize: 13 }}>{a.onboardingSteps}/7</span>
                          <span className="sub" style={{ marginLeft: 4 }}>{pct}%</span>
                        </div>
                        <div style={{
                          marginTop: 5,
                          height: 4,
                          width: 72,
                          background: '#EEE',
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: pct === 100 ? '#2BA84A' : 'var(--red)',
                            borderRadius: 2,
                          }} />
                        </div>
                      </td>
                      <td>
                        <span
                          className="pill"
                          style={{
                            background: scoreBg(a.engagementScore),
                            color: scoreColor(a.engagementScore),
                            fontWeight: 800,
                            fontSize: 13,
                            minWidth: 36,
                            display: 'inline-block',
                            textAlign: 'center',
                          }}
                        >
                          {a.engagementScore}
                        </span>
                      </td>
                      <td>
                        {a.openTicketCount > 0 ? (
                          <span className="pill follow-up">{a.openTicketCount} open</span>
                        ) : (
                          <span className="no">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="count">
            {filtered.length} athlete{filtered.length !== 1 ? 's' : ''}
            {gradYearFilter !== 'All' && ` (Class of ${gradYearFilter})`}
          </div>
        </div>
      </div>
    </>
  );
}
