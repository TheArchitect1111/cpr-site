'use client';

import { useState, useMemo } from 'react';
import type { AthleteActivity } from '@/lib/activity-data';

function ChassisPageHeader({ title, description, actions }: { title: string; description: React.ReactNode; actions?: React.ReactNode }) {
  return <header className="ea-page-header"><div><h1>{title}</h1><p>{description}</p></div>{actions}</header>;
}

function ChassisDemoPill({ children }: { children: React.ReactNode }) {
  return <span className="demo-pill">{children}</span>;
}

function ChassisAlert({ children }: { tone?: string; children: React.ReactNode }) {
  return <div className="ea-alert">{children}</div>;
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

function ChassisStatusBadge({ children, className = '' }: { tone?: string; className?: string; children: React.ReactNode }) {
  return <span className={`ea-status-badge ${className}`}>{children}</span>;
}

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

function scoreTone(score: number): string {
  if (score >= 70) return 'interested';
  if (score >= 40) return 'maybe';
  return 'not-interested';
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
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSort(col);
        }
      }}
    >
      {label}
      {active ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
    </th>
  );
}

interface Props {
  athletes: AthleteActivity[];
  live: boolean;
  showHeader?: boolean;
}

export default function AdminActivity({ athletes, live, showHeader = true }: Props) {
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
      {showHeader && (
        <ChassisPageHeader
          title="ATHLETE ACTIVITY"
          description={<>{athletes.length} athlete{athletes.length !== 1 ? 's' : ''} &middot; <span className={inactive14 > 0 ? 'ea-risk-text' : undefined}>{inactive14} inactive 14+ days</span></>}
          actions={!live && <ChassisDemoPill>SAMPLE DATA &middot; connect production data to go live</ChassisDemoPill>}
        />
      )}

      {inactive14 > 0 && (
        <ChassisAlert tone="danger">
          {inactive14} athlete{inactive14 !== 1 ? 's have' : ' has'} not logged in for 14+ days. Consider proactive outreach.
        </ChassisAlert>
      )}

      <ChassisWorkspace>
        <ChassisTableSurface>
          <ChassisFilterBar>
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
            <span className="ea-filter-hint">
              Click any column header to sort
            </span>
          </ChassisFilterBar>

          <ChassisTableScroll>
            <table className="otable activity-table">
              <thead>
                <tr>
                  <SortTh col="name" label="Athlete" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortTh col="gradYear" label="Grad" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortTh col="lastLogin" label="Last Login" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <th>Login Type</th>
                  <SortTh col="totalLogins" label="Logins" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortTh col="onboarding" label="Onboarding" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortTh col="score" label="Score" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  <SortTh col="tickets" label="Open Tickets" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <ChassisEmptyTableCell colSpan={8}>No action needed right now. What this means: no athletes match this report view; clear filters or return to Attention.</ChassisEmptyTableCell>
                  </tr>
                )}
                {filtered.map((a) => {
                  const isInactive = a.daysSinceLogin === null || a.daysSinceLogin >= 14;
                  const pct = Math.round((a.onboardingSteps / 7) * 100);
                  return (
                    <tr key={a.id} className={isInactive ? 'ea-risk-row' : ''}>
                      <td>
                        <div className="bold">{a.firstName} {a.lastName}</div>
                        <div className="sub">{a.slug}</div>
                      </td>
                      <td>{a.gradYear || '-'}</td>
                      <td className="nowrap">
                        <span className={isInactive ? 'ea-risk-text' : undefined}>
                          {formatLastLogin(a.lastLogin, a.daysSinceLogin)}
                        </span>
                        {isInactive && (
                          <ChassisStatusBadge tone="not-interested" className="ea-inline-pill">
                            {a.daysSinceLogin === null ? 'NEVER' : 'INACTIVE'}
                          </ChassisStatusBadge>
                        )}
                      </td>
                      <td>
                        {a.lastLoginType ? (
                          <ChassisStatusBadge tone={a.lastLoginType === 'Athlete' ? 'follow-up' : 'maybe'}>
                            {a.lastLoginType}
                          </ChassisStatusBadge>
                        ) : (
                          <span className="no">-</span>
                        )}
                      </td>
                      <td>{a.totalLogins}</td>
                      <td>
                        <div className="nowrap">
                          <span className="ea-progress-value">{a.onboardingSteps}/7</span>
                          <span className="sub ea-progress-sub">{pct}%</span>
                        </div>
                        <div className="ea-mini-progress">
                          <div className={pct === 100 ? 'complete' : ''} style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td>
                        <span
                          className={`pill ${scoreTone(a.engagementScore)} score-pill`}
                          style={{
                            background: scoreBg(a.engagementScore),
                            color: scoreColor(a.engagementScore),
                          }}
                        >
                          {a.engagementScore}
                        </span>
                      </td>
                      <td>
                        {a.openTicketCount > 0 ? (
                          <ChassisStatusBadge tone="follow-up">{a.openTicketCount} open</ChassisStatusBadge>
                        ) : (
                          <span className="no">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ChassisTableScroll>
          <div className="count">
            {filtered.length} athlete{filtered.length !== 1 ? 's' : ''}
            {gradYearFilter !== 'All' && ` (Class of ${gradYearFilter})`}
          </div>
        </ChassisTableSurface>
      </ChassisWorkspace>
    </>
  );
}
