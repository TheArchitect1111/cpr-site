'use client';

import { FormEvent, useEffect, useState } from 'react';
import { PLAYER_APPLICATION_URL } from '@/config/site';

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
  facebookTrackingUrl: string;
  instagramTrackingUrl: string;
};

type Platform = 'facebook' | 'instagram';
type PlatformMetrics = {
  platform: Platform;
  source: 'not-connected' | 'manual' | 'connected';
  impressions: number;
  reach: number;
  reactions: number;
  comments: number;
  shares: number;
  saves: number;
  updatedAt?: string;
};
type Campaign = {
  id: string;
  topic: string;
  objective: string;
  conversionType: string;
  drafts: Draft[];
  analytics: {
    clicks: number;
    applicationCompletions: number;
    profilePurchases: number;
    registrations: number;
    customConversions: number;
    byPost: Array<{ draftId: string; platform: Platform; clicks: number; conversions: number }>;
    platformMetrics: PlatformMetrics[];
  };
  performance?: {
    impressions: number;
    reach: number;
    engagements: number;
    conversions: number;
    clickThroughRate: number | null;
    conversionRate: number | null;
  };
};

function pct(value: number | null | undefined) {
  return value === null || value === undefined ? 'Not available' : `${(value * 100).toFixed(1)}%`;
}

export default function AmplifiCampaignBuilder() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState<Platform | null>(null);

  useEffect(() => {
    void fetch('/api/admin/amplifi/campaigns')
      .then((response) => response.json())
      .then((result: { campaigns?: Campaign[] }) => {
        const saved = result.campaigns || [];
        setCampaigns(saved);
        if (saved[0]) setCampaign(saved[0]);
      })
      .catch(() => undefined);
  }, []);

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
    const created = result.campaign as Campaign;
    setCampaign(created);
    setCampaigns((current) => [created, ...current.filter((item) => item.id !== created.id)]);
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
  }

  async function saveMetrics(platform: Platform, form: HTMLFormElement) {
    setSaving(platform);
    const values = Object.fromEntries(new FormData(form).entries());
    const response = await fetch('/api/admin/amplifi/campaigns', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId: campaign?.id, platform, ...values }),
    });
    const result = await response.json();
    setSaving(null);
    if (!response.ok) {
      setError(result.error || 'Could not save campaign totals.');
      return;
    }
    setCampaign(result.campaign);
    setCampaigns((current) => current.map((item) => item.id === result.campaign.id ? result.campaign : item));
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
          <input id="callToAction" name="callToAction" defaultValue="Complete the CPR application" />
        </div>
        <div className="amplifi-field">
          <label htmlFor="conversionType">Result to measure</label>
          <select id="conversionType" name="conversionType" defaultValue="application">
            <option value="application">Completed applications</option>
            <option value="profile-purchase">Profile purchases</option>
            <option value="registration">Registrations</option>
            <option value="custom">Other conversions</option>
          </select>
        </div>
        <div className="amplifi-field">
          <label htmlFor="destinationUrl">Destination link</label>
          <input id="destinationUrl" name="destinationUrl" type="url" required defaultValue={PLAYER_APPLICATION_URL} />
        </div>
        <div className="amplifi-field wide">
          <label htmlFor="proof">Optional verified proof</label>
          <textarea id="proof" name="proof" placeholder="Use only: Verified proof: … / Permission confirmed: …" />
          <small>Names, images, quotes, stats, offers, and results are excluded unless verification and permission are explicit.</small>
        </div>
        <button className="amplifi-generate" disabled={busy}>{busy ? 'Building campaign…' : 'Build conversion campaign'}</button>
        {error ? <p className="amplifi-error">{error}</p> : null}
      </form>

      {campaigns.length ? (
        <nav className="amplifi-campaign-picker" aria-label="Saved campaigns">
          <strong>Saved campaigns</strong>
          <select value={campaign?.id || ''} onChange={(event) => setCampaign(campaigns.find((item) => item.id === event.target.value) || null)}>
            {campaigns.map((item) => <option key={item.id} value={item.id}>{item.topic}</option>)}
          </select>
        </nav>
      ) : null}

      {campaign ? (
        <section className="amplifi-results" aria-live="polite">
          <div>
            <p className="admin-kicker">Conversion campaign</p>
            <h2>{campaign.drafts.length} distinct posts, each with a job</h2>
          </div>
          <section className="amplifi-performance">
            <div className="amplifi-performance-head">
              <div><p className="admin-kicker">Campaign results</p><h2>What the campaign produced</h2></div>
              <span>Tracked links active</span>
            </div>
            <div className="amplifi-metric-grid">
              <div><strong>{campaign.performance?.reach || 0}</strong><span>Reach</span></div>
              <div><strong>{campaign.performance?.impressions || 0}</strong><span>Impressions</span></div>
              <div><strong>{campaign.performance?.engagements || 0}</strong><span>Engagements</span></div>
              <div><strong>{campaign.analytics.clicks}</strong><span>Tracked clicks</span></div>
              <div><strong>{campaign.performance?.conversions || 0}</strong><span>Conversions</span></div>
              <div><strong>{pct(campaign.performance?.clickThroughRate)}</strong><span>Click-through rate</span></div>
              <div><strong>{pct(campaign.performance?.conversionRate)}</strong><span>Conversion rate</span></div>
            </div>
            <p className="amplifi-tracking-note">
              Link clicks are automatic. On-platform applications and Stripe profile purchases are counted automatically.
              CPR's current Google application form cannot report completions back to Amplifi. Enter social Insights totals below until platform connections are active.
            </p>
            <div className="amplifi-platform-metrics">
              {(['facebook', 'instagram'] as const).map((platform) => {
                const metrics = campaign.analytics.platformMetrics.find((item) => item.platform === platform);
                return (
                  <form key={`${campaign.id}-${platform}-${metrics?.updatedAt || 'new'}`} onSubmit={(event) => { event.preventDefault(); void saveMetrics(platform, event.currentTarget); }}>
                    <header><strong>{platform}</strong><span>{metrics?.source === 'manual' ? 'Manual totals' : 'Insights not connected'}</span></header>
                    <div>
                      {(['impressions', 'reach', 'reactions', 'comments', 'shares', 'saves'] as const).map((field) => (
                        <label key={field}><span>{field}</span><input name={field} type="number" min="0" defaultValue={metrics?.[field] || 0} /></label>
                      ))}
                    </div>
                    <button disabled={saving === platform}>{saving === platform ? 'Saving…' : 'Save totals'}</button>
                  </form>
                );
              })}
            </div>
          </section>
          {campaign.drafts.map((draft) => (
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
                  <small>{campaign.analytics.byPost.find((row) => row.draftId === draft.id && row.platform === 'facebook')?.clicks || 0} clicks</small>
                </section>
                <section>
                  <h3>Instagram</h3>
                  <pre>{draft.instagram}</pre>
                  <button type="button" onClick={() => copy(draft.instagram)}>Copy Instagram</button>
                  <small>{campaign.analytics.byPost.find((row) => row.draftId === draft.id && row.platform === 'instagram')?.clicks || 0} clicks</small>
                </section>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </>
  );
}
