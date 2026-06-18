import '../landing.css';
import '../forms.css';
import { getAthleteByRecordId, verifyAthleteEditToken } from '@/lib/athletes';
import { isPaymentStage, paymentAmountCents, paymentStageLabel } from '@/lib/payments';
import { site } from '@/config/site';
import PaymentClient from './PaymentClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'CPR Payment',
  robots: { index: false, follow: false },
};

function money(cents: number) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: process.env.STRIPE_CURRENCY || 'CAD' }).format(cents / 100);
}

export default async function PayPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const recordId = String(params.id || '');
  const token = String(params.token || '');
  const stageValue = String(params.stage || 'stage1');
  const status = String(params.status || '');
  const stage = isPaymentStage(stageValue) ? stageValue : null;
  const authed = recordId && token && verifyAthleteEditToken(recordId, token) && stage;
  const athlete = authed ? await getAthleteByRecordId(recordId) : null;
  const amount = athlete && stage ? paymentAmountCents(stage, athlete) : 0;

  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <a href="/"><img src={site.brand.logo} alt="CPR" className="nav-logo" /></a>
          <div className="nav-brand display">
            <div className="b1">{site.brand.nameLine1}</div>
            <div className="b2">{site.brand.nameLine2}</div>
            <div className="b3">{site.brand.tagline}</div>
          </div>
        </div>
      </header>
      <div className="form-hero">
        <h1 className="display">CPR PAYMENT</h1>
        <p>Secure payment for Canadian Prospects Recruitment.</p>
      </div>
      <div className="form-wrap">
        <div className="fcard">
          {!athlete ? (
            <div className="fsuccess">
              <h2 className="display">PAYMENT LINK INVALID</h2>
              <p>This payment link is missing or expired. Contact {site.footer.email} for a fresh link.</p>
            </div>
          ) : (
            <>
              {status === 'success' && <div className="fsuccess"><div className="big">&#9989;</div><h2 className="display">PAYMENT RECEIVED</h2><p>Thank you. Stripe will confirm the payment with CPR automatically.</p></div>}
              {status === 'cancelled' && <div className="ferror">Checkout was cancelled. You can try again below.</div>}
              <h2 className="display">{stage ? paymentStageLabel(stage) : 'CPR'} PAYMENT</h2>
              <p className="fsub">{athlete.firstName} {athlete.lastName} - {money(amount)}</p>
              {stage && <PaymentClient recordId={recordId} token={token} stage={stage} disabled={status === 'success'} />}
            </>
          )}
        </div>
      </div>
    </>
  );
}
