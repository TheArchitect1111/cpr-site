'use client';

import { useState, type FormEvent } from 'react';

type ApplicationData = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  currentSchool: string;
  gradYear: string;
  country: string;
  city: string;
  position: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
};

type SubmitResult = {
  ok?: boolean;
  recordId?: string;
  profileWaiverReconciled?: boolean;
  error?: string;
};

const initial: ApplicationData = {
  firstName: '', lastName: '', dateOfBirth: '', phone: '',
  currentSchool: '', gradYear: '', country: '', city: '',
  position: '', parentName: '', parentEmail: '', parentPhone: '',
};

function yearsOld(dateText: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) return null;
  const birth = new Date(`${dateText}T00:00:00Z`);
  if (!Number.isFinite(birth.getTime()) || birth.toISOString().slice(0, 10) !== dateText) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const month = now.getUTCMonth() - birth.getUTCMonth();
  if (month < 0 || (month === 0 && now.getUTCDate() < birth.getUTCDate())) age--;
  return age;
}

export default function ComplimentaryApplicationForm({ email }: { email: string }) {
  const [form, setForm] = useState<ApplicationData>(initial);
  const [guardianApproved, setGuardianApproved] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState<SubmitResult | null>(null);
  const age = yearsOld(form.dateOfBirth);
  const minor = age !== null && age < 18;
  const tooYoung = age !== null && age < 13;

  function update(field: keyof ApplicationData, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (age === null || age < 13) {
      setError('For athletes under 13, contact CPR for guardian-assisted registration.');
      return;
    }
    if (minor && (!form.parentName || !form.parentEmail || !guardianApproved)) {
      setError('A parent or guardian must provide contact details and approve the application.');
      return;
    }
    if (!termsAgreed) {
      setError('Please acknowledge the terms before submitting.');
      return;
    }
    setBusy(true);
    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          email,
          sport: 'Basketball',
          gradYear: form.gradYear ? Number(form.gradYear) : undefined,
          complimentaryProfile: true,
          parentConsent: minor ? guardianApproved : false,
          termsAgreed: true,
        }),
      });
      const data = await response.json() as SubmitResult;
      if (!response.ok || !data.ok || !data.recordId) {
        throw new Error(data.error || 'We could not complete the application.');
      }
      setCompleted(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (completed) {
    return (
      <div className="complimentary-result" role="status">
        <h2>Application received</h2>
        <p>Your athlete application was saved for CPR review.</p>
        {completed.profileWaiverReconciled ? (
          <p><strong>Complimentary profile fee: $0. Your waiver and application are linked.</strong></p>
        ) : (
          <p><strong>Your application was saved, but CPR must review the fee waiver linkage.</strong>
            {' '}Please do not submit a duplicate application.</p>
        )}
        <p>Reference: <span className="complimentary-receipt">{completed.recordId}</span></p>
      </div>
    );
  }

  return (
    <form className="complimentary-application" onSubmit={submit}>
      <h2>Athlete details</h2>
      <div className="complimentary-fields">
        <label>
          First name <span aria-hidden="true">*</span>
          <input type="text" value={form.firstName} onChange={(e) => update('firstName', e.target.value)}
            autoComplete="given-name" maxLength={80} required />
        </label>
        <label>
          Last name <span aria-hidden="true">*</span>
          <input type="text" value={form.lastName} onChange={(e) => update('lastName', e.target.value)}
            autoComplete="family-name" maxLength={80} required />
        </label>
        <label className="complimentary-full">
          Athlete email (verified with the code)
          <input type="email" value={email} readOnly aria-readonly="true" />
        </label>
        <label>
          Date of birth <span aria-hidden="true">*</span>
          <input type="date" value={form.dateOfBirth} max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => update('dateOfBirth', e.target.value)} required />
        </label>
        <label>
          Phone number
          <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)}
            autoComplete="tel" maxLength={40} />
        </label>
        <label>
          Country <span aria-hidden="true">*</span>
          <input type="text" value={form.country} onChange={(e) => update('country', e.target.value)}
            autoComplete="country-name" maxLength={100} placeholder="Bahamas" required />
        </label>
        <label>
          City
          <input type="text" value={form.city} onChange={(e) => update('city', e.target.value)}
            autoComplete="address-level2" maxLength={100} />
        </label>
        <label>
          School <span aria-hidden="true">*</span>
          <input type="text" value={form.currentSchool} onChange={(e) => update('currentSchool', e.target.value)}
            maxLength={150} required />
        </label>
        <label>
          Graduation year
          <input type="number" value={form.gradYear} onChange={(e) => update('gradYear', e.target.value)}
            min="2026" max="2050" step="1" placeholder="2029" />
        </label>
        <label className="complimentary-full">
          Basketball position
          <input type="text" value={form.position} onChange={(e) => update('position', e.target.value)}
            maxLength={80} placeholder="Guard, forward, center, or undecided" />
        </label>
      </div>

      {minor && (
        <section className="complimentary-guardian">
          <h2>Parent or guardian approval</h2>
          <p>A parent or legal guardian must authorize applications for athletes under 18.</p>
          <div className="complimentary-fields">
            <label>
              Guardian full name <span aria-hidden="true">*</span>
              <input type="text" value={form.parentName} onChange={(e) => update('parentName', e.target.value)}
                autoComplete="name" maxLength={150} required />
            </label>
            <label>
              Guardian email <span aria-hidden="true">*</span>
              <input type="email" value={form.parentEmail} onChange={(e) => update('parentEmail', e.target.value)}
                autoComplete="email" maxLength={254} required />
            </label>
            <label className="complimentary-full">
              Guardian phone
              <input type="tel" value={form.parentPhone} onChange={(e) => update('parentPhone', e.target.value)}
                maxLength={40} />
            </label>
          </div>
          <label className="complimentary-check">
            <input type="checkbox" checked={guardianApproved} onChange={(e) => setGuardianApproved(e.target.checked)}
              required />
            I am the parent or legal guardian, or am completing this with their authorization.
          </label>
        </section>
      )}

      {tooYoung && (
        <p className="complimentary-warning" role="alert">
          Athletes under 13 must enroll directly with CPR through a guardian-assisted process.
          This online form does not collect their information.
        </p>
      )}

      <label className="complimentary-check">
        <input type="checkbox" checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)}
          required />
        I confirm the information is accurate and agree that CPR may review the submitted
        athlete details for profile creation. I understand recruiting services and
        scholarship opportunities are not included in this complimentary profile.
      </label>
      {error && <p className="profile-purchase-error" role="alert">{error}</p>}
      <button className="profile-purchase-button" type="submit" disabled={busy || tooYoung || age === null}>
        {busy ? 'SAVING YOUR APPLICATION...' : 'SUBMIT COMPLIMENTARY PROFILE | $0'}
      </button>
      <p className="profile-purchase-secure">
        Profile submissions are reviewed by CPR before promotion.
        No payment information is collected on this form.
      </p>
    </form>
  );
}
