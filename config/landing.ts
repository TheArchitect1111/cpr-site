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
    agreement: '/agreement',
    schedule: 'mailto:mikecprglobal@mississaugamagic.com?subject=Schedule%20a%20Conversation',
    instagram: 'https://instagram.com/mississaugamagic',
    instagramSecondary: 'https://instagram.com/prospects.ca',
    facebook: 'https://www.facebook.com/mississaugamagic21',
  },
  nav: [
    { label: 'HOME', href: '#top' },
    { label: 'TESTIMONIALS', href: '#testimonials' },
    { label: 'HOW IT WORKS', href: '#how-it-works' },
    { label: 'PORTAL', href: '#portal' },
    { label: 'RESULTS', href: '#results' },
    { label: 'APPLY', href: '#apply' },
    { label: 'CONTACT', href: '#contact' },
  ],
  possibility: {
    headline: 'What becomes possible when talent meets preparation, exposure, and guidance?',
    subheadline:
      'Canadian Prospects.ca has gone global — we now help student-athletes pursue their dreams from all around the world.',
    supporting:
      'Helping student-athletes and families navigate the journey to the next level. Take your first step toward making your dream a reality.',
    image: '/hero-committed.jpg',
  },
  socialProof: {
    heading: 'WHAT FAMILIES & PLAYERS ARE SAYING',
    items: [
      {
        quote:
          'CPR opened doors we did not know existed. The process was organized, honest, and always focused on our son\'s future.',
        name: 'Parent of CPR Athlete',
        role: 'Parent Testimonial',
        photo: '/testi-1.png',
      },
      {
        quote:
          'From camps to coach outreach, CPR kept me prepared and confident. I always knew what the next step was.',
        name: 'Former CPR Player',
        role: 'Player Testimonial',
        photo: '/testi-2.png',
      },
      {
        quote:
          'Mike and his team treated our family like more than a number. They cared about the person, not just the profile.',
        name: 'CPR Parent',
        role: 'Parent Testimonial',
        photo: '/testi-3.png',
      },
    ],
  },
  philosophy: {
    label: 'COACHING PHILOSOPHY',
    quote:
      'Good coaches get players through drills... great coaches get players through life.',
    attribution: '— Gregg Popovich',
    points: [
      'Develop complete student-athletes on and off the court.',
      'Build confidence through exposure, structure, and accountability.',
      'Connect talent to real programs — locally and globally.',
      'Serve families with honesty, communication, and results.',
    ],
  },
  challenge: {
    heading: 'THE CHALLENGE',
    intro: 'Many athletes have talent. Most families do not know where to start or what steps matter most.',
    painPoints: [
      'Where to start the recruiting journey',
      'Which opportunities actually fit their athlete',
      'How recruiting works at each level',
      'How to reach the right coaches',
      'What steps matter most — and when',
    ],
  },
  difference: {
    heading: 'THE CPR DIFFERENCE',
    subheading: 'CPR helps families navigate the entire journey — with structure, integrity, and real results.',
    cards: [
      {
        title: 'Recruiting Support',
        description: 'Professional profiles and a clear path to the programs that fit.',
      },
      {
        title: 'Coach Outreach',
        description: 'Structured communication and follow-up with coaches and programs.',
      },
      {
        title: 'Development & Exposure',
        description: 'Camps, showcases, and events that put athletes in front of the right people.',
      },
      {
        title: 'Parent Guidance',
        description: 'Honest guidance for families through every step of the process.',
      },
    ],
  },
  process: {
    heading: 'HOW IT WORKS',
    subheading: 'A simple, organized path from application to opportunity.',
    steps: [
      { label: '1. APPLY', description: 'Complete your application and create your player profile.', icon: 'apply' },
      { label: '2. UPLOAD', description: 'Share film, photos, transcripts, and achievements.', icon: 'upload' },
      { label: '3. ACTIVATE', description: 'Review the fee agreement to activate your profile.', icon: 'agreement' },
      { label: '4. RECRUITING', description: 'We send your profile to coaches and track responses.', icon: 'recruiting' },
      { label: '5. OPPORTUNITIES', description: 'We present real opportunities and guide you forward.', icon: 'opportunities' },
    ],
  },
  portal: {
    heading: 'CPR FAMILY PORTAL',
    subheading:
      'Your dashboard for progress, outreach, updates, and next steps — built for athletes and families.',
    features: [
      { title: 'Family & Athlete Dashboards', description: 'One home for profiles, documents, and updates.', icon: 'manage' },
      { title: 'Coach Outreach Tracking', description: 'See who received your profile and who responded.', icon: 'send' },
      { title: 'Progress & Next Steps', description: 'Always know what to do next in the process.', icon: 'trackicon' },
      { title: 'Real-Time Updates', description: 'Communication center with status you can trust.', icon: 'updates' },
      { title: 'School Interest', description: 'Track which programs are engaging with your athlete.', icon: 'school' },
      { title: 'Secure & Private', description: 'Your information shared only with approved coaches.', icon: 'lock' },
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
      { image: '/proof-canada.jpg', caption: 'CPR athlete competing for Team Canada.' },
      { image: '/proof-champion.jpg', caption: 'From CPR to a conference championship.' },
      { image: '/jayden-photo.png', caption: 'Recent CPR placement — next-level opportunity.' },
    ],
    profileCta: 'VIEW SAMPLE PROFILE',
    profileHref: '/athletes/jayden-thompson',
  },
  founder: {
    heading: 'MEET MIKE',
    role: 'Founder, Canadian Prospects Recruitment',
    story:
      'Mike McKenzie built CPR to give student-athletes a real path to opportunity — with structure, integrity, and heart. One coach. One mission. Your family\'s guide to the next level.',
    image: '/video-main.png',
  },
  finalCta: {
    heading: 'READY TO TAKE THE NEXT STEP?',
    subheading: 'Start your application, review the fee agreement, or schedule a conversation.',
    applyLabel: 'APPLY NOW',
    agreementLabel: 'FEE AGREEMENT',
    scheduleLabel: 'SCHEDULE A CONVERSATION',
  },
  tribute: {
    eyebrow: site.tribute.eyebrow,
    name: site.tribute.name,
    meta: site.tribute.meta,
    message: site.tribute.message,
    sign: site.tribute.sign,
    slides: site.tribute.slides.filter((_, i) => ![3, 4, 6].includes(i)),
  },
  footer: {
    about:
      'We connect student-athletes with opportunities to play basketball at the next level — locally and globally.',
    quickLinks: [
      { label: 'Testimonials', href: '#testimonials' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Portal', href: '#portal' },
      { label: 'Apply', href: '#apply' },
    ],
    resources: [
      { label: 'Camps & Exposure', href: '/camps' },
      { label: 'Athlete Profiles', href: '/athletes/jayden-thompson' },
      { label: 'Merchandise', href: '/merchandise' },
      { label: 'George Raveling Tribute', href: '#tribute' },
      { label: 'Fee Agreement', href: '/agreement' },
    ],
    email: 'mikecprglobal@mississaugamagic.com',
    instagramLabel: '@mississaugamagic',
    prospectsInstagramLabel: '@Prospects.ca',
    location: 'Mississauga, Ontario',
    copyright: '© 2026 Canadian Prospects Recruitment. All Rights Reserved.',
  },
};
