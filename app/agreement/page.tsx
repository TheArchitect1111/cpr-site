'use client';
import '../landing.css';
import '../forms.css';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { site } from '@/config/site';

function AgreementForm() {
  const params = useSearchParams();
  const [f, setF] = useState<Record<string, string>>({ email: params.get('email') || '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  const set = (k: string, val: string) => setF(p => ({ ...p, [k]: val }));
  const setE = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => set(k, e.target.value);
  const v = (k: string) => f[k] || '';

  const ready = v('email').trim() && v('playerName').trim() && v('parentName').trim() && v('programOption').trim() && v('terms') === 'Yes';

  async function submit() {
    setBusy(true); setErr('');
    try {
      const res = await fetch('/api/agreement', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Submission failed. Please try again.');
    } finally { setBusy(false); }
  }

  if (done) return (
    <div className="fcard"><div className="fsuccess">
      <div className="big">&#9989;</div>
      <h2 className="display">AGREEMENT RECEIVED</h2>
      <p>Thank you. Your Fee Structure Agreement is on file with CPR Global Prospects.<br />Payment details for the first stage will be sent to you directly. Questions: {site.footer.email}</p>
      <a className="btn" href="/">BACK TO HOME</a>
    </div></div>
  );

  return (
    <div className="fcard">
      {err && <div className="ferror">{err}</div>}
      <div className="honeypot"><input value={v('website')} onChange={setE('website')} tabIndex={-1} autoComplete="off" /></div>
      <h2 className="display">CPR GLOBAL PROSPECTS FEE AGREEMENT</h2>
      <p className="fsub">Contact us at {site.footer.email} or message us on Instagram. Required questions are marked <span className="req">*</span></p>

      <div className="fgroup">
        <label>Email <span className="req">*</span></label>
        <input type="email" value={v('email')} onChange={setE('email')} />
        <div className="fhint">Use the same email as your Player Profile application so we can match your records.</div>
      </div>

      <div className="fgroup">
        <label>Link to your current school transcript <span className="req">*</span></label>
        <input type="url" value={v('transcriptUrl')} onChange={setE('transcriptUrl')} placeholder="Google Drive or Dropbox share link" />
        <div className="fhint">Upload the file to Google Drive or Dropbox, set sharing to anyone with the link, and paste the link here.</div>
      </div>

      <div className="fgroup">
        <label>Link to gameplay footage <span className="req">*</span></label>
        <input type="url" value={v('filmUrl')} onChange={setE('filmUrl')} placeholder="Google Drive, Dropbox or YouTube link" />
        <div className="fhint">If possible, complete game footage.</div>
      </div>

      <div className="agree-block">
        <h4>PROGRAM OVERVIEW</h4>
        <p>CPR Global Prospects ("CPR") provides recruiting support, college outreach, player promotion, and guidance throughout the recruitment process.</p>
        <p>By submitting this agreement, the Parent/Guardian and Player acknowledge and agree to one of the following fee options.</p>
      </div>

      <div className="agree-block">
        <h4>OPTION 1: CANADIAN RECRUITMENT PROGRAM <span className="req">*</span></h4>
        <p><strong>Total Fee: $1,500</strong></p>
        <p>Choose one payment method: Pay in full: $1,500 OR three payments of $500.</p>
        <ul className="fee-list">
          <li>Payment 1: $500 to begin the recruitment process</li>
          <li>Payment 2: $500 during the recruitment process</li>
          <li>Payment 3: $500 upon completion of the recruitment process</li>
        </ul>
        <label className="radio-line"><input type="radio" name="programOption" checked={v('programOption') === 'Canadian Recruitment Program'} onChange={() => set('programOption', 'Canadian Recruitment Program')} /> I agree to the Canadian Recruitment Program fee structure.</label>
      </div>

      <div className="agree-block">
        <h4>OPTION 2: SCHOLARSHIP SUCCESS FEE PROGRAM <span className="req">*</span></h4>
        <p><strong>No upfront recruitment fee.</strong></p>
        <p>If CPR assists in securing a scholarship opportunity, the following success fees apply:</p>
        <ul className="fee-list">
          <li>Partial Scholarship Award: $500</li>
          <li>Full Scholarship Award: $1,500</li>
        </ul>
        <p>Success fees are due upon acceptance and signing of the scholarship offer.</p>
        <label className="radio-line"><input type="radio" name="programOption" checked={v('programOption') === 'Scholarship Success Fee Program'} onChange={() => set('programOption', 'Scholarship Success Fee Program')} /> I agree to the Scholarship Success Fee Program.</label>
      </div>

      <div className="agree-block">
        <h4>IMPORTANT INFORMATION</h4>
        <p>CPR Global Prospects will make reasonable efforts to promote the student-athlete and connect them with potential college opportunities.</p>
        <p>CPR does not guarantee scholarship offers, college acceptance, athletic roster positions, or specific financial aid awards.</p>
        <p>Admission, scholarship, and roster decisions are made solely by the college, university, and coaching staff.</p>
      </div>

      <div className="frow">
        <div className="fgroup">
          <label>Full name of parent/guardian <span className="req">*</span></label>
          <input value={v('parentName')} onChange={setE('parentName')} />
        </div>
        <div className="fgroup">
          <label>Full name of player/applicant <span className="req">*</span></label>
          <input value={v('playerName')} onChange={setE('playerName')} />
        </div>
      </div>

      <div className="agree-block">
        <h4>ACKNOWLEDGMENT <span className="req">*</span></h4>
        <p>I have read, understand, and agree to the terms of this CPR Global Prospects Fee Agreement.</p>
        <div className="radios">
          <label><input type="checkbox" name="terms" checked={v('terms') === 'Yes'} onChange={e => set('terms', e.target.checked ? 'Yes' : '')} />I agree to the terms.</label>
        </div>
      </div>

      <div className="fbtns">
        <span />
        <button className="btn" disabled={!ready || busy} onClick={submit}>{busy ? 'SUBMITTING...' : 'SUBMIT AGREEMENT'}</button>
      </div>
    </div>
  );
}

export default function AgreementPage() {
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
        <h1 className="display">FEE STRUCTURE AGREEMENT</h1>
        <p>CPR Global Prospects. Complete this to activate your profile.</p>
      </div>
      <div className="form-wrap">
        <Suspense fallback={<div className="fcard"><p className="fsub">Loading...</p></div>}>
          <AgreementForm />
        </Suspense>
      </div>
    </>
  );
}
