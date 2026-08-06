'use client';

import { FormEvent, useState } from 'react';

type Draft = {
  id: string;
  day: number;
  contentType: string;
  funnelStage: string;
  format: string;
  title: string;
  facebook: string;
  instagram: string;
  proofStatus: string;
};

export default function AmplifiCampaignBuilder() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/admin/amplifi/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(result.error || 'Campaign generation failed.');
      return;
    }
    setDrafts(result.drafts || []);
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
  }

  return (
    <>
      <form className="amplifi-builder" onSubmit={submit}>
        <div className="amplifi-field wide">
          <label htmlFor="topic">Campaign topic or offer</label>
          <textarea id="topic" name="topic" required placeholder="What are we promoting, teaching, or inviting families to do?" />
        </div>
        <div className="amplifi-field">
          <label htmlFor="objective">Objective</label>
          <input id="objective" name="objective" required placeholder="Example: qualified parent consultations" />
        </div>
        <div className="amplifi-field">
          <label htmlFor="audience">Audience</label>
          <input id="audience" name="audience" defaultValue="Student-athletes ages 13–18 and their parents" />
        </div>
        <div className="amplifi-field wide">
          <label htmlFor="callToAction">One conversion action</label>
          <input id="callToAction" name="callToAction" placeholder="Example: Schedule a CPR player evaluation: [verified link]" />
        </div>
        <div className="amplifi-field wide">
          <label htmlFor="proof">Optional verified proof</label>
          <textarea id="proof" name="proof" placeholder="Use only: Verified proof: … / Permission confirmed: …" />
          <small>Names, images, quotes, stats, offers, and results are excluded unless verification and permission are explicit.</small>
        </div>
        <button className="amplifi-generate" disabled={busy}>{busy ? 'Building campaign…' : 'Build conversion campaign'}</button>
        {error ? <p className="amplifi-error">{error}</p> : null}
      </form>

      {drafts.length ? (
        <section className="amplifi-results" aria-live="polite">
          <div>
            <p className="admin-kicker">Conversion campaign</p>
            <h2>{drafts.length} distinct posts, each with a job</h2>
          </div>
          {drafts.map((draft) => (
            <article className="amplifi-draft" key={draft.id}>
              <header>
                <span>Day {draft.day}</span>
                <strong>{draft.title}</strong>
                <em>{draft.funnelStage} · {draft.contentType} · {draft.format}</em>
              </header>
              <div className="amplifi-copy-grid">
                <section>
                  <h3>Facebook</h3>
                  <pre>{draft.facebook}</pre>
                  <button type="button" onClick={() => copy(draft.facebook)}>Copy Facebook</button>
                </section>
                <section>
                  <h3>Instagram</h3>
                  <pre>{draft.instagram}</pre>
                  <button type="button" onClick={() => copy(draft.instagram)}>Copy Instagram</button>
                </section>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </>
  );
}
