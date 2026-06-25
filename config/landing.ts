import type { LandingPageConfig } from '@/lib/landing-chassis/types';
import { site } from './site';

/** CPR instance of EA Landing Page Chassis™ — swap config, keep framework. */
export const landingConfig: LandingPageConfig = {
  brand: {
    nameLine1: 'CANADIAN PROSPECTS',
    nameLine2: 'RECRUITMENT',
    tagline: 'FINDING OPPORTUNITY. BUILDING FUTURES.',
    logo: '/cpr-logo.png',
  },
  colors: {
    primary: '#B21712',
    primaryBright: '#C8102E',
    black: '#0C0C0A',
    dark: '#08090B',
    offWhite: '#F7F7F7',
    white: '#FFFFFF',
  },
  links: {
    apply: '/apply',
    video: 'https://youtu.be/iqietCwnCxc',
    agreement: 'https://forms.gle/idrMWqU5FpebA1f46',
    internationalAgreement: 'https://forms.gle/idrMWqU5FpebA1f46',
    instagram: 'https://instagram.com/mississaugamagic',
    instagramSecondary: 'https://instagram.com/prospects.ca',
    facebook: 'https://www.facebook.com/mississaugamagic21',
  },
  nav: [
    { label: 'HOME', href: '#top' },
    { label: 'TESTIMONIALS', href: '#testimonials' },
    { label: 'HOW IT WORKS', href: '#how-it-works' },
    { label: 'CAMPS', href: '#camps' },
    { label: 'RESULTS', href: '#results' },
    { label: 'APPLY', href: '#apply' },
    { label: 'CONTACT', href: '#contact' },
    { label: 'POSSIBILITIES', href: '/possibilities' },
  ],
  possibility: {
    headline: 'What becomes possible when talent meets preparation, exposure, and guidance?',
    subheadline:
      'Canadian Prospects.ca has gone global — we now help Student-Athletes pursue their dreams from all around the World.',
    supporting:
      'Helping Student-Athletes navigate the journey to the next level. Take your first step toward making your dream a reality.',
    image: '/hero-committed.jpg',
  },
  socialProof: {
    heading: 'WHAT FAMILIES & PLAYERS ARE SAYING',
    items: [
      {
        quote:
          'To a coach who leads with integrity and who supports the youths and challenge the norm. He has been a support system by coaching my 3 boys, 1 daughter, and 4 cousins. He gave my son an opportunity to go to Florida for training and an event. I have trusted him with my family, who is Sacred to me',
        name: 'Nikki',
        role: 'CPR Parent',
        photo: '/testimonial-nikki-blessed.jpg',
      },
      {
        quote:
          'Basketball was my first real love. I still love it. Training and playing with some incredibly talented players was an amazing experience! We are all still friends to this day! BTW I could have gone Pro but I decided to go a different route...one with less running involved lol!',
        name: 'Tresor Gray',
        role: 'Former CPR Player',
        photo: '/testi-2.png',
      },
    ],
  },
  philosophy: {
    label: 'COACHING PHILOSOPHY',
    quote: 'Good coaches get players through drills... great coaches get players through life.',
    attribution: '— Gregg Popovich',
  },
  pathBand: {
    text: 'A simple, organized path from application to opportunity.',
  },
  process: {
    heading: 'HOW IT WORKS',
    subheading: 'A simple, organized path from application to opportunity.',
    subheadingEmphasis: true,
    steps: [
      { label: '1. APPLY', description: 'Complete your application and create your player profile.', icon: 'apply' },
      { label: '2. UPLOAD', description: 'Share film, photos, transcripts, and achievements.', icon: 'upload' },
      { label: '3. ACTIVATE', description: 'Review the fee agreement to activate your profile.', icon: 'agreement' },
      { label: '4. RECRUITING', description: 'We send your profile to coaches and track responses.', icon: 'recruiting' },
      { label: '5. OPPORTUNITIES', description: 'We present real opportunities and guide you forward.', icon: 'opportunities' },
    ],
  },
  chipsAndDrip: {
    heading: 'Chips and Drip',
    body: 'Part of our program consists of training! Some of our players have gone on to some amazing achievements.',
    slides: [
      { img: '/galleries/chips-and-drip/chips-01.jpg', caption: 'Training, growth, and player development.' },
      { img: '/galleries/chips-and-drip/chips-02.jpg', caption: 'Players building toward the next level.' },
      { img: '/galleries/chips-and-drip/chips-03.jpg', caption: 'Achievements earned through preparation.' },
      { img: '/galleries/chips-and-drip/chips-04.jpg', caption: 'CPR athletes putting in the work.' },
      { img: '/galleries/chips-and-drip/chips-05.jpg', caption: 'Training is part of the journey.' },
      { img: '/galleries/chips-and-drip/chips-06.jpg', caption: 'Momentum, confidence, and progress.' },
      { img: '/galleries/chips-and-drip/chips-07.jpg', caption: 'Program pride and player growth.' },
      { img: '/galleries/chips-and-drip/chips-08.jpg', caption: 'The work behind the opportunity.' },
    ],
  },
  campsExposure: {
    heading: 'Camps and Exposure',
    body: 'We are fortunate to be able to help kids into several high profile Invite Only Camps as part of our program. Check out our All Star Camp performers!',
    slides: [
      { img: '/galleries/camps-exposure/camp-01.jpg', caption: 'Invite-only camp exposure.' },
      { img: '/galleries/camps-exposure/camp-02.jpg', caption: 'All Star Camp performers.' },
      { img: '/galleries/camps-exposure/camp-03.jpg', caption: 'Competing where coaches are watching.' },
      { img: '/galleries/camps-exposure/camp-04.jpg', caption: 'High-profile opportunities through preparation.' },
      { img: '/galleries/camps-exposure/camp-05.jpg', caption: 'Exposure moments that matter.' },
      { img: '/galleries/camps-exposure/camp-06.jpg', caption: 'Student-athletes earning visibility.' },
      { img: '/galleries/camps-exposure/camp-07.jpg', caption: 'The path from work to opportunity.' },
    ],
    dashboardImage: '/dashboard.png',
  },
  results: {
    heading: 'RESULTS THAT SPEAK',
    subheading: 'Placements, commitments, and success stories — proof CPR changes lives.',
    stats: [
      { value: '500+', label: 'ATHLETES ASSISTED' },
      { value: '1,000+', label: 'COACH CONTACTS MADE' },
      { value: '250+', label: 'SCHOOLS REACHED' },
      { value: '$25M+', label: 'IN SCHOLARSHIP OPPORTUNITIES' },
    ],
    proofs: [
      {
        image: '/proof-yohann-axel-sam.jpg',
        athleteName: 'Yohann Axel Sam',
        caption: 'Competing for Canada 3v3 in Chile',
      },
      {
        image: '/proof-champion.jpg',
        athleteName: 'Nat Jack',
        caption: 'Florida State',
      },
      {
        image: '/jayden-photo.png',
        athleteName: 'Third image pending',
        caption: 'Caption pending',
      },
    ],
    playerProfiles: [
      {
        name: 'Jayden Thompson',
        slug: 'jayden-thompson',
        photo: '/jayden-photo.png',
        meta: 'Point Guard · Class of 2026',
      },
    ],
  },
  tribute: {
    eyebrow: site.tribute.eyebrow,
    name: site.tribute.name,
    meta: site.tribute.meta,
    message: site.tribute.message,
    slides: site.tribute.slides
      .filter((slide) => !slide.img.includes('bill-russell'))
      .map((slide) => ({ img: slide.img })),
  },
  finalCta: {
    heading: 'READY TO TAKE THE NEXT STEP?',
    subheading: 'Start your application and review the fee agreements.',
    applyLabel: 'APPLY NOW',
    agreementLabel: 'FEE AGREEMENT',
    internationalAgreementLabel: 'INTERNATIONAL FEE AGREEMENT',
  },
  footer: {
    about:
      'We connect student-athletes with opportunities to play basketball at the next level — locally and globally.',
    quickLinks: [
      { label: 'Testimonials', href: '#testimonials' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Camps & Exposure', href: '#camps' },
      { label: 'Apply', href: '#apply' },
    ],
    resources: [
      { label: 'Athlete Profiles', href: '/athletes/jayden-thompson' },
      { label: 'Merchandise', href: '/merchandise' },
      { label: 'George Raveling Tribute', href: '#tribute' },
      { label: 'Fee Agreement', href: 'https://forms.gle/idrMWqU5FpebA1f46' },
      { label: 'International Fee Agreement', href: 'https://forms.gle/idrMWqU5FpebA1f46' },
    ],
    email: 'mikecprglobal@mississaugamagic.com',
    instagramLabel: '@mississaugamagic',
    prospectsInstagramLabel: '@Prospects.ca',
    location: 'Mississauga, Ontario',
    copyright: '© 2026 Canadian Prospects Recruitment. All Rights Reserved.',
  },
};
