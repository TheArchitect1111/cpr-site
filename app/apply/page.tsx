'use client';

import '../landing.css';
import '../forms.css';
import { useState } from 'react';
import { site } from '@/config/site';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  sport: '',
  position: '',
  currentSchool: '',
  gradYear: '',
  city: '',
  stateProvince: '',
  parentName: '',
  parentEmail: '',
  parentPhone: '',
  highlightVideoUrl: '',
  gameplayVideoUrl: '',
  bio: '',
  termsAgreed: false,
  website: '',
};

type ApplyForm = typeof initialForm;

export default function ApplyPage() {
  const [form, setForm] = useState<ApplyForm>(initialForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ slug?: string; profileUrl?: string } | null>(null);

  const set = (key: keyof ApplyForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const ready =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.termsAgreed;

  async function submit() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Application could not be submitted.');
      setDone({ slug: json.slug, profileUrl: json.profileUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Application could not be submitted.');
    } finally {
      setBusy(false);
    }
  }

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
        <h1 className="display">CPR APPLICATION</h1>
        <p>Start the CPR Global Prospects registration journey.</p>
      </div>
      <div className="form-wrap">
        <div className="steps" aria-hidden="true">
          <span className="on" />
          <span />
          <span />
        </div>
        <div className="fcard">
          {done ? (
            <div className="fsuccess">
              <div className="big">&#9989;</div>
              <h2 className="display">APPLICATION RECEIVED</h2>
              <p>
                Your CPR application is in Mission Control for review. Check your inbox for
                confirmation and next steps.
              </p>
              {done.profileUrl ? <a className="btn" href={done.profileUrl}>VIEW PROFILE</a> : null}
            </div>
          ) : (
            <>
              {error ? <div className="ferror">{error}</div> : null}
              <div className="honeypot">
                <input
                  value={form.website}
                  onChange={(event) => set('website', event.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              <h2 className="display">Student-athlete information</h2>
              <p className="fsub">Required fields are marked <span className="req">*</span>.</p>

              <div className="frow">
                <div className="fgroup">
                  <label>First name <span className="req">*</span></label>
                  <input value={form.firstName} onChange={(event) => set('firstName', event.target.value)} />
                </div>
                <div className="fgroup">
                  <label>Last name <span className="req">*</span></label>
                  <input value={form.lastName} onChange={(event) => set('lastName', event.target.value)} />
                </div>
              </div>

              <div className="frow">
                <div className="fgroup">
                  <label>Email <span className="req">*</span></label>
                  <input type="email" value={form.email} onChange={(event) => set('email', event.target.value)} />
                </div>
                <div className="fgroup">
                  <label>Phone</label>
                  <input value={form.phone} onChange={(event) => set('phone', event.target.value)} />
                </div>
              </div>

              <div className="frow">
                <div className="fgroup">
                  <label>Sport</label>
                  <input value={form.sport} onChange={(event) => set('sport', event.target.value)} />
                </div>
                <div className="fgroup">
                  <label>Position</label>
                  <input value={form.position} onChange={(event) => set('position', event.target.value)} />
                </div>
              </div>

              <div className="frow">
                <div className="fgroup">
                  <label>Current school</label>
                  <input value={form.currentSchool} onChange={(event) => set('currentSchool', event.target.value)} />
                </div>
                <div className="fgroup">
                  <label>Grad year</label>
                  <input inputMode="numeric" value={form.gradYear} onChange={(event) => set('gradYear', event.target.value)} />
                </div>
              </div>

              <div className="frow">
                <div className="fgroup">
                  <label>City</label>
                  <input value={form.city} onChange={(event) => set('city', event.target.value)} />
                </div>
                <div className="fgroup">
                  <label>State / province</label>
                  <input value={form.stateProvince} onChange={(event) => set('stateProvince', event.target.value)} />
                </div>
              </div>

              <div className="frow">
                <div className="fgroup">
                  <label>Parent / guardian name</label>
                  <input value={form.parentName} onChange={(event) => set('parentName', event.target.value)} />
                </div>
                <div className="fgroup">
                  <label>Parent / guardian email</label>
                  <input type="email" value={form.parentEmail} onChange={(event) => set('parentEmail', event.target.value)} />
                </div>
              </div>

              <div className="fgroup">
                <label>Parent / guardian phone</label>
                <input value={form.parentPhone} onChange={(event) => set('parentPhone', event.target.value)} />
              </div>

              <div className="fgroup">
                <label>Highlight video URL</label>
                <input type="url" value={form.highlightVideoUrl} onChange={(event) => set('highlightVideoUrl', event.target.value)} />
              </div>

              <div className="fgroup">
                <label>Gameplay video URL</label>
                <input type="url" value={form.gameplayVideoUrl} onChange={(event) => set('gameplayVideoUrl', event.target.value)} />
              </div>

              <div className="fgroup">
                <label>Recruiting goals / background</label>
                <textarea value={form.bio} onChange={(event) => set('bio', event.target.value)} />
              </div>

              <div className="agree-block">
                <label className="radio-line">
                  <input
                    type="checkbox"
                    checked={form.termsAgreed}
                    onChange={(event) => set('termsAgreed', event.target.checked)}
                  />
                  I confirm this information is accurate and agree to be contacted by CPR Global Prospects.
                </label>
              </div>

              <div className="fbtns">
                <a className="btn btn-ghost" href="/">Back</a>
                <button className="btn" disabled={!ready || busy} onClick={submit}>
                  {busy ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
