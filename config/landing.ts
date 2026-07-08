import type { LandingPageConfig } from '@/lib/landing-chassis/types';
import { site } from './site';

export const PLAYER_APPLICATION_URL =
  '/apply';
export const STANDARD_FEE_AGREEMENT_URL = '/apply';
export const INTERNATIONAL_FEE_AGREEMENT_URL = '/apply';

/** CPR instance of EA Landing Page Chassis™ — swap config, keep framework. */
export const landingConfig: LandingPageConfig = {
  brand: {
    nameLine1: 'CANADIAN PROSPECTS',
    nameLine2: 'RECRUITMENT',
    tagline: 'FINDING OPPORTUNITY. BUILDING FUTURES.',
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
    agreement: STANDARD_FEE_AGREEMENT_URL,
    internationalAgreement: INTERNATIONAL_FEE_AGREEMENT_URL,
    instagram: 'https://instagram.com/mississaugamagic',
    instagramSecondary: 'https://instagram.com/prospects.ca',
    facebook: 'https://www.facebook.com/mississaugamagic21',
  },
  nav: [
    { label: 'HOME', href: '#top', icon: 'home' },
    { label: 'EXPERIENCE', href: '/cpr-experience-lab', icon: 'star' },
    { label: 'ABOUT', href: '#testimonials', icon: 'user' },
    { label: 'PROGRAMS', href: '#how-it-works', icon: 'school' },
    { label: 'RECRUITING', href: '/recruitment', icon: 'recruiting' },
    { label: 'EVENTS', href: '#camps', icon: 'calendar' },
    { label: 'RESOURCES', href: '/resources', icon: 'book' },
    { label: 'PORTAL', href: '/portal/login', icon: 'lock' },
    { label: 'CONTACT', href: '#contact', icon: 'mail' },
  ],
  possibility: {
    announcement:
      'Canadian Prospects.ca has gone global. We now help Student-Athletes pursue their dreams from all around the world.',
    headline: 'CANADIAN PROSPECTS RECRUITMENT',
    subheadline: 'What becomes possible when talent meets preparation, exposure, and guidance?',
    supporting:
      'Helping Student-Athletes navigate the journey to the next level. Take your first step toward making your dream a reality.',
    image: '/hero-committed.jpg',
    applyLabel: 'Apply Now',
    videoLabel: 'WATCH VIDEO',
  },
  about: {
    heading: 'ABOUT CPR',
    points: [
      'Over 40 years of coaching experience',
      '13 years of recruitment experience',
      'Established relationships with coaches and Athletic Directors throughout North America',
    ],
  },
  socialProof: {
    heading: 'Testimonials',
    items: [
      {
        quote:
          "Our experience with the basketball recruitment process has been exceptional. What I appreciate most is the genuine support we received from Coach Mike throughout the journey. He consistently checks on our player's progress, well-being, and overall experience, making us feel valued and supported every step of the way.\n\nWhat truly sets this service apart is that the support does not end once recruitment is completed. Coach Mike continues to stay connected to ensure that both the student-athlete and the parents are happy, satisfied, and adjusting well to their new environment. His commitment, care, and dedication go beyond recruitment, providing ongoing guidance and reassurance for the entire family.\n\nWe are grateful for the personalized attention and highly recommend this program to any family navigating the basketball recruitment process.",
        name: 'Mrs. Hallarces',
        role: 'CPR Parent',
        photo: '/testimonial-nikki-blessed.jpg',
      },
      {
        quote:
          "Those years were the most fun I've had playing basketball! Learned a lot and met some of my closest friends playing!",
        name: 'Anthony Bennett',
        role: 'Former CPR Player',
        photo: '/testi-2.png',
      },
      {
        quote:
          "Basketball was essentially all I did for the majority of my life. It's all I wanted to do. Choosing to train and work with Mike McKenzie enabled me to achieve my dreams and develop my skills to an extremely high level. I thank him for everything he put me through to make me the athlete and man I am today.",
        name: 'Nat Jack',
        role: 'Former CPR Player',
        photo: '/proof-champion.jpg',
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
    body: 'Chips and Drip is where CPR celebrates the work behind the results. Player development and training are a major part of what CPR provides, helping student-athletes sharpen their skills, build confidence, and prepare for the next level. Several athletes have gone on to achieve outstanding success because they committed to the process, the training, and the opportunities created through the program.',
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
    body: 'CPR camp programs give student-athletes a structured place to develop, compete, and be evaluated. Camps focus on skill development, preparation, exposure, confidence, and live competition so athletes can sharpen their game and be seen by the right coaches at the right events.',
    slides: [
      { img: '/galleries/camps-exposure/camp-01.jpg', caption: 'Invite-only camp exposure.' },
      { img: '/galleries/camps-exposure/camp-02.jpg', caption: 'All Star Camp performers.' },
      { img: '/galleries/camps-exposure/camp-03.jpg', caption: 'Competing where coaches are watching.' },
      { img: '/galleries/camps-exposure/camp-04.jpg', caption: 'High-profile opportunities through preparation.' },
      { img: '/galleries/camps-exposure/camp-05.jpg', caption: 'Exposure moments that matter.' },
      { img: '/galleries/camps-exposure/camp-06.jpg', caption: 'Student-athletes earning visibility.' },
      { img: '/galleries/camps-exposure/camp-07.jpg', caption: 'The path from work to opportunity.' },
    ],
    dashboardImage: '/recruiting-dashboard-new.png',
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
        image: '/pending-profile-details.jpg',
        athleteName: 'Anthony Bennett',
        caption: "Canada's First #1 NBA Draft Choice.",
      },
    ],
    playerProfiles: [
      {
        name: 'Sample Profile',
        slug: 'jayden-thompson',
        photo: '/sample-profile-dashboard.png',
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
      .filter((slide) => !slide.img.includes('bill-russell') && !slide.img.includes('real-youth') && !slide.img.includes('coaching-youth'))
      .map((slide) => ({ img: slide.img })),
  },
  finalCta: {
    heading: 'READY TO TAKE THE NEXT STEP?',
    subheading: 'Start your application and review the fee agreement.',
    applyLabel: 'APPLY NOW',
    agreementLabel: 'STANDARD FEE AGREEMENT',
    internationalAgreementLabel: 'INTERNATIONAL FEE AGREEMENT',
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
      { label: 'Standard Fee Agreement', href: STANDARD_FEE_AGREEMENT_URL },
      { label: 'International Fee Agreement', href: INTERNATIONAL_FEE_AGREEMENT_URL },
    ],
    email: 'mikecprglobal@mississaugamagic.com',
    instagramLabel: '@mississaugamagic',
    prospectsInstagramLabel: '@Prospects.ca',
    location: 'Durham, NC / Mississauga, Ontario',
    copyright: '© 2026 CPR Global Prospects. All Rights Reserved.',
  },
};
