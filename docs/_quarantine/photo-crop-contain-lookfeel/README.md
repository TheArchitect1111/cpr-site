# QUARANTINED — Photo-crop / `contain` homepage look-and-feel (Jul 27, 2026)

## Status

**QUARANTINED.** Do not reapply.

## What it was

Commit `93e54fd` ("Fix CPR photo cropping…") and related landing CSS changed CPR homepage imagery from full-bleed `cover` treatment to `object-fit: contain` / `background-size: contain`, removed hero masks/shadows, and zeroed hero min-heights. That **changed the look and feel of the live site**.

Also quarantined as a pattern: expanding About CPR into a long intro + six bullets that reflows the credentials band without an explicit redesign ask.

## Why quarantined

Owner rule (repeated): **do not change how the CPR site looks or feels.** Functional requests (Apply URL, readable testimonial text, Experience link, NCAA content on Experience Lab) must not rewrite visual CSS or section composition.

## Restored baseline

Visual CSS restored from `a6a67d8` (pre-lookfeel-break production tip before the contain experiment).

Kept (non-layout):

- Apply Now → standard Google Form
- Testimonial quote color white (readability)
- Experience Lab NCAA packages section (Experience Lab page only)
- External-link props on Apply buttons

## Do not revive

- `object-fit: contain` on homepage hero/proof/player images
- Removing hero mask / inset red shadow
- Collapsing `.lc-hero-img` min-height to `0`
- Layout “mobile polish” that reorders or shrinks the hero plane

If Mike needs photo cropping fixed later: crop/export assets or use admin gallery tools — **do not** restyle the chassis to `contain`.
