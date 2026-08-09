'use client';

import { Fragment, useMemo, useState } from 'react';
import type { AthleteAdmin } from '@/lib/athletes';
import { hasAthletePhoto } from '@/lib/athlete-photo';
import { getRegistrantProgress, sortByNewest } from '@/lib/registrant-progress';
import AdminRegistrantProfileEditor from './AdminRegistrantProfileEditor';

interface Props {
  athletes: AthleteAdmin[];
  live: boolean;
}

export default function AdminRegistrants({ athletes, live }: Props) {
  const [playerRows, setPlayerRows] = useState(athletes);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [busyId, setBusyId] = useState('');
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('');

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

  async function replacePhoto(athlete: AthleteAdmin, file?: File) {
    if (!file) return;
    setBusyId(athlete.id);
    setMessage('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('kind', 'admin-player-profile');
      const uploadResponse = await fetch('/api/upload', { method: 'POST', body: form });
      const upload = await uploadResponse.json() as { url?: string; error?: string };
      if (!uploadResponse.ok || !upload.url) throw new Error(upload.error || 'Photo upload failed.');

      const updateResponse = await fetch(`/api/admin/athletes/${encodeURIComponent(athlete.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl: upload.url }),
      });
      const update = await updateResponse.json() as { error?: string };
      if (!updateResponse.ok) throw new Error(update.error || 'Profile photo could not be updated.');

      setPlayerRows((current) => current.map((row) => row.id === athlete.id ? { ...row, photoUrl: upload.url! } : row));
      setMessage(`${athlete.firstName} ${athlete.lastName}'s profile photo was updated.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Profile photo could not be updated.');
    } finally {
      setBusyId('');
    }
  }

  async function removePhoto(athlete: AthleteAdmin) {
    const name = `${athlete.firstName} ${athlete.lastName}`.trim() || 'this player';
    if (!window.confirm(`Remove ${name}'s profile photo?`)) return;
    setBusyId(athlete.id);
    setMessage('');
    try {
      const response = await fetch(`/api/admin/athletes/${encodeURIComponent(athlete.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl: '' }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || 'Profile photo could not be removed.');
      setPlayerRows((current) => current.map((row) => row.id === athlete.id ? { ...row, photoUrl: '' } : row));
      setMessage(`${name}'s profile photo was removed.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Profile photo could not be removed.');
    } finally {
      setBusyId('');
    }
  }

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

      <div className="admission-stats registrant-stats">
        <div><span>Total registrants</span><b>{stats.total}</b></div>
        <div><span>Profiles created</span><b>{stats.withProfile}</b></div>
        <div><span>Agreements</span><b>{stats.agreements}</b></div>
        <div><span>Portal active</span><b>{stats.portalActive}</b></div>
        <div><span>Pending review</span><b>{stats.pending}</b></div>
      </div>

      {message ? <p className="pm-message" role="status">{message}</p> : null}

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
                    <td colSpan={6} className="empty">No registrants match your filters.</td>
                  </tr>
                )}
                {rows.map((athlete) => {
                  const progress = getRegistrantProgress(athlete);
                  const busy = busyId === athlete.id;
                  const pendingCount = athlete.pendingUpdates?.length ?? 0;
                  const showPhoto = hasAthletePhoto(athlete.photoUrl);
                  return (
                    <Fragment key={athlete.id}>
                    <tr>
                      <td>
                        <div className="bold">{athlete.firstName} {athlete.lastName}</div>
                        <div className="sub">{athlete.email || athlete.parentEmail || 'No email'}</div>
                        {athlete.parentName && <div className="sub">Parent: {athlete.parentName}</div>}
                        {pendingCount > 0 ? (
                          <div className="sub">
                            <a href="/admin?tab=outreach#players">{pendingCount} family update{pendingCount === 1 ? '' : 's'} awaiting review</a>
                          </div>
                        ) : null}
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
                        <div className="inline-grid">
                          {showPhoto ? (
                            <img className="player-thumb" src={athlete.photoUrl} alt={`${athlete.firstName} ${athlete.lastName} profile`} />
                          ) : (
                            <div className="player-thumb-empty">No photo</div>
                          )}
                          <div className="action-row">
                            {progress.adminProfileUrl ? (
                              <a href={progress.adminProfileUrl} target="_blank" rel="noopener noreferrer">
                                View profile
                              </a>
                            ) : null}
                            <button type="button" disabled={busy} onClick={() => setEditingId(editingId === athlete.id ? '' : athlete.id)}>
                              {editingId === athlete.id ? 'Close editor' : 'Edit profile'}
                            </button>
                            <label className="ghost" style={{ cursor: busy ? 'wait' : 'pointer' }}>
                              {busy ? 'Working…' : showPhoto ? 'Replace photo' : 'Add photo'}
                              <input
                                type="file"
                                accept="image/*"
                                disabled={busy}
                                style={{ display: 'none' }}
                                onChange={(event) => {
                                  const file = event.target.files?.[0];
                                  event.target.value = '';
                                  void replacePhoto(athlete, file);
                                }}
                              />
                            </label>
                            {showPhoto ? (
                              <button type="button" className="ghost" disabled={busy} onClick={() => void removePhoto(athlete)}>
                                Remove photo
                              </button>
                            ) : null}
                            <button type="button" className="danger" disabled={busy} onClick={() => void deleteProfile(athlete)}>
                              Delete profile
                            </button>
                          </div>
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{athlete.submittedAt || '—'}</td>
                    </tr>
                    {editingId === athlete.id ? (
                      <tr>
                        <td colSpan={6}>
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
                        </td>
                      </tr>
                    ) : null}
                    </Fragment>
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
