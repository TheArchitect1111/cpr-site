import type { AthleteAdmin } from '@/lib/athletes';
import { getSiteUrl } from '@/lib/site-url';

export type ProgressStep = {
  key: string;
  label: string;
  done: boolean;
};

export type RegistrantProgress = {
  steps: ProgressStep[];
  doneCount: number;
  total: number;
  percent: number;
  currentStep: string;
  profileUrl: string;
  adminProfileUrl: string;
};

export function profilePath(slug: string): string {
  return slug ? `/athletes/${slug}` : '';
}

export function profileUrl(slug: string): string {
  const path = profilePath(slug);
  return path ? `${getSiteUrl()}${path}` : '';
}

export function getRegistrantProgress(athlete: AthleteAdmin): RegistrantProgress {
  const agreementDone = athlete.termsAgreed || Boolean(athlete.agreementSubmitted);
  const filesDone = Boolean(athlete.transcriptUrl && athlete.gameplayVideoUrl);
  const portalLive = athlete.status === 'Active';

  const steps: ProgressStep[] = [
    { key: 'registered', label: 'Registered', done: Boolean(athlete.submittedAt || athlete.id) },
    { key: 'profile', label: 'Profile created', done: Boolean(athlete.slug) },
    { key: 'agreement', label: 'Fee agreement', done: agreementDone },
    { key: 'files', label: 'Transcript & film', done: filesDone },
    { key: 'pay1', label: 'Stage 1 paid', done: athlete.feeStage1 },
    { key: 'pay2', label: 'Stage 2 paid', done: athlete.feeStage2 },
    { key: 'pay3', label: 'Stage 3 paid', done: athlete.feeStage3 },
    { key: 'portal', label: 'Portal active', done: portalLive },
  ];

  const doneCount = steps.filter((step) => step.done).length;
  const current = steps.find((step) => !step.done)?.label ?? 'Complete';
  const path = profilePath(athlete.slug);

  return {
    steps,
    doneCount,
    total: steps.length,
    percent: Math.round((doneCount / steps.length) * 100),
    currentStep: current,
    profileUrl: profileUrl(athlete.slug),
    adminProfileUrl: path,
  };
}

export function sortByNewest(a: AthleteAdmin, b: AthleteAdmin): number {
  const aDate = a.submittedAt || '';
  const bDate = b.submittedAt || '';
  return bDate.localeCompare(aDate);
}
