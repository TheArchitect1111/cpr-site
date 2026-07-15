/** Section map for homepage editor — matches `id` anchors on the public landing page. */

export type LandingEditorSection = {
  id: string;
  label: string;
  hash: string;
  description: string;
};

export const LANDING_EDITOR_SECTIONS: LandingEditorSection[] = [
  {
    id: 'top',
    label: 'Hero',
    hash: '#top',
    description: 'Top banner, headline, hero photo, and apply buttons.',
  },
  {
    id: 'about',
    label: 'About CPR',
    hash: '#about',
    description: 'Credentials band with heading and bullet points.',
  },
  {
    id: 'testimonials',
    label: 'Testimonials',
    hash: '#testimonials',
    description: 'Up to three family quotes with photos.',
  },
  {
    id: 'philosophy',
    label: 'Coaching philosophy',
    hash: '#philosophy',
    description: 'Coach Pop quote band.',
  },
  {
    id: 'path',
    label: 'Path statement',
    hash: '#path',
    description: 'Short band between philosophy and process.',
  },
  {
    id: 'how-it-works',
    label: 'How it works',
    hash: '#how-it-works',
    description: 'Five-step journey headings and descriptions.',
  },
  {
    id: 'chips-and-drip',
    label: 'Chips & Drip',
    hash: '#chips-and-drip',
    description: 'Training story and rotating gallery slides — add, reorder, or replace photos.',
  },
  {
    id: 'camps',
    label: 'Camps & exposure',
    hash: '#camps',
    description: 'Camps copy, dashboard image, and rotating camp gallery slides you can manage.',
  },
  {
    id: 'results',
    label: 'Results',
    hash: '#results',
    description: 'Stats, athlete proof cards, and photos.',
  },
  {
    id: 'apply',
    label: 'Apply CTA',
    hash: '#apply',
    description: 'Bottom “ready to apply” band.',
  },
  {
    id: 'contact',
    label: 'Footer',
    hash: '#contact',
    description: 'About line, email, and location.',
  },
];
