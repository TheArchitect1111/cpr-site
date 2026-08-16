'use client';

import { FormEvent, useState } from 'react';

type Props = { campId: string; campName: string; paymentUrl?: string; waiverText?: string };

export default function CampRegistrationForm({ campId, campName, paymentUrl, waiverText }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);
  const [confirmedPaymentUrl, setConfirmedPaymentUrl] = useState(paymentUrl || '');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    body.waiverAccepted = form.get('waiverAccepted') === 'on' ? 'true' : '';
    try {
      const response = await fetch(`/api/camps/${encodeURIComponent(campId)}/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, gradYear: body.gradYear ? Number(body.gradYear) : undefined, waiverAccepted: Boolean(body.waiverAccepted) }),
      });
      const result = await response.json() as { error?: string; paymentUrl?: string };
      if (!response.ok) throw new Error(result.error || 'Registration could not be completed.');
      setConfirmedPaymentUrl(result.paymentUrl || '');
      setComplete(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Registration could not be completed.');
    } finally { setBusy(false); }
  }

  if (complete) return (
    <section className="camp-registration-complete" role="status">
      <p className="eyebrow">REGISTRATION RECEIVED</p>
      <h2 className="display">YOU’RE REGISTERED</h2>
      <p>Your registration for <strong>{campName}</strong> has been recorded.</p>
      {confirmedPaymentUrl ? <a className="btn" href={confirmedPaymentUrl}>CONTINUE TO PAYMENT</a> : null}
      <a className="subpage-back" href="/camps">← RETURN TO CAMPS</a>
    </section>
  );

  return (
    <form className="camp-registration-form" onSubmit={submit}>
      <div className="camp-registration-grid">
        <label><span>Camper name *</span><input name="camperName" required autoComplete="name" /></label>
        <label><span>Parent or guardian name *</span><input name="parentGuardianName" required autoComplete="name" /></label>
        <label><span>Email *</span><input name="email" type="email" required autoComplete="email" /></label>
        <label><span>Phone *</span><input name="phone" type="tel" required autoComplete="tel" /></label>
        <label><span>Graduation year</span><input name="gradYear" type="number" min="2026" max="2040" /></label>
        <label><span>Emergency contact name *</span><input name="emergencyContactName" required /></label>
        <label><span>Emergency contact phone *</span><input name="emergencyContactPhone" type="tel" required /></label>
        <label className="camp-registration-wide"><span>Registration notes</span><textarea name="notes" rows={4} placeholder="Medical, accessibility, or other information CPR should know" /></label>
        <label className="camp-registration-waiver camp-registration-wide">
          <input name="waiverAccepted" type="checkbox" required />
          <span>{waiverText || 'I am the parent, guardian, or authorized participant and confirm that the information provided is accurate. I acknowledge participation involves normal athletic risks and agree to follow CPR camp safety instructions.'} *</span>
        </label>
        <input name="website" tabIndex={-1} autoComplete="off" className="camp-registration-honeypot" aria-hidden="true" />
      </div>
      {error ? <p className="camp-registration-error" role="alert">{error}</p> : null}
      <button className="btn" disabled={busy}>{busy ? 'SUBMITTING…' : 'COMPLETE REGISTRATION'}</button>
    </form>
  );
}
