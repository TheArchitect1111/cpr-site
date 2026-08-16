'use client';

import { useMemo, useState } from 'react';
import type { AthleteAdmin } from '@/lib/athletes';
import { hasAthletePhoto } from '@/lib/athlete-photo';
import { getRegistrantProgress, sortByNewest } from '@/lib/registrant-progress';
import AdminRegistrantProfileEditor from './AdminRegistrantProfileEditor';

interface Props {
  athletes: AthleteAdmin[];
  live: boolean;
}

function PlayerPhoto({ athlete }: { athlete: AthleteAdmin }) {
  const [failed, setFailed] = useState(false);
  const showPhoto = !failed && hasAthletePhoto(athlete.photoUrl);

  if (!showPhoto) {
    return <div className="player-thumb-empty player-thumb-lg">No photo</div>;
  }

  return (
    <img
      src={athlete.photoUrl}
      alt={`${athlete.firstName} ${athlete.lastName} profile`}
      onError={() => setFailed(true)}
    />
  );
}

export default function AdminRegistrants({ athletes, live }: Props) {
  const [playerRows, setPlayerRows] = useState(athletes);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [busyId, setBusyId] = useState('');
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ firstName: '', lastName: '', email: '' });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...playerRows]
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
  }, [playerRows, query, statusFilter]);

  const stats = useMemo(() => {
    const active = playerRows.filter((a) => a.status !== 'Archived');
    return {
      total: active.length,
      pending: active.filter((a) => a.status === 'Pending').length,
      withProfile: active.filter((a) => a.slug).length,
      agreements: active.filter((a) => a.termsAgreed || a.agreementSubmitted).length,
      portalActive: active.filter((a) => a.status === 'Active').length,
    };
  }, [playerRows]);

  async function deleteProfile(athlete: AthleteAdmin) {
    const name = `${athlete.firstName} ${athlete.lastName}`.trim() || 'this player';
    if (!window.confirm(`Delete ${name}'s player profile? This removes it from the active CPR site and portal.`)) return;
    setBusyId(athlete.id);
    setMessage('');
    try {
      const response = await fetch(`/api/admin/athletes/${encodeURIComponent(athlete.id)}`, { method: 'DELETE' });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || 'Player profile could not be deleted.');
      setPlayerRows((current) => current.filter((row) => row.id !== athlete.id));
      setMessage(`${name}'s player profile was deleted from the active CPR site and portal.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Player profile could not be deleted.');
    } finally {
      setBusyId('');
    }
  }

  async function createProfile() {
    if (!newPlayer.firstName.trim() || !newPlayer.lastName.trim()) {
      setMessage('First and last name are required.');
      return;
    }
    setBusyId('new');
    setMessage('');
    try {
      const response = await fetch('/api/admin/athletes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newPlayer, status: 'Pending' }),
      });
      const result = await response.json() as { athlete?: AthleteAdmin; error?: string };
      if (!response.ok || !result.athlete) throw new Error(result.error || 'Player profile could not be created.');
      setPlayerRows((current) => [result.athlete!, ...current]);
      setNewPlayer({ firstName: '', lastName: '', email: '' });
      setShowCreate(false);
      setEditingId(result.athlete.id);
      setMessage('Player profile created without an application. Complete the profile below.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Player profile could not be created.');
    } finally {
      setBusyId('');
    }
  }

  return (
    <>
      <header className="ahead">
        <div>
          <h1 className="display">REGISTRANTS &amp; PROGRESS</h1>
          <p>
            Every kid who registers appears here automatically. Add, replace, or remove photos and edit profile text from this list.
          </p>
        </div>
        {!live && <span className="demo-pill">SAMPLE DATA · connect Airtable to go live</span>}
      </header>

      <div className="action-row" style={{ marginBottom: '1rem' }}>
        <button type="button" onClick={() => setShowCreate((current) => !current)}>
          {showCreate ? 'Cancel new profile' : 'Create player without application'}
        </button>
      </div>

      {showCreate ? (
        <div className="registrant-edit-panel" style={{ marginBottom: '1rem' }}>
          <div className="registrant-edit-heading">
            <strong>Create player profile</strong>
            <span>The player does not need to submit an application. You can complete the full profile after creating the record.</span>
          </div>
          <div className="registrant-edit-grid">
            <label>First name<input value={newPlayer.firstName} onChange={(event) => setNewPlayer((current) => ({ ...current, firstName: event.target.value }))} /></label>
            <label>Last name<input value={newPlayer.lastName} onChange={(event) => setNewPlayer((current) => ({ ...current, lastName: event.target.value }))} /></label>
            <label>Email<input type="email" value={newPlayer.email} onChange={(event) => setNewPlayer((current) => ({ ...current, email: event.target.value }))} /></label>
          </div>
          <div className="action-row">
            <button type="button" disabled={busyId === 'new'} onClick={() => void createProfile()}>
              {busyId === 'new' ? 'Creating…' : 'Create and edit profile'}
            </button>
          </div>
        </div>
      ) : null}

      <div className="admission-stats registrant-stats">
        <div><span>Total registrants</span><b>{stats.total}</b></div>
        <div><span>Profiles created</span><b>{stats.withProfile}</b></div>
        <div><span>Agreements</span><b>{stats.agreements}</b></div>
        <div><span>Portal active</span><b>{stats.portalActive}</b></div>
        <div><span>Pending review</span><b>{stats.pending}</b></div>
      </div>

      {message ? <p className="pm-message" role="status">{message}</p> : null}

      <div className="work">
        <div className="player-card-manager" id="player-profiles">
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

          {rows.length === 0 && <div className="empty player-card-empty">No registrants match your filters.</div>}
          <div className="player-entry-list">
            {rows.map((athlete, index) => {
                  const progress = getRegistrantProgress(athlete);
                  const busy = busyId === athlete.id;
                  const pendingCount = athlete.pendingUpdates?.length ?? 0;
                  return (
                    <section className="player-entry-card" key={athlete.id}>
                      <div className="player-entry-heading">
                        <div className="player-entry-photo">
                          <PlayerPhoto athlete={athlete} />
                        </div>
                        <div className="player-entry-identity">
                          <p className="player-entry-number">Player profile {index + 1}</p>
                          <h3>{athlete.firstName} {athlete.lastName}</h3>
                          <p>{athlete.position || 'Position not entered'} · {athlete.school || 'School not entered'}</p>
                          <p>{athlete.email || athlete.parentEmail || 'No email'}{athlete.parentName ? ` · Parent: ${athlete.parentName}` : ''}</p>
                        </div>
                        <div className="player-entry-status">
                        <span className={`pill st ${athlete.status === 'Active' ? 'active' : 'pending'}`}>
                          {(athlete.status || 'Pending').toUpperCase()}
                        </span>
                          <span className="sub">Submitted {athlete.submittedAt || '—'}</span>
                        </div>
                      </div>
                      <div className="player-entry-progress">
                        <div className="registrant-progress-cell">
                          <span className="registrant-progress-pct">{progress.percent}% complete · {progress.currentStep}</span>
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
                      </div>
                      {pendingCount > 0 ? <a className="review-badge" href="/admin?tab=outreach#players">{pendingCount} family update{pendingCount === 1 ? '' : 's'} awaiting review</a> : null}
                      <div className="action-row player-entry-actions">
                        {progress.adminProfileUrl ? <a href={progress.adminProfileUrl} target="_blank" rel="noopener noreferrer">View profile</a> : null}
                        <button type="button" disabled={busy} onClick={() => setEditingId(editingId === athlete.id ? '' : athlete.id)}>{editingId === athlete.id ? 'Cancel editing' : 'Edit text and picture'}</button>
                        <button type="button" className="danger" disabled={busy} onClick={() => void deleteProfile(athlete)}>{busy ? 'Working…' : 'Delete profile'}</button>
                      </div>
                    {editingId === athlete.id ? (
                          <AdminRegistrantProfileEditor
                            athlete={athlete}
                            onCancel={() => setEditingId('')}
                            onSaved={(next) => {
                              setPlayerRows((current) => current.map((row) => (
                                row.id === athlete.id
                                  ? { ...row, ...next, pendingUpdates: row.pendingUpdates }
                                  : row
                              )));
                              setEditingId('');
                              setMessage(`${athlete.firstName} ${athlete.lastName}'s profile was saved.`);
                            }}
                          />
                    ) : null}
                    </section>
                  );
                })}
          </div>
          <div className="count">Showing {rows.length} registrant{rows.length !== 1 ? 's' : ''}</div>
        </div>
      </div>
    </>
  );
}
