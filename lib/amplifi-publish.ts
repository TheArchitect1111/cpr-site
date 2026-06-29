import { getSiteUrl } from '@/lib/site-url';

export type AmplifiPublishInput = {
  slug: string;
  portalType: 'athlete' | 'parent';
  title: string;
  message: string;
  caption?: string;
  actorName: string;
};

export type AmplifiPublishResult = {
  ok: boolean;
  mode: 'webhook' | 'manual';
  detail: string;
  shareUrls?: {
    x: string;
    facebook: string;
    amplifi: string;
  };
};

function buildCaption(input: AmplifiPublishInput) {
  if (input.caption?.trim()) return input.caption.trim();
  return `${input.title}\n\n${input.message}\n\n#CanadianProspects #Recruiting #Basketball`;
}

export async function publishToAmplifi(input: AmplifiPublishInput): Promise<AmplifiPublishResult> {
  const webhook = process.env.AMPLIFI_WEBHOOK_URL?.trim() || process.env.MAKE_AMPLIFI_WEBHOOK?.trim();
  const base = getSiteUrl();
  const amplifiPath = `/portal/${input.portalType}/${input.slug}/amplifi`;
  const amplifiUrl = `${base}${amplifiPath}`;
  const caption = buildCaption(input);
  const shareUrls = {
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(amplifiUrl)}&quote=${encodeURIComponent(caption)}`,
    amplifi: amplifiUrl,
  };

  if (!webhook) {
    return {
      ok: true,
      mode: 'manual',
      detail: 'Amplifi webhook not configured — caption prepared for manual share.',
      shareUrls,
    };
  }

  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'amplifi.publish',
        product: 'cpr',
        slug: input.slug,
        portalType: input.portalType,
        title: input.title,
        message: input.message,
        caption,
        amplifiUrl,
        actorName: input.actorName,
        requestedAt: new Date().toISOString(),
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => 'Webhook failed');
      return {
        ok: false,
        mode: 'webhook',
        detail: text || `Amplifi webhook returned ${res.status}`,
        shareUrls,
      };
    }
    return {
      ok: true,
      mode: 'webhook',
      detail: 'Queued for Amplifi social publishing.',
      shareUrls,
    };
  } catch (error) {
    return {
      ok: false,
      mode: 'webhook',
      detail: error instanceof Error ? error.message : 'Amplifi webhook failed',
      shareUrls,
    };
  }
}
