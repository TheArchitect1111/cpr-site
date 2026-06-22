'use client';

import GuidedFirstSuccessFlow from '@/app/components/guided-first-success/GuidedFirstSuccessFlow';
import UniversalCoachPanel from '@/app/components/guided-first-success/UniversalCoachPanel';
import ActionCenterPanel from '@/app/components/guided-first-success/ActionCenterPanel';
import { buildCprActionCenter } from '@/lib/guided-first-success';
import type { OnboardingData } from '@/lib/portal-data';

export default function CprPortalHomeExperience({
  slug,
  portalType,
  onboarding,
  opportunityCount,
}: {
  slug: string;
  portalType: 'parent' | 'athlete';
  onboarding: OnboardingData;
  opportunityCount: number;
}) {
  const base = `/portal/${portalType}/${slug}`;
  const actionItems = buildCprActionCenter({
    base,
    onboarding,
    opportunityCount,
  });

  return (
    <>
      <GuidedFirstSuccessFlow
        platformId="cpr"
        scope={`${portalType}/${slug}`}
        firstActionHref={`${base}/recruiting-timeline`}
      />
      <ActionCenterPanel items={actionItems} />
      <UniversalCoachPanel platformId="cpr" portalBase={base} />
    </>
  );
}
