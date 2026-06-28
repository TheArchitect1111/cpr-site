/** EA Landing Page Chassis™ — configurable section types. Build once. Deploy everywhere. */

export type LandingBrand = {
  nameLine1: string;
  nameLine2: string;
  tagline: string;
  logo: string;
};

export type LandingLinks = {
  apply: string;
  video: string;
  agreement?: string;
  internationalAgreement?: string;
  schedule?: string;
  instagram?: string;
  instagramSecondary?: string;
  facebook?: string;
};

export type GallerySlide = { img: string; caption?: string };

export type PlayerProfileCard = {
  name: string;
  slug: string;
  photo: string;
  meta?: string;
};

export type NavItem = { label: string; href: string };

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  photo: string;
};

export type DifferenceCard = {
  title: string;
  description: string;
};

export type ProcessStep = {
  label: string;
  description: string;
  icon: string;
};

export type PortalFeature = {
  title: string;
  description: string;
  icon: string;
};

export type ProofItem = {
  image: string;
  caption: string;
  athleteName?: string;
};

export type StatItem = {
  value: string;
  label: string;
};

export type LandingPageConfig = {
  brand: LandingBrand;
  colors: {
    primary: string;
    primaryBright: string;
    black: string;
    dark: string;
    offWhite: string;
    white: string;
  };
  links: LandingLinks;
  nav: NavItem[];
  /** 1. POSSIBILITY — lead with the dream */
  possibility: {
    announcement?: string;
    headline: string;
    subheadline: string;
    supporting: string;
    image: string;
    applyLabel?: string;
    videoLabel?: string;
  };
  /** Optional "About" credentials band (e.g. About CPR) */
  about?: {
    heading: string;
    intro?: string;
    points: string[];
  };
  /** 2. SOCIAL PROOF — max 3 testimonials */
  socialProof: {
    heading: string;
    items: Testimonial[];
  };
  /** Optional philosophy quote band (e.g. Coach Pop) */
  philosophy?: {
    label: string;
    quote: string;
    attribution: string;
    points?: string[];
  };
  /** Optional path statement band (replaces legacy difference section) */
  pathBand?: { text: string };
  /** @deprecated removed from CPR homepage */
  challenge?: {
    heading: string;
    intro: string;
    painPoints: string[];
  };
  /** @deprecated removed from CPR homepage */
  difference?: {
    heading: string;
    subheading: string;
    cards: DifferenceCard[];
  };
  /** Training achievements gallery */
  chipsAndDrip?: {
    heading: string;
    body: string;
    slides: GallerySlide[];
  };
  /** 5. HOW IT WORKS */
  process: {
    heading: string;
    subheading: string;
    subheadingEmphasis?: boolean;
    steps: ProcessStep[];
  };
  /** Camps & exposure (replaces family portal section) */
  campsExposure?: {
    heading: string;
    body: string;
    slides: GallerySlide[];
    dashboardImage?: string;
  };
  /** @deprecated use campsExposure */
  portal?: {
    heading: string;
    subheading: string;
    features: PortalFeature[];
    dashboardImage: string;
  };
  /** 7. RESULTS — combined proof */
  results: {
    heading: string;
    subheading: string;
    stats: StatItem[];
    proofs: ProofItem[];
    playerProfiles?: PlayerProfileCard[];
    profileCta?: string;
    profileHref?: string;
  };
  /** 8. MEET FOUNDER (optional) */
  founder?: {
    heading: string;
    role: string;
    story: string;
    image: string;
  };
  /** 9. FINAL CTA */
  finalCta: {
    heading: string;
    subheading: string;
    applyLabel: string;
    agreementLabel?: string;
    internationalAgreementLabel?: string;
    scheduleLabel?: string;
  };
  /** Optional in-memoriam band (above footer contact) */
  tribute?: {
    eyebrow: string;
    name: string;
    meta: string;
    message: string[];
    sign?: string;
    slides: { img: string; caption?: string }[];
  };
  footer: {
    about: string;
    quickLinks: NavItem[];
    resources: { label: string; href: string }[];
    email: string;
    instagramLabel: string;
    prospectsInstagramLabel?: string;
    location: string;
    copyright: string;
  };
};
