# CPR site and portal update completion report

Date: July 31, 2026

## Scope protection

- Canonical project: `TheArchitect1111/cpr-site`
- Canonical production domain: `https://canadianprospectrecruitment.vercel.app`
- Quarantined `contain` image treatment remains excluded.
- Existing visual theme, section order, typography, colors, and portal shell were not redesigned.

## Completed

- Renamed Standard Application to North America Fee Agreement.
- Added International Experience using the existing standalone guide URL.
- Preserved Chips & Drip on the homepage and in the homepage editor.
- Preserved the approved Google application form for Apply Now buttons.
- Preserved NCAA packages and the shareable Experience route.
- Preserved white testimonial copy.
- Added a concise About CPR rewrite without changing the section layout.
- Added testimonial introduction editing.
- Added Coach Rav/George Raveling tribute copy and photo editing.
- Added focal-position controls to existing homepage image galleries instead of restoring the quarantined `contain` CSS.
- Added owner controls to hide website menu links and portal menu items. Portal Home cannot be hidden.

## Deliberately not expanded

The homepage editor was not converted into an all-pages CMS. Recruitment, Camps, Resources, Experience,
and authenticated portal pages have different data and permission requirements. Replacing them in this
focused change would violate the instruction not to change anything else about the site. Their current
content and appearance remain unchanged.

## Verification

- Focused contract: `npm run test:cpr-feedback`
- Production build: `npm run build`
- Live verification required after the production deployment completes.
