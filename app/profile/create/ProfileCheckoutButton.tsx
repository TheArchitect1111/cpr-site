'use client';

import { useState } from 'react';

export default function ProfileCheckoutButton() {
  const [busy, setBusy] = useState(false);
  const [waiverBusy, setWaiverBusy] = useState(false);
  const [error, setError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [email, setEmail] = useState('');

  async function checkout() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/payments/profile-checkout', { method: 'POST' });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error || 'Could not open checkout.');
      window.location.assign(data.url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Could not open checkout.');
      setBusy(false);
    }
  }

  async function redeemPromo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWaiverBusy(true);
    setError('');
    try {
      const response = await fetch('/api/payments/profile-waiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, email }),
      });
      const data = await response.json();
      if (!response.ok || !data.waived || !data.url) {
        throw new Error(data.error || 'Could not validate this code.');
      }
      window.location.assign(data.url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Could not validate this code.');
      setWaiverBusy(false);
    }
  }

  return (
    <>
      {error ? <p className="profile-purchase-error" role="alert">{error}</p> : null}
      <button className="profile-purchase-button" type="button" onClick={checkout} disabled={busy || waiverBusy}>
        {busy ? 'OPENING SECURE CHECKOUT...' : 'CREATE YOUR PLAYER PROFILE | $100'}
      </button>
      <form className="profile-promo-form" onSubmit={redeemPromo}>
        <h2>Have a complimentary profile code?</h2>
        <p>Enter the private code CPR provided and the athlete's email address to waive the $100 profile fee.</p>
        <label htmlFor="cpr-promo-code">Promotion code</label>
        <input
          id="cpr-promo-code"
          name="promoCode"
          type="text"
          autoCapitalize="characters"
          autoComplete="off"
          value={promoCode}
          onChange={(event) => setPromoCode(event.target.value)}
          placeholder="Enter your code"
          maxLength={64}
          required
        />
        <label htmlFor="cpr-promo-email">Athlete email address</label>
        <input
          id="cpr-promo-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@example.com"
          required
        />
        <button className="profile-promo-button" type="submit" disabled={busy || waiverBusy}>
          {waiverBusy ? 'VERIFYING CODE...' : 'APPLY CODE | $0'}
        </button>
        <p className="profile-promo-note">Complimentary codes waive profile creation only, not recruitment services. Use the same email on the application form.</p>
      </form>
    </>
  );
}
