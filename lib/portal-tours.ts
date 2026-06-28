/**
 * Guided tour step definitions for the CPR portal.
 *
 * Steps are plain serializable data so they can be passed from a Server
 * Component into the Driver.js client component. `element` is a CSS selector
 * (we tag portal elements with data-tour="..."); steps without an element
 * render as a centered modal.
 */

export type TourStep = {
  element?: string;
  title: string;
  description: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
};

export type PortalTourRole = 'athlete' | 'parent';

export function portalHomeTour(role: PortalTourRole, name: string): TourStep[] {
  const who = role === 'parent' ? 'parent' : 'athlete';
  const youOrAthlete = role === 'parent' ? 'your athlete' : 'you';

  return [
    {
      title: `Welcome${name ? `, ${name}` : ''}`,
      description:
        `This is your CPR ${who} portal — your recruiting command center. In about a minute we'll show you what it does and how to use it. You can replay this anytime from the Help button.`,
    },
    {
      element: '[data-tour="hub-cards"]',
      title: 'Everything in one place',
      description:
        'These cards are your quick links — recruiting dashboard, learning center, documents, and more. Tap any card to jump straight to that tool.',
      side: 'bottom',
    },
    {
      element: '[data-tour="action-center"]',
      title: 'Start here: your next steps',
      description:
        `The Action Center always shows what deserves attention right now, in priority order — so ${youOrAthlete} never face a blank screen wondering what to do next.`,
      side: 'top',
    },
    {
      element: '[data-tour="onboarding"]',
      title: 'Track your setup',
      description:
        'Your onboarding checklist: profile, video, photos, assessment, and review. As each step is completed it turns green and unlocks the next stage.',
      side: 'top',
    },
    {
      element: '[data-tour="roadmap"]',
      title: 'Your recruiting roadmap',
      description:
        'A grade-by-grade map of the whole journey — what to focus on now and what is coming next, tailored to the graduation year.',
      side: 'top',
    },
    {
      element: '[data-tour="learning-center"]',
      title: 'Learn how recruiting works',
      description:
        'Plain-language guides on timelines, eligibility (NCAA, NAIA, U SPORTS), and scholarships. New here? This is the best place to build confidence fast.',
      side: 'top',
    },
    {
      element: 'a[href$="/updates"]',
      title: 'Real-time updates',
      description:
        'The Update Portal is your live feed — every coach outreach, school response, and CPR action shows up here as it happens.',
      side: 'bottom',
    },
    {
      element: 'a[href$="/messaging-center"]',
      title: 'Talk to CPR directly',
      description:
        'Use Messages and Ask CPR to reach Coach Mike and the team with any question along the way.',
      side: 'bottom',
    },
    {
      element: '.uc-fab',
      title: 'Your guide, anytime',
      description:
        'Stuck or unsure what to do next? Tap Guide for instant direction to the right next step.',
      side: 'left',
    },
    {
      title: "You're ready",
      description:
        'That\'s the tour. Explore freely — the Action Center will always point you to the next best step, and Help (top right) replays this walkthrough whenever you need it.',
    },
  ];
}
