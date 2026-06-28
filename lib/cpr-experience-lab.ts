/**
 * CPR Experience Lab™
 * A cinematic, scroll-based recruiting journey told through two student-athletes.
 *
 * Amara and Marcus are the heroes. Their families are beside them.
 * CPR is the trusted guide. Basketball is not the destination. Opportunity is.
 *
 * Note: Amara and Marcus are illustrative composite student-athletes used to
 * tell the recruiting journey. Imagery is original and not of current CPR members.
 */

import {
  PLAYER_APPLICATION_URL,
  STANDARD_FEE_AGREEMENT_URL,
  INTERNATIONAL_FEE_AGREEMENT_URL,
} from '@/config/landing';

export const experienceMeta = {
  title: 'CPR Experience Lab | The Journey to the Next Level',
  description:
    'Follow two student-athletes, Amara and Marcus, from a dream in an empty gym to opportunity at the next level, with CPR as the guide.',
  path: '/cpr-experience-lab',
} as const;

export const links = {
  apply: PLAYER_APPLICATION_URL,
  standardAgreement: STANDARD_FEE_AGREEMENT_URL,
  internationalAgreement: INTERNATIONAL_FEE_AGREEMENT_URL,
  profiles: '/athletes/jayden-thompson',
  contact: '/#contact',
} as const;

/** The two student-athletes we follow through the journey. */
export const athletes = {
  her: {
    name: 'Amara',
    full: 'Amara Okafor',
    role: 'Point Guard · Class of 2026',
    home: 'Mississauga, ON',
    portrait: '/experience-lab/cpx-her-portrait.png',
  },
  him: {
    name: 'Marcus',
    full: 'Marcus Reyes',
    role: 'Wing · Class of 2025',
    home: 'Scarborough, ON',
    portrait: '/experience-lab/cpx-his-portrait.png',
  },
} as const;

export const hero = {
  eyebrow: 'CPR Experience Lab',
  title: 'Two Players.',
  titleAccent: 'One Journey.',
  sub: 'Meet Amara and Marcus. Basketball is not the destination. Opportunity is.',
  image: '/experience-lab/cpx-hero-dual.png',
  imageAlt: 'Two young student-athletes standing back to back under arena lighting',
  cta: { label: 'Begin The Journey', href: '#dream' },
} as const;

export const dream = {
  id: 'dream',
  eyebrow: 'The Dream',
  headline: 'A Dream Worth Chasing',
  copy: 'Before the offers, before the highlight reels, before the next level, there is a young player and a family making sacrifices for a dream.',
  her: {
    image: '/experience-lab/cpx-her-dream.png',
    imageAlt: 'Amara training alone at dawn in an empty gym',
    line: 'For Amara, it starts at dawn. Empty gym. Just her and the ball.',
  },
  him: {
    image: '/experience-lab/cpx-his-dream.png',
    imageAlt: 'Marcus training alone late at night under a single light',
    line: 'For Marcus, it is the last shot of the night, long after everyone has gone home.',
  },
  beats: ['Early mornings', 'Long drives', 'Empty gyms', 'Homework after practice', 'Family sacrifice'],
} as const;

export const question = {
  id: 'question',
  eyebrow: 'The Question',
  headline: 'Talent Is Real.',
  headlineAccent: 'The Path Is Not Always Clear.',
  copy: 'Amara and Marcus both have ability. Like most families, theirs do not know where to start, who to trust, or which steps matter most.',
  image: '/experience-lab/cpx-parents.png',
  imageAlt: 'Parents watching from the stands, hopeful and uncertain',
  cards: [
    'Where do we start?',
    'Who should see my athlete?',
    'Which schools are realistic?',
    'How does recruiting really work?',
    'Are we already behind?',
  ],
} as const;

export const guide = {
  id: 'guide',
  eyebrow: 'The Guide',
  headline: 'Then Direction Arrives.',
  copy: 'Canadian Prospects Recruitment helps both families move from uncertainty to a clear, organized recruiting journey.',
  image: '/experience-lab/cpx-guide.png',
  imageAlt: 'A CPR coach guiding Amara and Marcus courtside',
  coachName: 'The CPR Guide',
  coachRole: 'Beside every athlete and family',
  doing: [
    'Watching games',
    'Talking with families',
    'Reviewing film',
    'Communicating with coaches',
    'Supporting athletes',
  ],
} as const;

export const beliefs = {
  id: 'beliefs',
  eyebrow: 'What CPR Believes',
  headline: 'The Future Is Bigger Than Basketball.',
  cards: [
    { title: 'Develop', body: 'Develop complete student-athletes on and off the court.' },
    { title: 'Build Confidence', body: 'Build confidence through exposure, structure, and accountability.' },
    { title: 'Connect', body: 'Connect talent to real programs locally and globally.' },
    { title: 'Serve', body: 'Serve families with honesty, communication, and results.' },
  ],
  globalNote:
    'Canadian Prospects has gone global. CPR now helps student-athletes pursue opportunities from around the world.',
} as const;

export const journey = {
  id: 'journey',
  eyebrow: 'The Journey',
  headline: 'A Simple, Organized Path From Application To Opportunity.',
  note: 'Amara and Marcus walk the same path. Every milestone is earned.',
  milestones: [
    'Apply',
    'Evaluation',
    'Personal Pathway',
    'Player Profile',
    'Film Review',
    'Training',
    'Camps & Exposure',
    'Coach Communication',
    'Campus Opportunities',
    'Commitment',
    'College Transition',
    'Life Beyond Basketball',
  ],
} as const;

export const quietWork = {
  id: 'quiet-work',
  eyebrow: 'Behind The Scenes',
  headline: 'While You See Practice,',
  headlineAccent: 'CPR Sees Possibility.',
  copy: 'Amara and Marcus stay focused on the game. Their families stay present. CPR manages the hidden details that move the journey forward.',
  image: '/experience-lab/cpx-quiet-work.png',
  imageAlt: 'A young athlete training while a parent watches from the sideline',
  activity: [
    { icon: 'profile', label: 'Player profile updated' },
    { icon: 'film', label: 'Film reviewed' },
    { icon: 'outreach', label: 'Coach outreach tracked' },
    { icon: 'event', label: 'Exposure event added' },
    { icon: 'docs', label: 'Documents organized' },
    { icon: 'notify', label: 'Family notified' },
    { icon: 'followup', label: 'Follow-up scheduled' },
    { icon: 'milestone', label: 'Recruiting milestone updated' },
  ],
} as const;

export const camps = {
  id: 'camps',
  eyebrow: 'Camps & Exposure',
  headline: 'Exposure Creates Opportunity.',
  copy: 'CPR helps athletes gain access to meaningful training, exposure, and invite-only opportunities designed to help the right people see the right player at the right time.',
  gallery: [
    { img: '/experience-lab/cpx-her-compete.png', caption: 'Amara competing where coaches are watching.' },
    { img: '/experience-lab/cpx-his-compete.png', caption: 'Marcus rising on the biggest stage.' },
    { img: '/experience-lab/cpx-quiet-work.png', caption: 'The work behind every opportunity.' },
    { img: '/experience-lab/cpx-guide.png', caption: 'Guidance at every event.' },
  ],
  features: [
    {
      image: '/experience-lab/cpx-her-compete.png',
      name: 'Amara',
      caption: 'Earning visibility at invite-only exposure events.',
    },
    {
      image: '/experience-lab/cpx-his-compete.png',
      name: 'Marcus',
      caption: 'Performing when the right coaches are in the gym.',
    },
    {
      image: '/experience-lab/cpx-hero-dual.png',
      name: 'The Next Player',
      caption: 'The next opportunity starts with the right exposure.',
    },
  ],
} as const;

export const profiles = {
  id: 'profiles',
  eyebrow: 'Player Profiles',
  headline: 'Every Athlete Needs A Story Coaches Can Understand.',
  copy: 'Modern, visual, recruiter-friendly profiles that put preparation, stats, film, and academics in one place, for Amara and Marcus alike.',
  dashboardImage: '/recruiting-dashboard-new.png',
  dashboardAlt: 'CPR recruiting profile dashboard',
  cards: [
    {
      photo: '/experience-lab/cpx-her-portrait.png',
      name: 'Amara Okafor',
      meta: 'Point Guard · Class of 2026 · Mississauga, ON',
      href: '/athletes/jayden-thompson',
    },
    {
      photo: '/experience-lab/cpx-his-portrait.png',
      name: 'Marcus Reyes',
      meta: 'Wing · Class of 2025 · Scarborough, ON',
      href: '/athletes/jayden-thompson',
    },
  ],
} as const;

export const results = {
  id: 'results',
  eyebrow: 'Results Speak',
  headline: 'The Scholarship Is Not The Ending.',
  headlineAccent: 'It Is The Beginning.',
  stats: [
    { value: '100+', label: 'College Placements' },
    { value: '50+', label: 'Partner Schools' },
    { value: '20+', label: 'Years Of Impact' },
    { value: 'GLOBAL', label: 'Opportunities' },
  ],
  outcomes: [
    'College opportunities',
    'Scholarship pathways',
    'National team moments',
    'Professional possibilities',
    'Graduation',
    'Leadership',
    'Life beyond basketball',
  ],
  proofs: [
    { image: '/experience-lab/cpx-her-commit.png', name: 'Amara', caption: 'Committed. Surrounded by the family who made it possible.' },
    { image: '/experience-lab/cpx-his-commit.png', name: 'Marcus', caption: 'Signing day. The first chapter of what comes next.' },
    { image: '/experience-lab/cpx-hero-dual.png', name: 'The Journey', caption: 'Two players who started with a dream and a guide.' },
  ],
} as const;

export const testimonials = {
  id: 'testimonials',
  eyebrow: 'Testimonials',
  headline: 'Trusted By Families.',
  items: [
    {
      quote:
        'To a coach who leads with integrity and who supports the youths and challenges the norm. He has been a support system by coaching my 3 boys, 1 daughter, and 4 cousins. He gave my son an opportunity to go to Florida for training and an event. I have trusted him with my family, who is sacred to me.',
      name: 'Nikki',
      role: 'CPR Parent',
      photo: '',
    },
    {
      quote:
        'Basketball was my first real love. I still love it. Training and playing with some incredibly talented players was an amazing experience. We are all still friends to this day. BTW I could have gone pro, but I decided to go a different route, one with less running involved lol.',
      name: 'Tresor Gray',
      role: 'Former CPR Player',
      photo: '',
    },
  ],
} as const;

export type ExploreCard = {
  title: string;
  description: string;
  href: string;
  variant: 'white' | 'red' | 'dark';
  external?: boolean;
};

export const explore = {
  id: 'explore',
  eyebrow: 'Explore CPR',
  headline: 'Start Your Journey.',
  cards: [
    {
      title: 'Apply Now',
      description: 'Start your CPR recruiting journey.',
      href: PLAYER_APPLICATION_URL,
      variant: 'white',
      external: true,
    },
    {
      title: 'Player Profiles',
      description: 'See how athletes are presented to coaches.',
      href: '/athletes/jayden-thompson',
      variant: 'dark',
    },
    {
      title: 'Fee Agreement',
      description: 'Review the standard CPR fee agreement.',
      href: STANDARD_FEE_AGREEMENT_URL,
      variant: 'red',
      external: true,
    },
    {
      title: 'International Fee Agreement',
      description: 'For student-athletes outside Canada.',
      href: INTERNATIONAL_FEE_AGREEMENT_URL,
      variant: 'red',
      external: true,
    },
    {
      title: 'Camps & Exposure',
      description: 'Training, events, and invite-only opportunities.',
      href: '#camps',
      variant: 'dark',
    },
    {
      title: 'Contact CPR',
      description: 'Talk with our team about your athlete.',
      href: '/#contact',
      variant: 'dark',
    },
  ] satisfies ExploreCard[],
} as const;

export const closing = {
  id: 'closing',
  headline: 'Where Could This Journey Take You?',
  copy: 'Helping student-athletes and families navigate the journey to the next level.',
  cta: { label: 'Apply Today', href: PLAYER_APPLICATION_URL },
  brandLine1: 'CANADIAN PROSPECTS',
  brandLine2: 'RECRUITMENT',
  tagline: 'Finding Opportunity. Building Futures.',
  logo: '/cpr-logo.png',
} as const;
