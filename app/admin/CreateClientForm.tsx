'use client';

import { useState } from 'react';

type Credentials = {
  athleteUsername: string;
  athleteTempPassword: string;
  parentUsername: string;
  parentTempPassword: string;
};

type SuccessData = {
  recordId: string;
  slug: string;
  emailsSent: boolean;
  credentials: Credentials;
};

export default function CreateClientForm() {
  const [fields, setFields] = useState({
    athleteFirstName: '',
    athleteLastName: '',
    athleteEmail: '',
    parentName: '',
    parentEmail: '',
    gradYear: '',
    sport: '',
    packagePurchased: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<SuccessData | null>(null);

  function set(k: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFields(prev => ({ ...prev, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!fields.athleteFirstName || !fields.athleteLastName || !fields.parentName || !fields.parentEmail) {
      setError('Athlete name, parent name, and parent email are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/portal/create-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fields),
      });
      const data = await res.json() as { error?: string; ok?: boolean } & Partial<SuccessData>;
      if (!res.ok || !data.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setSuccess(data as SuccessData);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setSuccess(null);
    setError('');
    setFields({ athleteFirstName: '', athleteLastName: '', athleteEmail: '', parentName: '', parentEmail: '', gradYear: '', sport: '', packagePurchased: '' });
  }

  if (success) {
    return (
      <div className="cc-result">
        <div className="cc-success-banner">
          <span className="cc-success-icon">&#10003;</span>
          Client enrolled successfully.
        </div>

        {!success.emailsSent && (
          <div className="cc-warn-banner">
            <strong>Email delivery unavailable.</strong> Share these credentials with the family manually.
          </div>
        )}

        <div className="cc-cred-grid">
          <div className="cc-cred-block">
            <div className="cc-cred-label">ATHLETE CREDENTIALS</div>
            <div className="cc-cred-row">
              <span className="cc-cred-key">Username</span>
              <code className="cc-cred-val">{success.credentials.athleteUsername}</code>
            </div>
            <div className="cc-cred-row">
              <span className="cc-cred-key">Temp Password</span>
              <code className="cc-cred-val">{success.credentials.athleteTempPassword}</code>
            </div>
          </div>

          <div className="cc-cred-block">
            <div className="cc-cred-label">PARENT CREDENTIALS</div>
            <div className="cc-cred-row">
              <span className="cc-cred-key">Username</span>
              <code className="cc-cred-val">{success.credentials.parentUsername}</code>
            </div>
            <div className="cc-cred-row">
              <span className="cc-cred-key">Temp Password</span>
              <code className="cc-cred-val">{success.credentials.parentTempPassword}</code>
            </div>
          </div>
        </div>

        <div className="cc-meta">
          <span>Slug: <code>{success.slug}</code></span>
          <span>Airtable ID: <code>{success.recordId}</code></span>
          {success.emailsSent
            ? <span className="cc-email-ok">Welcome emails sent.</span>
            : <span className="cc-email-fail">Welcome emails NOT sent.</span>}
        </div>

        <div className="cc-login-link">
          Portal login: <a href="/portal/login" target="_blank" rel="noreferrer">/portal/login</a>
        </div>

        <button type="button" className="cc-reset-btn" onClick={handleReset}>
          + Enroll Another Client
        </button>
      </div>
    );
  }

  return (
    <form className="cc-form" onSubmit={handleSubmit} noValidate>
      {error && <div className="cc-error">{error}</div>}

      <div className="cc-section-label">ATHLETE INFO</div>
      <div className="cc-row">
        <div className="cc-field">
          <label>First Name <span className="cc-req">*</span></label>
          <input type="text" value={fields.athleteFirstName} onChange={set('athleteFirstName')} placeholder="Jayden" autoComplete="off" />
        </div>
        <div className="cc-field">
          <label>Last Name <span className="cc-req">*</span></label>
          <input type="text" value={fields.athleteLastName} onChange={set('athleteLastName')} placeholder="Thompson" autoComplete="off" />
        </div>
      </div>
      <div className="cc-field">
        <label>Athlete Email</label>
        <input type="email" value={fields.athleteEmail} onChange={set('athleteEmail')} placeholder="athlete@email.com" autoComplete="off" />
      </div>
      <div className="cc-row">
        <div className="cc-field">
          <label>Graduation Year</label>
          <input type="text" value={fields.gradYear} onChange={set('gradYear')} placeholder="2026" maxLength={4} />
        </div>
        <div className="cc-field">
          <label>Sport</label>
          <input type="text" value={fields.sport} onChange={set('sport')} placeholder="Basketball" />
        </div>
      </div>

      <div className="cc-section-label" style={{ marginTop: 28 }}>PARENT / GUARDIAN INFO</div>
      <div className="cc-row">
        <div className="cc-field">
          <label>Parent Name <span className="cc-req">*</span></label>
          <input type="text" value={fields.parentName} onChange={set('parentName')} placeholder="Mark Thompson" autoComplete="off" />
        </div>
        <div className="cc-field">
          <label>Parent Email <span className="cc-req">*</span></label>
          <input type="email" value={fields.parentEmail} onChange={set('parentEmail')} placeholder="parent@email.com" autoComplete="off" />
        </div>
      </div>

      <div className="cc-section-label" style={{ marginTop: 28 }}>PACKAGE</div>
      <div className="cc-field">
        <label>Package Purchased</label>
        <select value={fields.packagePurchased} onChange={set('packagePurchased')}>
          <option value="">-- Select a package --</option>
          <option value="Starter">Starter</option>
          <option value="Pro">Pro</option>
          <option value="Elite">Elite</option>
          <option value="Custom">Custom</option>
        </select>
      </div>

      <button type="submit" className="cc-submit-btn" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create Client & Send Welcome Emails'}
      </button>
    </form>
  );
}
