// CPR LaunchPad Template Config
// Every client-variable lives here. New client = new config, same layout.

export const site = {
  brand: {
    nameLine1: "CANADIAN PROSPECTS",
    nameLine2: "RECRUITMENT",
    tagline: "FINDING OPPORTUNITY. BUILDING FUTURES.",
    logo: "/cpr-logo.png",
  },
  colors: {
    red: "#B21712",
    redBright: "#C8102E",
    black: "#0C0C0A",
    dark: "#08090B",
    offWhite: "#F7F7F7",
    white: "#FFFFFF",
  },
  links: {
    apply: "/apply",
    video: "https://youtu.be/iqietCwnCxc",
    instagram: "https://instagram.com/mississaugamagic",
    instagramProspects: "https://instagram.com/prospects.ca",
    facebook: "https://www.facebook.com/mississaugamagic21",
  },
  nav: ["HOME", "TESTIMONIALS", "PROGRAMS", "CAMPS", "APPLY", "CONTACT"],
  hero: {
    headline: "Canadian Prospects.ca has gone Global!",
    subheadline: "We now service dreams for kids all over the world!",
    tagline: "Take your first steps to make your dream come true!",
    image: "/hero-committed.jpg",
  },
  testimonials: {
    heading: "WHAT FAMILIES & PLAYERS ARE SAYING",
    items: [
      {
        quote:
          'To a coach who leads with integrity and who supports the youths and challenges the norm. He has been a support system by coaching my 3 boys, 1 daughter, and 4 cousins. He gave my son an opportunity to go to Florida for training and events. I have trusted him with my family, who is sacred to me, for over a decade!',
        name: 'Nikki',
        role: 'CPR Parent',
        photo: '/testi-1.png',
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
  goals: {
    heading: ["SITE GOALS & ", "COACHING PHILOSOPHY", ""],
    sub: "The Global Game starts with development, discipline, and real opportunity.",
    points: [
      "Develop complete student-athletes on and off the court.",
      "Build confidence through exposure, structure, and accountability.",
      "Connect talent to real programs — locally and globally.",
      "Serve families with honesty, communication, and results.",
    ],
    image: "/proof-canada.jpg",
  },
  services: {
    heading: ["SERVICES & ", "PROGRAMS", ""],
    sub: "Everything CPR offers to help athletes reach the next level.",
    items: [
      { title: "Recruitment & Profile Building", desc: "Professional athlete profiles sent to the right coaches." },
      { title: "Camps & Showcases", desc: "Development and exposure at events that matter." },
      { title: "Coach Outreach", desc: "Structured communication and follow-up with programs." },
      { title: "Parent & Athlete Support", desc: "Guidance through every step of the recruiting journey." },
    ],
  },
  placements: {
    heading: "PLAYER PROFILES & RECENT PLACEMENTS",
    sub: "See how CPR athletes present themselves — and where they are heading.",
    profileCta: "VIEW SAMPLE PROFILE",
    profileSlug: "/athletes/jayden-thompson",
    items: [
      { img: "/proof-canada.jpg", caption: "CPR athlete competing for Team Canada." },
      { img: "/proof-champion.jpg", caption: "From CPR to a conference championship." },
      { img: "/jayden-photo.png", caption: "Recent CPR placement — next-level opportunity." },
    ],
  },
  enroll: {
    heading: "START YOUR CPR JOURNEY",
    sub: "Review the fee agreement, complete your application, and take the first step.",
    agreementLabel: "FEE AGREEMENT",
    agreementHref: "/agreement",
    applyLabel: "APPLICATION",
    applyHref: "/apply",
  },
  merchandise: {
    heading: "CPR MERCHANDISE",
    sub: "Shirts and hoodies — rep Canadian Prospects on and off the court.",
    note: "Merchandise ordering coming soon. Contact us for availability.",
    image: "/proof-team.jpg",
  },
  bio: {
    heading: "ABOUT MIKE McKENZIE",
    sub: "Founder, Canadian Prospects Recruitment",
    paragraphs: [
      "Mike McKenzie built Canadian Prospects Recruitment to give student-athletes a real path to opportunity — with structure, integrity, and heart.",
      "Through camps, coaching, and recruiting support, CPR has helped hundreds of families navigate the journey to the next level.",
    ],
    image: "/video-main.png",
  },
  coachPop: {
    heading: "COACH POP",
    quote:
      "It is not about any one person. It is about the standard you set every day — and the culture you build together.",
    attribution: "— Coach Pop",
  },
  process: {
    heading: ["OUR ", "RECRUITMENT", " PROCESS"],
    sub: "We make the recruiting process simple, organized and effective.",
    steps: [
      { n: "1. APPLY", d: "Complete your application and create your player profile.", icon: "apply" },
      { n: "2. UPLOAD", d: "Upload your mixtapes, YouTube links, pictures, teams and documents.", icon: "upload" },
      { n: "3. AGREEMENT", d: "Review and complete the Fee Structure Agreement to activate your profile.", icon: "agreement" },
      { n: "4. RECRUITING", d: "We send your profile to coaches and track responses.", icon: "recruiting" },
      { n: "5. OPPORTUNITIES", d: "We present real opportunities and guide you every step of the way.", icon: "opportunities" },
    ],
  },
  showcase: {
    heading: ["SHOWCASE", " YOUR TALENT"],
    sub: "Submit everything coaches need to evaluate you.",
    tiles: [
      { label: "Mixtapes / Game Film", icon: "film" },
      { label: "YouTube Links", icon: "youtube" },
      { label: "Photos", icon: "photos" },
      { label: "Teams", icon: "teams" },
      { label: "Transcripts", icon: "doc" },
      { label: "Report Cards", icon: "report" },
      { label: "Awards & Achievements", icon: "trophy" },
      { label: "Other Documents", icon: "folder" },
    ],
    cta: "START YOUR APPLICATION",
  },
  coachPanel: {
    heading: ["WHAT ", "COACHES", " RECEIVE"],
    sub: "A professional profile with the information they need.",
    athlete: {
      name: "JAYDEN THOMPSON",
      meta: "Point Guard  |  6'2\"  |  175 lbs  |  Class of 2026",
      team: "Mississauga Magic U18 AAA",
      photo: "/jayden-photo.png",
      rows: [
        ["GPA", "3.8"],
        ["SAT (Est.)", "1180"],
        ["Position", "PG"],
        ["High School", "Lorne Park SS"],
      ],
      videos: ["/video-main.png", "/video-2.png", "/video-3.png"],
    },
    cta: "VIEW SAMPLE PROFILE",
  },
  camps: {
    eyebrow: "CAMPS & EXPOSURE",
    heading: ["CAMPS THAT PUT ", "DEVELOPMENT", " IN MOTION"],
    tagline: "A Play To Win!",
    sub: "From skill development camps to national showcases, CPR athletes train, compete, and get seen by the right coaches at the right events.",
    cta: "START YOUR APPLICATION",
    slides: [
      { img: "/hero-athlete.png", caption: "CPR athletes sharpening skills on the court." },
      { img: "/proof-team.jpg", caption: "Team camps that build chemistry and competition." },
      { img: "/proof-canada.jpg", caption: "Exposure on national and international stages." },
    ],
  },
  winning: {
    eyebrow: "CHAMPIONSHIP MINDSET",
    heading: ["WINNING IS A ", "STANDARD", ", NOT A SLOGAN"],
    sub: "We develop athletes who compete with purpose — on the court, in the classroom, and in the recruiting process.",
    cta: "APPLY NOW",
    slides: [
      { img: "/proof-champion.jpg", caption: "From CPR to conference championships." },
      { img: "/hero-committed.jpg", caption: "Committed athletes. Serious results." },
      { img: "/proof-canada.jpg", caption: "Representing Canada at the highest level." },
    ],
  },
  track: {
    heading: ["WE ", "TRACK", ". YOU STAY INFORMED."],
    sub: "We manage the outreach. You see the results.",
    features: [
      { t: "Coach Outreach", d: "We send your profile to the right coaches and programs.", icon: "send" },
      { t: "Opportunity Management", d: "We help you manage interest, visits and offers.", icon: "manage" },
      { t: "Response Tracking", d: "Track opens, views and responses from coaches.", icon: "trackicon" },
      { t: "Real-Time Updates", d: "Your dashboard keeps you updated every step of the way.", icon: "updates" },
      { t: "School Interest", d: "See which schools are interested in you.", icon: "school" },
      { t: "Secure & Private", d: "Your information is safe and only shared with coaches.", icon: "lock" },
    ],
    image: "/dashboard.png",
  },
  stats: [
    { v: "500+", l: "ATHLETES ASSISTED" },
    { v: "1,000+", l: "COACH CONTACTS MADE" },
    { v: "250+", l: "SCHOOLS REACHED" },
    { v: "$25M+", l: "IN SCHOLARSHIP OPPORTUNITIES" },
  ],
  stories: {
    heading: "SUCCESS STORIES",
    items: [
      { img: "/proof-canada.jpg", caption: "CPR athlete competing for Team Canada." },
      { img: "/proof-champion.jpg", caption: "From CPR to a conference championship." },
      { img: "/proof-team.jpg", caption: "CPR athletes showcasing at the next level." },
    ],
  },
  tribute: {
    eyebrow: "IN MEMORIAM",
    name: "GEORGE RAVELING",
    meta: "Basketball Hall of Fame · Class of 2015 · 1937 – 2025",
    message: [
      "If we are lucky, we get to meet not only great men but good men. To have one man be both is extremely rare.",
      "In memory of one of the best human beings I've ever met. We can only try to stand on the shoulders of true giants.",
      "You are missed.",
    ],
    sign: "— Mike, Canadian Prospects Recruitment",
    slides: [
      { img: "/tribute/raveling-memorial.png" },
      { img: "/tribute/raveling-hall-of-fame.png" },
      { img: "/tribute/raveling-coaching-youth.png" },
      { img: "/tribute/raveling-gym-session.png" },
      { img: "/tribute/raveling-mentoring.png" },
      { img: "/tribute/raveling-team.png" },
      { img: "/tribute/raveling-portrait.png" },
      { img: "/tribute/raveling-family.png" },
      { img: "/tribute/raveling-dinner.png" },
    ],
  },
  cta: {
    heading: "READY TO TAKE THE NEXT STEP?",
    sub: "Start your application today and take control of your future.",
    button: "APPLY NOW",
  },
  footer: {
    about: "We connect Canadian student-athletes with opportunities to play basketball at the next level.",
    quickLinks: ["Testimonials", "Programs", "Camps", "Apply", "Contact"],
    resources: ["For Athletes", "For Parents", "NCAA Recruiting Guide", "Fee Agreement"],
    email: "mikecprglobal@mississaugamagic.com",
    instagramLabel: "@mississaugamagic",
    prospectsInstagramLabel: "@Prospects.ca",
    location: "Mississauga, Ontario",
    copyright: "© 2026 Canadian Prospects Recruitment. All Rights Reserved.",
  },
};
