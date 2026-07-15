'use client';

import { useState } from 'react';
import type { PaymentStage } from '@/lib/payments';

type Props = {
  stage: PaymentStage;
  label?: string;
};

export default function PortalPayNowButton({ stage, label = 'Pay now' }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function pay() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/portal/payments/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      });
      const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error || 'Could not open payment link.');
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open payment link.');
      setBusy(false);
    }
  }

  return (
    <div className="portal-pay-actions">
      {error ? <p className="portal-pay-error">{error}</p> : null}
      <button type="button" className="btn" onClick={pay} disabled={busy}>
        {busy ? 'Opening…' : label}
      </button>
    </div>
  );
}
