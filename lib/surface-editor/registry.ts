import { site, EXPERIENCE_LAB_PATH, INTERNATIONAL_EXPERIENCE_URL } from '@/config/site';
import { experienceLabDefaults } from '@/lib/cpr-experience-lab';
import { defineEditableSurface, type EditableSurfaceManifest } from './types';

export const recruitmentSurface = defineEditableSurface({
  id: 'recruitment',
  label: 'Recruitment',
  route: '/recruitment',
  kind: 'website',
  description: 'Recruitment overview, image and application call to action.',
  sections: [
    { id: 'hero', label: 'Hero', description: 'Page title and introduction.', contentPath: 'hero' },
    { id: 'overview', label: 'Recruitment overview', description: 'Main story, image and button.', contentPath: 'overview' },
  ],
  defaults: {
    hero: { title: 'Recruitment', description: 'CPR helps student-athletes prepare, build their profile, gain exposure, and connect with coaches and Athletic Directors throughout North America.' },
    overview: { heading: 'Finding opportunity. Building futures.', body: 'Recruitment support includes profile building, coach outreach, guidance for families, exposure strategy, and ongoing support as athletes navigate the journey to the next level.', imageUrl: '/recruiting-dashboard-new.png', imageAlt: 'CPR recruiting dashboard', ctaLabel: 'Apply Now', ctaUrl: site.links.apply },
  },
});

export const resourcesSurface = defineEditableSurface({
  id: 'resources',
  label: 'Resources',
  route: '/resources',
  kind: 'website',
  description: 'Resource cards and destinations shared with families.',
  sections: [
    { id: 'hero', label: 'Hero', description: 'Page title and introduction.', contentPath: 'hero' },
    { id: 'cards', label: 'Resource cards', description: 'Add, remove, reorder or edit resource cards.', contentPath: 'cards' },
  ],
  defaults: {
    hero: { title: 'Resources', description: 'Helpful links, forms, profile access, and CPR tools for student-athletes and families.' },
    cards: [
      { title: 'The Experience', description: 'Share CPR\'s cinematic recruiting journey presentation with families.', url: EXPERIENCE_LAB_PATH },
      { title: 'Application', description: 'Start the CPR journey and share the information needed for next steps.', url: site.links.apply },
      { title: 'North America Fee Agreement', description: 'North American families — same form as Apply Now.', url: site.links.standardAgreement },
      { title: 'International Experience', description: 'Explore CPR guidance and opportunities for international student-athletes and families.', url: INTERNATIONAL_EXPERIENCE_URL },
      { title: 'International Fee Agreement', description: 'Review and complete the international fee agreement.', url: site.links.internationalAgreement },
      { title: 'Sample Profile', description: 'View the sample recruiting profile experience.', url: '/athletes/jayden-thompson' },
    ],
  },
});

export const campsSurface = defineEditableSurface({
  id: 'camps',
  label: 'Camps',
  route: '/camps',
  kind: 'website',
  description: 'Camp story, gallery and house-league content.',
  sections: [
    { id: 'hero', label: 'Hero', description: 'Camps title and introduction.', contentPath: 'hero' },
    { id: 'spotlight', label: 'Camp spotlight', description: 'Headline, application button and image gallery.', contentPath: 'spotlight' },
    { id: 'house-league', label: 'House League', description: 'House-league heading and explanation.', contentPath: 'houseLeague' },
  ],
  defaults: {
    hero: { title: site.camps.eyebrow, description: site.camps.sub },
    spotlight: { heading: site.camps.heading.join(''), ctaLabel: site.camps.cta, ctaUrl: site.links.apply, slides: site.camps.slides.map((slide) => ({ imageUrl: slide.img, caption: slide.caption, objectPosition: 'center top' })) },
    houseLeague: { heading: 'House League', body: 'CPR uses house league and development environments to help student-athletes build fundamentals, confidence, and game experience before moving into higher exposure opportunities.' },
  },
});

export const merchandiseSurface = defineEditableSurface({
  id: 'merchandise',
  label: 'Merchandise',
  route: '/merchandise',
  kind: 'website',
  description: 'Merchandise page text and image.',
  sections: [
    { id: 'hero', label: 'Hero', description: 'Page title and introduction.', contentPath: 'hero' },
    { id: 'products', label: 'Products', description: 'Availability message, product list and photo.', contentPath: 'products' },
  ],
  defaults: {
    hero: { title: site.merchandise.heading, description: site.merchandise.sub },
    products: { body: site.merchandise.note, productLine: 'CPR Hoodies · CPR T-Shirts · More coming soon.', imageUrl: site.merchandise.image, imageAlt: 'CPR merchandise' },
  },
});

export const tributeSurface = defineEditableSurface({
  id: 'tribute',
  label: 'Coach Rav Tribute',
  route: '/tribute',
  kind: 'website',
  description: 'Tribute hero, message and rotating photo gallery.',
  sections: [
    { id: 'hero', label: 'Hero', description: 'Tribute name and context.', contentPath: 'hero' },
    { id: 'message', label: 'Tribute message', description: 'Message, signature and gallery.', contentPath: 'message' },
  ],
  defaults: {
    hero: { eyebrow: site.tribute.eyebrow, title: site.tribute.name, description: site.tribute.meta },
    message: { paragraphs: [...site.tribute.message], signature: site.tribute.sign, slides: site.tribute.slides.map((slide) => ({ imageUrl: slide.img, caption: '', objectPosition: 'center top' })) },
  },
});

export const experienceLabSurface = defineEditableSurface({
  id: 'experience-lab',
  label: 'The Experience',
  route: EXPERIENCE_LAB_PATH,
  kind: 'website',
  description: 'Every story chapter, profile, package, image and call to action in The Experience.',
  sections: [
    { id: 'hero', label: 'Hero', description: 'Opening image, statement and button.', contentPath: 'hero' },
    { id: 'athletes', label: 'Athletes', description: 'Illustrative athlete profiles.', contentPath: 'athletes' },
    { id: 'dream', label: 'The Dream', description: 'Opening story chapter.', contentPath: 'dream' },
    { id: 'question', label: 'The Question', description: 'Family questions and imagery.', contentPath: 'question' },
    { id: 'guide', label: 'The Guide', description: 'CPR guidance story.', contentPath: 'guide' },
    { id: 'beliefs', label: 'What CPR Believes', description: 'Belief cards and global statement.', contentPath: 'beliefs' },
    { id: 'journey', label: 'The Journey', description: 'Recruiting milestones.', contentPath: 'journey' },
    { id: 'ncaa-packages', label: 'NCAA packages', description: 'NCAA and international packages.', contentPath: 'ncaaPackages' },
    { id: 'quiet-work', label: 'Behind the scenes', description: 'Work CPR performs for families.', contentPath: 'quietWork' },
    { id: 'camps', label: 'Camps & exposure', description: 'Exposure story and gallery.', contentPath: 'camps' },
    { id: 'profiles', label: 'Player profiles', description: 'Profile story and examples.', contentPath: 'profiles' },
    { id: 'results', label: 'Results', description: 'Results, outcomes and proof imagery.', contentPath: 'results' },
    { id: 'testimonials', label: 'Testimonials', description: 'Family and athlete testimonials.', contentPath: 'testimonials' },
    { id: 'explore', label: 'Explore CPR', description: 'Next-step cards.', contentPath: 'explore' },
    { id: 'closing', label: 'Closing', description: 'Final call to action and links.', contentPath: 'closing' },
  ],
  defaults: JSON.parse(JSON.stringify(experienceLabDefaults)) as Record<string, unknown>,
});

export const EDITABLE_SURFACES = [recruitmentSurface, resourcesSurface, campsSurface, merchandiseSurface, tributeSurface, experienceLabSurface] as const;

export function getEditableSurfaceManifest(id: string): EditableSurfaceManifest | undefined {
  return EDITABLE_SURFACES.find((surface) => surface.id === id) as EditableSurfaceManifest | undefined;
}

/**
 * Future EA sites and portals opt in by registering a manifest created with
 * `defineEditableSurface`. Business workflows should be represented as
 * protected sections, not editable content.
 */
export { defineEditableSurface } from './types';
