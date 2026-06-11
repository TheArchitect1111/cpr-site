'use client';
import '../landing.css';
import '../forms.css';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { site } from '@/config/site';

function YesNo({ k, f, set }: { k: string; f: Record<string, string>; set: (k: string, v: string) => void }) {
  return (
    <div className="radios">
      {['Yes', 'No'].map(o => (
        <label key={o}>
          <input type="radio" name={k} checked={f[k] === o} onChange={() => set(k, o)} />
          {o === 'Yes' ? (k === 'academic' || k === 'terms' ? 'Yes, I understand' : 'Yes, I understand and payment details will be sent') : 'No'}
        </label>
      ))}
    </div>
  );
}

function AgreementForm() {
  const params = useSearchParams();
  const [f, setF] = useState<Record<string, string>>({ email: params.get('email') || '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  const set = (k: string, val: string) => setF(p => ({ ...p, [k]: val }));
  const setE = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => set(k, e.target.value);
  const v = (k: string) => f[k] || '';

  const answered = ['fee1', 'fee2', 'academic', 'fee3', 'nil'].every(k => v(k));
  const ready = v('email').trim() && v('playerName').trim() && v('parentName').trim() && answered && v('terms') === 'Yes';

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
      <p>Thank you. Your Fee Structure Agreement is on file with Canadian Prospects Recruitment.<br />Payment details for the first stage will be sent to you directly. Questions: {site.footer.email}</p>
      <a className="btn" href="/">BACK TO HOME</a>
    </div></div>
  );

  return (
    <div className="fcard">
      {err && <div className="ferror">{err}</div>}
      <div className="honeypot"><input value={v('website')} onChange={setE('website')} tabIndex={-1} autoComplete="off" /></div>
      <h2 className="display">FEE STRUCTURE AGREEMENT</h2>
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
        <h4>FIRST PAYMENT <span className="req">*</span></h4>
        <p>At this point $500.00 is collected to start sending out your package to coaches.</p>
        <YesNo k="fee1" f={f} set={set} />
      </div>

      <div className="agree-block">
        <h4>NEXT STEP <span className="req">*</span></h4>
        <p>When we find a school that is interested in having you attend, the coach or coaches will then communicate with parent(s)/guardian(s) to begin the application process. At this point another payment of $500.00 is due.</p>
        <YesNo k="fee2" f={f} set={set} />
      </div>

      <div className="agree-block">
        <h4>NEXT STEP <span className="req">*</span></h4>
        <p>Once contact is established, our job is to provide applicants with aid until the process is complete. <span className="disclaim">Canadian Prospects Recruitment is not responsible for any issues or rejections related to academic standing.</span></p>
        <YesNo k="academic" f={f} set={set} />
      </div>

      <div className="agree-block">
        <h4>LAST STEP <span className="req">*</span></h4>
        <p>Once the application has been approved by the school, the last payment of $500.00 is due. We will continue to aid with promoting you as a member of our program throughout your career.</p>
        <YesNo k="fee3" f={f} set={set} />
      </div>

      <div className="agree-block">
        <h4>NIL &amp; BRANDING <span className="req">*</span></h4>
        <p>Would you like management help with NILs or Branding?</p>
        <YesNo k="nil" f={f} set={set} />
      </div>

      <div className="frow">
        <div className="fgroup">
          <label>Full name of parent/guardian <span className="req">*</span></label>
          <input value={v('parentName')} onChange={setE('parentName')} />
        </div>
        <div className="fgroup">
          <label>Full name of player/applicant <span className="req">*</span></label>
          <input value={v('playerName')} onChange={setE('playerName')} />
          <div className="fhint">Typing your full name acts as your digital signature.</div>
        </div>
      </div>

      <div className="agree-block">
        <h4>TERMS <span className="req">*</span></h4>
        <p>I understand the terms of this application and by selecting YES I am in agreement to start the recruitment process.</p>
        <div className="radios">
          <label><input type="radio" name="terms" checked={v('terms') === 'Yes'} onChange={() => set('terms', 'Yes')} />Yes</label>
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
        <p>Canadian Prospects Recruitment. Complete this to activate your profile.</p>
      </div>
      <div className="form-wrap">
        <Suspense fallback={<div className="fcard"><p className="fsub">Loading...</p></div>}>
          <AgreementForm />
        </Suspense>
      </div>
    </>
  );
}
