'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './portal-owner-hub.css';

type Props = {
  slug: string;
  portalType: 'athlete' | 'parent';
  ownerName: string;
  athleteName: string;
  updatesUrl: string;
  showSocialOption: boolean;
};

export default function PortalUpdateForm({
  slug,
  portalType,
  ownerName,
  athleteName,
  updatesUrl,
  showSocialOption,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(true);
  const [social, setSocial] = useState(false);
  const [socialCaption, setSocialCaption] = useState('');
  const [audience, setAudience] = useState('All');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState<{ actions: string[]; confirmationEmail?: { ok: boolean; detail: string } } | null>(null);

  const channels = [
    website && 'website',
    showSocialOption && social && 'social',
  ].filter(Boolean) as Array<'website' | 'social'>;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || !message.trim()) {
      setStatus('Title and message are required.');
      return;
    }
    if (!channels.length) {
      setStatus('Choose at least one destination: website, social, or both.');
      return;
    }

    setBusy(true);
    setStatus('');
    setResult(null);

    try {
      const res = await fetch('/api/admin/portal-updates/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          portalType,
          title: title.trim(),
          message: message.trim(),
          channels,
          audience,
          socialCaption: socialCaption.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Publish failed');

      setResult(json);
      setStatus('Update published successfully.');
      setTitle('');
      setMessage('');
      setSocialCaption('');
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not publish update.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="owner-update-form">
      <div className="owner-head owner-update-head">
        <div>
          <p className="owner-eyebrow">Update Hub</p>
          <h1 className="owner-title">Post an update</h1>
          <p className="owner-sub">
            Signed in as {ownerName}. Publish to the portal{showSocialOption ? ', social media via Amplifi,' : ''} or both.
          </p>
        </div>
        <a className="owner-secondary owner-link-cta" href={updatesUrl}>
          View feed
        </a>
      </div>

      <form className="owner-fields" onSubmit={handleSubmit}>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Summer showcase dates announced" required />
        </label>
        <label>
          Message
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="What should families know?" required />
        </label>
        <label>
          Audience
          <select value={audience} onChange={(e) => setAudience(e.target.value)}>
            {['All', 'Families', 'Athletes', 'Parents'].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        <fieldset className="owner-checks owner-destinations">
          <legend>Publish to</legend>
          <label className="owner-check">
            <input type="checkbox" checked={website} onChange={(e) => setWebsite(e.target.checked)} />
            Website / portal ({athleteName}&apos;s update feed)
          </label>
          {showSocialOption && (
            <label className="owner-check">
              <input type="checkbox" checked={social} onChange={(e) => setSocial(e.target.checked)} />
              Social media (Amplifi)
            </label>
          )}
        </fieldset>

        {showSocialOption && social && (
          <label>
            Social caption (optional)
            <textarea
              value={socialCaption}
              onChange={(e) => setSocialCaption(e.target.value)}
              rows={3}
              placeholder={`${athleteName} update from CPR Global Prospects…`}
            />
          </label>
        )}

        {status && <p className="owner-message">{status}</p>}

        {result && (
          <div className="owner-result">
            <p><strong>Actions taken:</strong></p>
            <ul>
              {result.actions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
            {result.confirmationEmail && (
              <p className="owner-hint">
                Confirmation email: {result.confirmationEmail.ok ? 'sent to your inbox' : result.confirmationEmail.detail}
              </p>
            )}
          </div>
        )}

        <button type="submit" className="owner-primary" disabled={busy}>
          {busy ? 'Publishing…' : 'Publish update'}
        </button>
        {showSocialOption && (
          <p className="owner-hint">
            <a href={`/portal/${portalType}/${slug}/owner`}>Advanced owner tools</a>
            {' · '}
            <a href={updatesUrl}>View update feed</a>
          </p>
        )}
      </form>
    </div>
  );
}
