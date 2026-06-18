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
    facebook: "https://www.facebook.com/mississaugamagic21",
  },
  nav: ["HOME", "ABOUT US", "HOW IT WORKS", "SUCCESS STORIES", "FAQ", "CONTACT"],
  hero: {
    line1: "YOUR NEXT",
    line2: "OPPORTUNITY",
    line3: "STARTS HERE.",
    sub: "We help Canadian student-athletes get noticed by college coaches and find the right school to compete and succeed.",
    image: "/hero-committed.jpg",
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
  cta: {
    heading: "READY TO TAKE THE NEXT STEP?",
    sub: "Start your application today and take control of your future.",
    button: "APPLY NOW",
  },
  footer: {
    about: "We connect Canadian student-athletes with opportunities to play basketball at the next level.",
    quickLinks: ["About Us", "How It Works", "Success Stories", "FAQ", "Contact"],
    resources: ["For Athletes", "For Parents", "NCAA Recruiting Guide", "Fee Agreement"],
    email: "mikecrpglobal@mississaugamagic.com",
    instagramLabel: "@mississaugamagic",
    location: "Mississauga, Ontario",
    copyright: "© 2026 Canadian Prospects Recruitment. All Rights Reserved.",
  },
};
