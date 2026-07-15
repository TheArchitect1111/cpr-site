import { site } from '@/config/site';
import type { PortalPaymentsSnapshot } from '@/lib/portal-payments';
import PortalPayNowButton from './PortalPayNowButton';

function money(cents: number) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: process.env.STRIPE_CURRENCY || 'CAD',
  }).format(cents / 100);
}

type Props = {
  snapshot: PortalPaymentsSnapshot;
  portalType: 'athlete' | 'parent';
};

export default function PortalPaymentsPanel({ snapshot, portalType }: Props) {
  const name = [snapshot.firstName, snapshot.lastName].filter(Boolean).join(' ') || 'your athlete';
  const due = snapshot.stages.filter((s) => !s.paid);
  const hasLedger = snapshot.stages.length > 0;

  return (
    <main className="portal-main">
      <div className="pp-welcome" style={{ marginBottom: 24 }}>
        <span className="pp-portal-label">PAYMENTS</span>
        <h1 className="pp-welcome-heading">Program fees</h1>
        <p className="pp-welcome-sub">
          {portalType === 'parent'
            ? `Secure CPR fee payments for ${name}.`
            : 'Secure CPR fee payments for your program.'}
        </p>
      </div>

      {!hasLedger || due.length === 0 ? (
        <div className="fcard" style={{ maxWidth: 560 }}>
          <h2 className="display" style={{ fontSize: '1.25rem', marginBottom: 8 }}>
            No payments due
          </h2>
          <p style={{ margin: 0, lineHeight: 1.5 }}>
            {!hasLedger
              ? `We could not load your payment schedule right now. If you received a payment link from CPR, you can still use it, or email ${site.footer.email}.`
              : `All listed stages are marked paid. Questions? Contact ${site.footer.email}.`}
          </p>
        </div>
      ) : (
        <ul className="portal-pay-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 16, maxWidth: 560 }}>
          {snapshot.stages.map((row) => (
            <li
              key={row.stage}
              className="fcard"
              style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
            >
              <div>
                <strong>{row.label}</strong>
                <p style={{ margin: '4px 0 0', opacity: 0.85 }}>
                  {row.paid ? 'Paid' : money(row.amountCents)}
                </p>
              </div>
              {row.paid ? (
                <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.7 }}>Complete</span>
              ) : (
                <PortalPayNowButton stage={row.stage} />
              )}
            </li>
          ))}
        </ul>
      )}

      <p style={{ marginTop: 28, fontSize: 14, opacity: 0.8, maxWidth: 560 }}>
        Checkout opens on CPR&apos;s secure Stripe payment page. You need an active portal session;
        payment tokens are issued by the server only.
      </p>
    </main>
  );
}
