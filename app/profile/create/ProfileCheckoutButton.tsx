'use client';

import { useState } from 'react';

export default function ProfileCheckoutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <>
      {error ? <p className="profile-purchase-error">{error}</p> : null}
      <button className="profile-purchase-button" type="button" onClick={checkout} disabled={busy}>
        {busy ? 'OPENING SECURE CHECKOUT...' : 'CREATE YOUR PLAYER PROFILE | $75'}
      </button>
    </>
  );
}
