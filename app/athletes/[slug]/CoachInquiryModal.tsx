'use client';

import { useState } from 'react';

type InquiryForm = {
  coachName: string;
  coachEmail: string;
  organization: string;
  inquiryType: string;
  message: string;
};

const INQUIRY_TYPES = [
  'General Inquiry',
  'Schedule a Showcase',
  'Request Academic Info',
  'Request Film',
  'Set Up Official Visit',
];

const INITIAL: InquiryForm = {
  coachName: '',
  coachEmail: '',
  organization: '',
  inquiryType: '',
  message: '',
};

export default function CoachInquiryModal({ athleteSlug }: { athleteSlug: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<InquiryForm>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof InquiryForm>(key: K, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const valid =
    form.coachName.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(form.coachEmail) &&
    form.message.trim().length >= 10;

  const close = () => {
    setOpen(false);
    setDone(false);
    setError('');
    setForm(INITIAL);
  };

  const submit = async () => {
    if (!valid) { setError('Please fill in all required fields.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/coach-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ athleteSlug, ...form }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Submission failed. Please try again.');
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setError('Network error. Check your connection and try again.');
    }
    setSubmitting(false);
  };

  return (
    <>
      <button className="btn btn-white inquiry-trigger" onClick={() => setOpen(true)}>
        REQUEST MORE INFORMATION &nbsp;&#10140;
      </button>

      {open && (
        <div
          className="inquiry-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div className="inquiry-modal">
            <button className="inquiry-close" onClick={close} aria-label="Close">&#10005;</button>

            {done ? (
              <div className="inquiry-success">
                <div className="inquiry-check">&#10003;</div>
                <h3 className="display">Inquiry received.</h3>
                <p>Your inquiry has been received. CPR will review and respond directly.</p>
                <button className="btn inquiry-done-btn" onClick={close}>Close</button>
              </div>
            ) : (
              <>
                <h3 className="display inquiry-title">
                  <span className="red">&#9658;</span> REQUEST MORE INFORMATION
                </h3>
                <p className="inquiry-sub">
                  Fill out the form below and CPR will be in touch to connect you with this athlete.
                </p>

                <div className="inquiry-fields">
                  <div className="inquiry-row">
                    <div className="inquiry-field">
                      <label>Coach / Contact Name <span className="red">*</span></label>
                      <input
                        value={form.coachName}
                        onChange={e => set('coachName', e.target.value)}
                        placeholder="Your name"
                      />
                    </div>
                    <div className="inquiry-field">
                      <label>Email <span className="red">*</span></label>
                      <input
                        type="email"
                        value={form.coachEmail}
                        onChange={e => set('coachEmail', e.target.value)}
                        placeholder="you@school.edu"
                      />
                    </div>
                  </div>

                  <div className="inquiry-row">
                    <div className="inquiry-field">
                      <label>School / Organization</label>
                      <input
                        value={form.organization}
                        onChange={e => set('organization', e.target.value)}
                        placeholder="University of..."
                      />
                    </div>
                    <div className="inquiry-field">
                      <label>Inquiry Type</label>
                      <select
                        value={form.inquiryType}
                        onChange={e => set('inquiryType', e.target.value)}
                      >
                        <option value="">Select...</option>
                        {INQUIRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="inquiry-field inquiry-field-full">
                    <label>Message <span className="red">*</span></label>
                    <textarea
                      rows={4}
                      value={form.message}
                      onChange={e => set('message', e.target.value)}
                      placeholder="Tell us what you are looking for..."
                    />
                  </div>
                </div>

                {error && <p className="inquiry-error">{error}</p>}

                <button
                  className="btn inquiry-submit"
                  onClick={submit}
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Send Inquiry'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
