'use client';

import { useState } from 'react';

type Member = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
};

export default function AdminTeam({ canInvite, initialMembers, live }: {
  canInvite: boolean;
  initialMembers: Member[];
  live: boolean;
}) {
  const [members, setMembers] = useState(initialMembers);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [tempFor, setTempFor] = useState('');
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
      setMessage(`Temp password for ${email}: ${password} — share it securely. They sign in at /admin/login, then change it under Account Settings.`);
      setTempFor('');
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
      setMessage(`Added ${json.member.email}. They can sign in at /admin/login on any device.`);
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
      <h2>Admin team</h2>
      <p className="admin-team-sub">
        One login for CPR admin, portal owner tools, and Pulse. {!live && 'Connect Airtable Admin Users to manage team members in production.'}
      </p>

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
            {busy ? 'Working…' : 'Set temp password for Mike'}
          </button>
          {message && <p className="admin-team-message">{message}</p>}
        </div>
      )}

      <div className="admin-team-list">
        {members.length === 0 ? (
          <p>No team members listed yet.</p>
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
                    Set temp password
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {canInvite && (
        <form className="admin-team-form" onSubmit={handleSubmit}>
          <h3>Add admin user</h3>
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
          <button type="submit" disabled={busy}>{busy ? 'Adding…' : 'Add user'}</button>
        </form>
      )}
      {!canInvite && message && <p className="admin-team-message">{message}</p>}
    </section>
  );
}
