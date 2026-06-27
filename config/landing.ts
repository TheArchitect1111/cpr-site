import type { LandingPageConfig } from '@/lib/landing-chassis/types';
import { site } from './site';

export const PLAYER_APPLICATION_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScnS-NAIhJnNDCVMbhFtAPbEtYZT9ZzZytagNu1THa9f80qmg/viewform?usp=publish-editor';

/** CPR instance of EA Landing Page Chassis™ — swap config, keep framework. */
export const landingConfig: LandingPageConfig = {
  brand: {
    nameLine1: 'CPR',
    nameLine2: 'GLOBAL PROSPECTS',
    tagline: 'DEVELOPING TALENT. BUILDING FUTURES.',
    logo: '/cpr-logo.png',
  },
  colors: {
    primary: '#D71920',
    primaryBright: '#FF2A2A',
    black: '#050505',
    dark: '#0B0B0D',
    offWhite: '#0B0B0D',
    white: '#FFFFFF',
  },
  links: {
    apply: PLAYER_APPLICATION_URL,
    video: 'https://youtu.be/iqietCwnCxc',
    agreement: 'https://forms.gle/idrMWqU5FpebA1f46',
    instagram: 'https://instagram.com/mississaugamagic',
    instagramSecondary: 'https://instagram.com/prospects.ca',
    facebook: 'https://www.facebook.com/mississaugamagic21',
  },
  nav: [
    { label: 'HOME', href: '#top' },
    { label: 'ABOUT', href: '#testimonials' },
    { label: 'PROGRAMS', href: '#how-it-works' },
    { label: 'RECRUITING', href: '#results' },
    { label: 'EVENTS', href: '#camps' },
    { label: 'RESOURCES', href: '#apply' },
    { label: 'PORTAL', href: '/portal/login' },
    { label: 'CONTACT', href: '#contact' },
  ],
  possibility: {
    headline: "More than basketball. It's a movement.",
    subheadline:
      'CPR Global Prospects empowers student-athletes with exposure, training, and guidance to reach their full potential on and off the court.',
    supporting:
      'Elite development, recruiting support, camp exposure, and family guidance built for the global game.',
    image: '/hero-committed.jpg',
    applyLabel: 'GET STARTED',
    videoLabel: 'WATCH VIDEO',
  },
  about: {
    heading: 'ABOUT CPR',
    points: [
      'We have over 40 years of coaching experience!',
      '13 years of recruitment!',
      'Established relationships with coaches and Athletic Directors all over North America!',
    ],
  },
  socialProof: {
    heading: 'WHAT FAMILIES ARE SAYING',
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
    heading: 'BUILT FOR EVERY STEP OF THE JOURNEY',
    subheading: 'Elite player development, trusted family support, global recruiting opportunities, and one connected platform.',
    subheadingEmphasis: true,
    steps: [
      { label: '1. APPLY', description: 'Start the CPR journey with a clear player application.', icon: 'apply' },
      { label: '2. EVALUATE', description: 'Review film, goals, academics, and the athlete development path.', icon: 'upload' },
      { label: '3. DEVELOP', description: 'Build confidence through training, structure, and accountability.', icon: 'agreement' },
      { label: '4. EXPOSE', description: 'Use camps, events, and profiles to put athletes in front of opportunity.', icon: 'recruiting' },
      { label: '5. SUPPORT', description: 'Guide families before, during, and after the recruiting process.', icon: 'opportunities' },
    ],
  },
  chipsAndDrip: {
    heading: 'Where Development Meets Opportunity',
    body: 'CPR highlights the work behind the results: training, player development, athlete success, and achievements earned through preparation.',
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
    body: 'From skill development camps to national showcases, CPR athletes train, compete, and get seen by the right coaches at the right events.',
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
      { value: '100+', label: 'COLLEGE PLACEMENTS' },
      { value: '50+', label: 'PARTNER SCHOOLS' },
      { value: '20+', label: 'YEARS OF IMPACT' },
      { value: 'GLOBAL', label: 'OPPORTUNITIES' },
    ],
    proofs: [
      {
        image: '/proof-canada.jpg',
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
        athleteName: 'Pending',
        caption: 'Profile details pending.',
      },
    ],
    playerProfiles: [
      {
        name: 'Sample Profile',
        slug: 'jayden-thompson',
        photo: '/jayden-photo.png',
        meta: 'Example CPR recruiting profile',
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
    subheading: 'Start your application and review the fee agreement.',
    applyLabel: 'APPLY NOW',
    agreementLabel: 'FEE AGREEMENT',
  },
  footer: {
    about:
      'Developing talent. Building futures. Empowering student-athletes worldwide through basketball.',
    quickLinks: [
      { label: 'What Families Are Saying', href: '#testimonials' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Camps & Exposure', href: '#camps' },
      { label: 'Apply', href: PLAYER_APPLICATION_URL },
    ],
    resources: [
      { label: 'Athlete Profiles', href: '/athletes/jayden-thompson' },
      { label: 'Merchandise', href: '/merchandise' },
      { label: 'George Raveling Tribute', href: '#tribute' },
      { label: 'Fee Agreement', href: 'https://forms.gle/idrMWqU5FpebA1f46' },
    ],
    email: 'mikecrpglobal@mississaugamagic.com',
    instagramLabel: '@mississaugamagic',
    prospectsInstagramLabel: '@Prospects.ca',
    location: 'Durham, NC / Mississauga, Ontario',
    copyright: '© 2026 CPR Global Prospects. All Rights Reserved.',
  },
};
