'use client';
import '../landing.css';
import '../forms.css';
import { useState } from 'react';
import { site } from '@/config/site';

type F = Record<string, string>;

export default function ApplyPage() {
  const [step, setStep] = useState(0);
  const [f, setF] = useState<F>({ sport: 'Basketball' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF(p => ({ ...p, [k]: e.target.value }));
  const v = (k: string) => f[k] || '';

  const stepValid = [
    ['firstName', 'lastName', 'email'].every(k => v(k).trim()),
    ['position', 'gradYear'].every(k => v(k).trim()),
    true,
  ][step];

  async function submit() {
    setBusy(true); setErr('');
    try {
      const res = await fetch('/api/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Submission failed. Please try again.');
    } finally { setBusy(false); }
  }

  const In = (k: string, label: string, req = false, type = 'text', hint = '') => (
    <div className="fgroup">
      <label>{label} {req && <span className="req">*</span>}</label>
      <input type={type} value={v(k)} onChange={set(k)} />
      {hint && <div className="fhint">{hint}</div>}
    </div>
  );

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
        <h1 className="display">PLAYER PROFILE APPLICATION</h1>
        <p>Step 1 of the CPR process. Tell us who you are and how you play.</p>
      </div>
      <div className="form-wrap">
        {!done && <div className="steps">{[0, 1, 2].map(i => <span key={i} className={i <= step ? 'on' : ''} />)}</div>}
        <div className="fcard">
          {done ? (
            <div className="fsuccess">
              <div className="big">&#127936;</div>
              <h2 className="display">APPLICATION RECEIVED</h2>
              <p>Your player profile is in. Our team reviews every application and will contact you at {v('email')}.<br />If CPR has instructed you to complete the Fee Structure Agreement, continue below.</p>
              <a className="btn" href={`/agreement?email=${encodeURIComponent(v('email'))}`}>CONTINUE TO FEE AGREEMENT &nbsp;&#10140;</a>
            </div>
          ) : (
            <>
              {err && <div className="ferror">{err}</div>}
              <div className="honeypot"><input value={v('website')} onChange={set('website')} tabIndex={-1} autoComplete="off" /></div>
              {step === 0 && (
                <>
                  <h2 className="display">PERSONAL INFORMATION</h2>
                  <p className="fsub">Required fields are marked <span className="req">*</span></p>
                  <div className="frow">{In('firstName', 'First Name', true)}{In('lastName', 'Last Name', true)}</div>
                  <div className="frow">{In('email', 'Email', true, 'email')}{In('phone', 'Phone')}</div>
                  <div className="frow">{In('dob', 'Date of Birth', false, 'date')}{In('city', 'City / Province')}</div>
                </>
              )}
              {step === 1 && (
                <>
                  <h2 className="display">ATHLETIC &amp; ACADEMIC</h2>
                  <p className="fsub">What coaches see first.</p>
                  <div className="frow">
                    <div className="fgroup">
                      <label>Sport</label>
                      <select value={v('sport')} onChange={set('sport')}><option>Basketball</option></select>
                    </div>
                    {In('position', 'Position', true, 'text', 'e.g. Point Guard')}
                  </div>
                  <div className="frow">{In('height', 'Height', false, 'text', 'e.g. 6\'2"')}{In('weight', 'Weight (lbs)', false, 'number')}</div>
                  <div className="frow">{In('wingspan', 'Wingspan (inches)', false, 'number')}{In('gradYear', 'Graduation Year', true, 'number')}</div>
                  <div className="frow">{In('gpa', 'GPA', false, 'number')}{In('sat', 'SAT Score', false, 'number')}</div>
                  {In('school', 'Current School')}
                </>
              )}
              {step === 2 && (
                <>
                  <h2 className="display">STORY, VIDEO &amp; PARENT CONTACT</h2>
                  <p className="fsub">Almost done.</p>
                  {In('videoUrl', 'Highlight Video URL', false, 'url', 'YouTube or Vimeo link')}
                  <div className="fgroup">
                    <label>Player Bio</label>
                    <textarea value={v('bio')} onChange={set('bio')} placeholder="Playing style, goals, what makes you different..." />
                  </div>
                  <div className="fgroup">
                    <label>Strengths</label>
                    <textarea value={v('strengths')} onChange={set('strengths')} placeholder="e.g. Court vision, 3PT shooting, leadership" />
                  </div>
                  {In('parentName', 'Parent / Guardian Name')}
                  <div className="frow">{In('parentEmail', 'Parent Email', false, 'email')}{In('parentPhone', 'Parent Phone')}</div>
                </>
              )}
              <div className="fbtns">
                {step > 0 ? <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>&#8592; BACK</button> : <span />}
                {step < 2
                  ? <button className="btn" disabled={!stepValid} onClick={() => setStep(step + 1)}>NEXT &#8594;</button>
                  : <button className="btn" disabled={busy} onClick={submit}>{busy ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}</button>}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
