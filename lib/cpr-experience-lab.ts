/**
 * CPR Experience Lab™
 * A cinematic, scroll-based recruiting journey.
 *
 * The student-athlete is the hero. The parent is beside them.
 * CPR is the trusted guide. Basketball is not the destination. Opportunity is.
 */

import {
  PLAYER_APPLICATION_URL,
  STANDARD_FEE_AGREEMENT_URL,
  INTERNATIONAL_FEE_AGREEMENT_URL,
} from '@/config/landing';

export const experienceMeta = {
  title: 'CPR Experience Lab | Canadian Prospects Recruitment',
  description:
    'A cinematic recruiting journey. We help student-athletes and families navigate the path to the next level with preparation, exposure, guidance, and ongoing support.',
  path: '/cpr-experience-lab',
} as const;

export const links = {
  apply: PLAYER_APPLICATION_URL,
  standardAgreement: STANDARD_FEE_AGREEMENT_URL,
  internationalAgreement: INTERNATIONAL_FEE_AGREEMENT_URL,
  profiles: '/athletes/jayden-thompson',
  contact: '/#contact',
} as const;

export const hero = {
  eyebrow: 'CPR Experience Lab',
  title: 'Basketball Is Not The Destination.',
  titleAccent: 'Opportunity Is.',
  sub: 'Helping student-athletes and families navigate the journey to the next level.',
  image: '/hero-committed.jpg',
  imageAlt: 'A committed student-athlete looking toward what is next',
  cta: { label: 'Begin The Journey', href: '#dream' },
} as const;

export const dream = {
  id: 'dream',
  eyebrow: 'The Dream',
  headline: 'A Dream Worth Chasing',
  copy: 'Before the offers, before the highlight reels, before the next level, there is a family making sacrifices for a dream.',
  image: '/cpr-home/play-to-win/1000240212.jpg',
  imageAlt: 'A young athlete chasing a dream',
  beats: ['Early mornings', 'Long drives', 'Empty gyms', 'Homework after practice', 'Family sacrifice'],
} as const;

export const question = {
  id: 'question',
  eyebrow: 'The Question',
  headline: 'Talent Is Real.',
  headlineAccent: 'The Path Is Not Always Clear.',
  copy: 'Many athletes have ability. Most families do not know where to start, who to trust, or which steps matter most.',
  image: '/cpr-home/play-to-win/1000240218.jpg',
  imageAlt: 'Parents watching and wondering about the path ahead',
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
  copy: 'Canadian Prospects Recruitment helps families move from uncertainty to a clear, organized recruiting journey.',
  image: '/galleries/camps-exposure/camp-02.jpg',
  imageAlt: 'Coach Mike guiding athletes and families',
  coachName: 'Coach Mike',
  coachRole: 'Founder · Canadian Prospects Recruitment',
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
    {
      title: 'Develop',
      body: 'Develop complete student-athletes on and off the court.',
    },
    {
      title: 'Build Confidence',
      body: 'Build confidence through exposure, structure, and accountability.',
    },
    {
      title: 'Connect',
      body: 'Connect talent to real programs locally and globally.',
    },
    {
      title: 'Serve',
      body: 'Serve families with honesty, communication, and results.',
    },
  ],
  globalNote:
    'Canadian Prospects has gone global. CPR now helps student-athletes pursue opportunities from around the world.',
} as const;

export const journey = {
  id: 'journey',
  eyebrow: 'The Journey',
  headline: 'A Simple, Organized Path From Application To Opportunity.',
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
  copy: 'You stay focused on your athlete. We manage the hidden details that move the journey forward.',
  image: '/cpr-home/play-to-win/1000240232.jpg',
  imageAlt: 'An athlete training while parents watch',
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
    { img: '/galleries/camps-exposure/camp-01.jpg', caption: 'Invite-only camp exposure.' },
    { img: '/galleries/camps-exposure/camp-03.jpg', caption: 'Competing where coaches are watching.' },
    { img: '/galleries/camps-exposure/camp-04.jpg', caption: 'High-profile opportunities through preparation.' },
    { img: '/galleries/camps-exposure/camp-05.jpg', caption: 'Exposure moments that matter.' },
    { img: '/galleries/camps-exposure/camp-06.jpg', caption: 'Student-athletes earning visibility.' },
    { img: '/galleries/camps-exposure/camp-07.jpg', caption: 'The path from work to opportunity.' },
  ],
  features: [
    {
      image: '/proof-canada.jpg',
      name: 'Yohann Axel Sam',
      caption: 'Competing for Canada 3v3 in Chile.',
    },
    {
      image: '/proof-champion.jpg',
      name: 'Nat Jack',
      caption: 'Florida State · ACC Championship.',
    },
    {
      image: '/pending-profile-details.jpg',
      name: 'Your Athlete',
      caption: 'The next opportunity. Placeholder for the next story.',
    },
  ],
} as const;

export const profiles = {
  id: 'profiles',
  eyebrow: 'Player Profiles',
  headline: 'Every Athlete Needs A Story Coaches Can Understand.',
  copy: 'Modern, visual, recruiter-friendly profiles that put preparation, stats, film, and academics in one place.',
  dashboardImage: '/recruiting-dashboard-new.png',
  dashboardAlt: 'CPR recruiting profile dashboard',
  cards: [
    {
      photo: '/sample-profile-dashboard.png',
      name: 'Sample Profile',
      meta: 'Example CPR recruiting profile',
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
    { image: '/proof-canada.jpg', name: 'Yohann Axel Sam', caption: 'Team Canada 3v3 · Chile' },
    { image: '/proof-champion.jpg', name: 'Nat Jack', caption: 'Florida State' },
    { image: '/proof-team.jpg', name: 'CPR Family', caption: 'Built together, on and off the court' },
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
      photo: '/testimonial-nikki-blessed.jpg',
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
  headline: 'Take Your Next Step.',
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
