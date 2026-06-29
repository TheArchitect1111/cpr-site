import { appendAthletePortalActivity } from '@/lib/athletes';
import { publishToAmplifi } from '@/lib/amplifi-publish';
import { createCommunicationAnnouncement } from '@/lib/communication-center-data';
import { notifyOwnerUpdatePublished } from '@/lib/portal-admin-notifications';
import { forwardPulseEvent } from '@/lib/ea-pulse-forward';
import { getSiteUrl } from '@/lib/site-url';

export type PortalUpdateChannel = 'website' | 'social';

export type PublishPortalUpdateInput = {
  slug: string;
  portalType: 'athlete' | 'parent';
  title: string;
  message: string;
  channels: PortalUpdateChannel[];
  audience?: string;
  socialCaption?: string;
  actorName: string;
  actorEmail: string;
};

export type PublishPortalUpdateResult = {
  actions: string[];
  website?: { ok: boolean; detail: string };
  social?: { ok: boolean; detail: string; mode?: string };
  confirmationEmail: { ok: boolean; detail: string };
};

export async function publishPortalUpdate(input: PublishPortalUpdateInput): Promise<PublishPortalUpdateResult> {
  const channels = input.channels.length ? input.channels : (['website'] as PortalUpdateChannel[]);
  const actions: string[] = [];
  let websiteResult: PublishPortalUpdateResult['website'];
  let socialResult: PublishPortalUpdateResult['social'];

  if (channels.includes('website')) {
    try {
      await createCommunicationAnnouncement({
        title: input.title,
        body: input.message,
        audience: input.audience || 'All',
        channels: ['Portal'],
        recipientEmails: [],
        pinned: false,
        publishNow: true,
        actorName: input.actorName,
      });
      const activityOk = await appendAthletePortalActivity(
        input.slug,
        `${input.title}: ${input.message}`,
      );
      websiteResult = {
        ok: true,
        detail: activityOk
          ? 'Published to portal announcements and athlete update feed.'
          : 'Published to portal announcements.',
      };
      actions.push('Website / portal updated');
    } catch (error) {
      websiteResult = {
        ok: false,
        detail: error instanceof Error ? error.message : 'Website update failed',
      };
      actions.push('Website update failed');
    }
  }

  if (channels.includes('social')) {
    const amplifi = await publishToAmplifi({
      slug: input.slug,
      portalType: input.portalType,
      title: input.title,
      message: input.message,
      caption: input.socialCaption,
      actorName: input.actorName,
    });
    socialResult = {
      ok: amplifi.ok,
      detail: amplifi.detail,
      mode: amplifi.mode,
    };
    actions.push(
      amplifi.ok
        ? amplifi.mode === 'webhook'
          ? 'Social media queued via Amplifi'
          : 'Social caption prepared (manual share)'
        : 'Social publish failed',
    );
  }

  const base = getSiteUrl();
  const portalUrl = `${base}/portal/${input.portalType}/${input.slug}/updates`;

  const confirmationEmail = await notifyOwnerUpdatePublished({
    ownerEmail: input.actorEmail,
    ownerName: input.actorName,
    title: input.title,
    message: input.message,
    channels,
    actions,
    portalUrl,
    website: websiteResult,
    social: socialResult,
  });

  await forwardPulseEvent({
    product: 'cpr',
    type: 'update.published',
    title: `Portal update: ${input.title}`,
    detail: actions.join(' · '),
    priority: 'medium',
    href: portalUrl,
    tenantId: input.slug,
  });

  return {
    actions,
    website: websiteResult,
    social: socialResult,
    confirmationEmail,
  };
}
