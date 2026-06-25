# EA Experience Book — /possibilities

## Overview

The Experience Book is a standalone, shareable premium marketing page at `/possibilities`
that answers: "What does Efficiency Architects actually do?"

It is built as a self-contained Next.js page with no external animation libraries —
only CSS keyframes, Intersection Observer for scroll reveals, and React state.

---

## Files

```
app/possibilities/
├── page.tsx              # Route entry point (server component, sets metadata)
├── PossibilitiesPage.tsx # All interactive logic ('use client')
└── possibilities.css     # All page-specific styles (imported in page.tsx)
```

---

## Adding a New Industry (Screen 6)

All industries are defined in a single array at the top of `PossibilitiesPage.tsx`:

```tsx
const INDUSTRIES = [
  {
    name: 'Restaurant',
    sentence: 'From reservations to reviews, your dining experience runs itself.',
    indicator: 'Table Booked',
    bg: 'radial-gradient(...) linear-gradient(...)',  // CSS gradient for background
  },
  // ... add new entry here
];
```

**Steps to add a new industry:**

1. Open `app/possibilities/PossibilitiesPage.tsx`
2. Find the `INDUSTRIES` array (around line 80)
3. Add a new object with:
   - `name` — Industry display name (e.g., `'Fitness'`)
   - `sentence` — One sentence describing the value (keep under 12 words)
   - `indicator` — The subtle system status shown (e.g., `'Member Checked In'`)
   - `bg` — A CSS gradient string for the cinematic background atmosphere

**Gradient recipe:**
```
radial-gradient(ellipse at X% Y%, rgba(R,G,B,0.4) 0%, transparent 55%),
linear-gradient(160deg, #darkest 0%, #medium 50%, #dark 100%)
```

Pick colors that suggest the industry's atmosphere:
- Fitness: electric blue tones
- Automotive: steel grey / orange
- Finance: deep navy / gold

No images, no external URLs needed. The gradient IS the photography.

---

## Adding a New Capability Category (Screen 8)

All capabilities are in the `CAPABILITIES` array in `PossibilitiesPage.tsx`:

```tsx
const CAPABILITIES = [
  {
    category: 'Grow',
    icon: '↑',
    color: '#16a34a',   // Icon and accent color
    bg: '#f0fdf4',      // Light background for icon chip
    items: ['Lead Capture Systems', 'Automated Follow-Up', ...],
  },
  // ... add new category here
];
```

---

## Design System Tokens Used

The page inherits from the existing EA design system:

| Token | Value | Usage |
|-------|-------|-------|
| `--lc-primary` | `#B21712` | Red accents, CTA buttons |
| `--lc-black` | `#0C0C0A` | Dark section backgrounds |
| `--lc-off` | `#F7F7F7` | Light section backgrounds |
| Font headline | `Barlow Condensed 800` | All large display text |
| Font body | `Inter` | All body and UI text |

Fonts are loaded globally in `app/layout.tsx` — no changes needed.

---

## Animation System

All animations use pure CSS + Intersection Observer (no Framer Motion, no GSAP):

- **Scroll reveals**: `useInView()` hook applies `.poss-anim` → `.poss-visible` classes
- **Hero entrance**: CSS transition triggered by `heroVisible` state (setTimeout 120ms)
- **Industry carousel**: Auto-advances every 5 seconds, keyboard navigable (←/→ arrows)
- **Flow line**: `@keyframes flowLine` creates the pulsing connector animation
- **Indicator dot**: `@keyframes dotPulse` creates the live-status breathing effect

---

## Extending the Page (Adding New Screens)

The page is a flat vertical scroll — add new `<section>` elements in `PossibilitiesPage.tsx`
between the existing screens. Wrap content in `<AnimatedSection>` for automatic scroll reveals:

```tsx
<AnimatedSection delay={100}>
  <div>Your new content here</div>
</AnimatedSection>
```

Use these CSS classes from `possibilities.css`:
- `.poss-section` — Standard padding (120px vertical)
- `.poss-container` — Max-width 1100px centered
- `.poss-container-sm` — Max-width 760px centered
- `.poss-eyebrow` — Small red label above headline

---

## Performance Notes

- Page builds as **static** (`○`) — prerendered at build time, no server needed
- No external images — all backgrounds are CSS gradients
- No animation libraries — pure CSS transitions and keyframes
- Fonts loaded from Google Fonts CDN (already in root layout)
- First Load JS: ~187 kB (within acceptable range)
