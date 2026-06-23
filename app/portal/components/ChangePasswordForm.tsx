'use client';

import { useState } from 'react';

type Props = {
  action: string;
  title?: string;
  description?: string;
};

export default function ChangePasswordForm({
  action,
  title = 'Change Password',
  description = 'Enter your current password, then choose a new password with at least 10 characters including letters and numbers.',
}: Props) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch(action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.get('currentPassword'),
          newPassword: data.get('newPassword'),
          confirmPassword: data.get('confirmPassword'),
        }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error || 'Unable to update password.');
      } else {
        setMessage(json.message || 'Password updated successfully.');
        form.reset();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="account-card">
      <h2 className="display">{title}</h2>
      <p>{description}</p>
      {message ? <div className="account-success">{message}</div> : null}
      {error ? <div className="account-error">{error}</div> : null}
      <form onSubmit={onSubmit}>
        <label>
          Current Password
          <input name="currentPassword" type="password" autoComplete="current-password" required />
        </label>
        <label>
          New Password
          <input name="newPassword" type="password" autoComplete="new-password" minLength={10} required />
        </label>
        <label>
          Confirm New Password
          <input name="confirmPassword" type="password" autoComplete="new-password" minLength={10} required />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save New Password'}
        </button>
      </form>
    </section>
  );
}
