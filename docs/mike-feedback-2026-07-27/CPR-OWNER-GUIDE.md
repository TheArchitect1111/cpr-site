# CPR Owner Guide — Mike feedback (Jul 27, 2026)

## Share links

| What | URL |
|------|-----|
| **The Experience** (presentation) | https://canadianprospectrecruitment.vercel.app/cpr-experience-lab |
| **Apply Now** (standard / North America) | Google Form linked from every Apply Now button |
| **International fee agreement** | Footer + Resources → International Fee Agreement |
| **On-platform application** (optional) | https://canadianprospectrecruitment.vercel.app/apply |

## Apply Now buttons

All homepage **Apply Now** buttons now open the **standard CPR Google Form** (not the international fee agreement).

## Testimonials

Quote text on the homepage is **white** on dark cards (was gray and hard to read).

## About CPR

The About section has a fuller intro paragraph plus six credential bullets. Edit in **Admin → Homepage editor → About**.

## Player profile photos

1. Go to **Admin → Players**
2. Open a player (detail panel)
3. Use **Upload photo** or paste a **Photo URL**
4. Click **Save** to publish

Photos also appear on public profiles at `/athletes/{slug}`.

## Homepage editor (same rich editor)

**Admin → Homepage editor** covers: hero, About, testimonials, philosophy, process, galleries, results, footer.

Secondary pages (Recruitment, Camps, Resources) still use code/config — ask EA to extend the editor if you want those editable too.

## Copy and paste

Public site text is selectable. Long-press or drag to copy on mobile/desktop.

## NCAA packages on The Experience

The Experience presentation now includes an **NCAA Pathways** packages section (eligibility, profile/film, exposure, international, full journey). Share:

https://canadianprospectrecruitment.vercel.app/cpr-experience-lab#ncaa-packages

## Deploy

Changes ship when the `cpr-site` branch is merged to `main` and Vercel production deploy completes.
