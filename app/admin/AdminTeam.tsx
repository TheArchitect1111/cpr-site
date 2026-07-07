'use client';

import { useState } from 'react';

type Member = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
};

export default function AdminTeam({ canInvite, initialMembers, live, showHeader = true }: {
  canInvite: boolean;
  initialMembers: Member[];
  live: boolean;
  showHeader?: boolean;
}) {
  const [members, setMembers] = useState(initialMembers);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [tempPassword, setTempPassword] = useState('');

  async function reload() {
    const res = await fetch('/api/admin/users');
    const json = await res.json();
    if (res.ok) setMembers(json.members || []);
  }

  function generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let out = '';
    const values = new Uint32Array(14);
    crypto.getRandomValues(values);
    for (let i = 0; i < values.length; i += 1) out += chars[values[i] % chars.length];
    return `${out}!`;
  }

  async function setTemp(email: string, name: string) {
    const password = tempPassword.trim() || generatePassword();
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, tempPassword: password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not set temporary password');
      setMessage(`Secure temporary access prepared for ${email}: ${password}. Share it securely and confirm they update it under Account Settings.`);
      setTempPassword('');
      await reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not set temporary password.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not add user');
      setMessage(`Access assigned to ${json.member.email}. Confirm their role matches what they should operate.`);
      setName('');
      setEmail('');
      setPassword('');
      await reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not add user.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-team">
      {showHeader && (
        <>
          <h2>Admin team</h2>
          <p className="admin-team-sub">
            One login for CPR owner tools, team access, and Pulse. {!live && 'Team access is running in setup mode until production access is connected.'}
          </p>
        </>
      )}

      {canInvite && (
        <div className="admin-team-quick">
          <label>
            Temporary password (leave blank to auto-generate)
            <input
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              placeholder="Auto-generate a strong one"
            />
          </label>
          <button
            type="button"
            onClick={() => setTemp('mikecprglobal@mississaugamagic.com', 'Mike')}
            disabled={busy}
          >
            {busy ? 'Preparing access…' : 'Prepare secure access for Mike'}
          </button>
          {message && <p className="admin-team-message">{message}</p>}
        </div>
      )}

      <div className="admin-team-list">
        {members.length === 0 ? (
          <p>No action needed right now. Recommended next step: confirm the owner account before inviting additional operators.</p>
        ) : (
          <ul>
            {members.map((member) => (
              <li key={member.id}>
                <strong>{member.name}</strong> — {member.email} · {member.role} · {member.status}
                {canInvite && (
                  <button
                    type="button"
                    className="admin-team-temp-btn"
                    onClick={() => setTemp(member.email, member.name)}
                    disabled={busy}
                  >
                    Prepare secure access
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {canInvite && (
        <form className="admin-team-form" onSubmit={handleSubmit}>
          <h3>Assign operator access</h3>
          <label>Name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          <label>
            Role
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
          </label>
          <button type="submit" disabled={busy}>{busy ? 'Assigning access…' : 'Assign access'}</button>
        </form>
      )}
      {!canInvite && message && <p className="admin-team-message">{message}</p>}
    </section>
  );
}
