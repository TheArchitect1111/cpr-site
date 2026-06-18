'use client';

import { useState } from 'react';
import type { PaymentStage } from '@/lib/payments';

export default function PaymentClient({ recordId, token, stage, disabled }: { recordId: string; token: string; stage: PaymentStage; disabled: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function pay() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId, token, stage }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error || 'Could not start checkout.');
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start checkout.');
      setBusy(false);
    }
  }

  return (
    <>
      {error && <div className="ferror">{error}</div>}
      <button className="btn" onClick={pay} disabled={disabled || busy}>{busy ? 'OPENING CHECKOUT...' : 'PAY SECURELY'}</button>
    </>
  );
}
