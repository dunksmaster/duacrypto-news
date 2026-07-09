# Post Page Redesign Plan — make posts people actually read

Cursor-ready. Target file: `src/layouts/PostLayout.astro` (+ `src/css`, components, AI prompt).
Reference standards: Medium/Substack (typography & rhythm), CoinDesk/Bankless (crypto news layout), Ghost themes (structure). Work in order, one commit per step, `npm run build` green after each.

## Diagnosis (why it feels boring and pushes you to scroll away)

1. **Six boxes before the article starts.** Current order: breadcrumbs → category pill → H1 → description → direct-answer box → affiliate disclosure → request-translation box → stats row → meta row → **giant 1200×675 image** → finally text. The reader gets ~2 screens of "furniture" before word one.
2. **The hero image is unbounded**: `w-full` at 16:9 inside the column = ~675px tall on desktop, a full viewport on mobile. It's also generic (not informative), so it costs a full screen and adds nothing.
3. **Wall-of-text body**: uniform paragraphs, no visual anchors — no callouts, no in-body images, no step cards, no tables, no bolded scan-path. Nothing rewards scrolling, so the eye slides to the end.
4. **Affiliate CTA is a text link** — the post's whole job, rendered as an underlined word.
5. No table of contents, no progress indicator, no author face, no pull quotes — none of the retention furniture good blogs use.

## What's already good (keep, don't touch)
Direct-answer concept (just restyle), FAQ accordions, related posts, breadcrumbs, reading time, md mirror link, max-w-3xl column, SEO/JSON-LD stack, fast static load.

---

## Redesign steps

### 0. URGENT quick fixes (confirmed live bugs — do before everything else, sitewide)
a. **Logo used as hero image**: posts with `image: /img/duacrypto-logo.png` (e.g. the Bitget post) render a giant stretched square logo. Fix: in PostLayout, treat the logo (or missing image) as "no hero" — render text-first. Audit all post frontmatter; replace logo heroes with the generated OG image (`/og/<slug>.png`) or none. Also apply cap `max-h-[380px] object-cover` (step 1).
b. **Remove the visible "Markdown" link** from the post meta row — the `<link rel="alternate" type="text/markdown">` in the head serves AI agents; the visible link confuses readers. Remove on all layouts (post, en, embed).
c. **EmbedCopy box looks like leaked code**: replace the full-width `<details>` + textarea block with a small `</>` "Embed" button appended to the ShareRow that opens a compact popover/modal with the code + copy button. Same for /en.
d. **Color contrast failures (WCAG)** in `src/styles/global.css` — fix the tokens once, applies sitewide:
   - `.btn-primary`: white-on-cyan ≈1.9:1 → change to dark text (`#062a33`) on cyan, or darken button bg to `#0891b2` and keep white. Verify ≥4.5:1.
   - Link color in light mode: `#16d5ff` on white ≈1.6:1 → introduce `--color-link: #0e7490` (light) / `#4dd8ff` (dark); use for all text links; keep bright cyan only for large UI accents.
   - `--color-secondary` dark mode `#8b949e` → `#a3aeb8` (≥4.5:1 on `#0d1117`); light mode `#999999` on white is 2.8:1 → `#5f6b76`.
   - Reduce `text-secondary` usage in post page: FAQ answers and newsletter body should be `--color-dark` (primary text); secondary is ONLY for meta (dates, counts, captions).
   - Add an automated check: `axe-core` contrast assertions in the Playwright suite (NEXT-PHASE-PLAN T3) so this never regresses.

### 1. Fix the hero + header order (the complaint)
New order, tight: breadcrumbs (smaller, one line) → category pill + date + reading time on ONE row → H1 → one-line dek (description) → author chip (small avatar + name + updated date) → hero image **capped**: `max-h-[380px] w-full object-cover` desktop, `max-h-[240px]` mobile, rounded-xl. Everything above the image fits in one glance; article text starts within the first viewport.
- Posts with generic stock heroes: set `heroStyle: banner` (default, capped) vs `heroStyle: none` in frontmatter — a text-first opening like Substack is better than a meaningless image.

### 2. Declutter the pre-content zone
- **Direct answer** → restyle as a compact "⚡ Përgjigje e shpejtë" callout placed AFTER the hero, styled as the first content element (accent left border, no heavy box).
- **Affiliate disclosure** → one italic line under the meta row ("Ky artikull përmban lidhje bashkëpunimi — si funksionon") linking to a page with the full text. Compliant and 90% smaller.
- **Request-translation box** → move to post footer (after tags).
- **Views/likes** → merge into the single meta row (👁 and 🧡 inline, no bordered pills).

### 3. Typography that reads like Medium
In `post-prose` (move from utility-class soup to a proper CSS block):
- Body 1.155rem/1.75 (Substack-ish), max width stays 3xl (~68ch). Paragraph spacing 1.25em.
- H2: 1.5rem bold with generous top margin (2.5em) + subtle anchor link on hover; H3 styled.
- Styled `blockquote` (accent bar + larger italic — usable as pull quotes), `table` (bordered, striped, `overflow-x-auto` wrapper), `code`, `hr` as section divider (centered dots), `strong` slightly darker for scan path.
- First paragraph slightly larger (lede).

### 4. Content components (the anti-boring kit)
Markdown-renderable via remark-directive (`:::tip` syntax) or simple styled elements the AI can emit:
- **Callouts**: `:::tip`, `:::warning` (scam alerts — on-brand!), `:::info` — colored left-border boxes with emoji.
- **Key takeaways** ("Çka mëson këtu") — 3-bullet box right after the quick answer for guides.
- **Numbered step cards** for how-to sections (big number, title, body) — replaces flat H2 lists in posts like the CEX.io card-buying guide.
- **Pros/cons two-column card** for affiliate reviews.
- **CTA button component**: `<a class="btn-affiliate">Hap llogari në CEX.io →</a>` — big, centered, primary color, used 2× per affiliate post (after step 1 and at end). This is the single highest-ROI change for affiliate revenue.

### 5. Retention furniture
- **Reading progress bar** (2px, top, primary color, ~10 lines of JS).
- **Table of contents**: auto from H2s; desktop = left of content on xl screens (sticky), mobile = collapsed `<details>` under the hero. Only when ≥4 H2s.
- **Author box** at post end (avatar, 2-line bio, Telegram/X links) — E-E-A-T + human feel.
- **Next/prev post links** at bottom (chronological within category) in addition to related grid.

### 6. In-body visuals become mandatory
- Layout: style in-body images (rounded, caption via `em` after image or `<figure>`).
- **AI prompt update** (`scripts/generate-post.mjs`): require per post — hook intro ≤3 sentences; H2 every 150–250 words; paragraphs max 3 sentences; ≥1 list or table per major section; 1–2 callouts; bold the key phrase per section; for affiliate posts: steps as step-cards, pros/cons block, 2 CTA buttons; suggest 2–3 in-body image slots with alt text (`![alt](img/posts/slug-1.webp)`) so drafts arrive with visual rhythm built in.
- Add `docs/CONTENT-STYLE.md` documenting these rules for human posts too.

### 7. Post cards + listing polish (same disease, same cure)
PostCard: image top (fixed 16:9, object-cover), category pill overlaid, title 2-line clamp, description 2-line clamp, meta row (date · min · 👁). Homepage: first post = large featured card, rest in grid.

### 8. QA pass
Mobile (375px) + dark mode + Lighthouse: hero no longer dominates first viewport; CLS still 0 (keep width/height attrs); tap targets ≥44px; verify one migrated post (the CEX.io one) side-by-side before/after screenshots in the PR.

## Additional issues beyond the layout (add to scope)

9. **"👁 0" is live on production** — the layout renders the views/likes widgets hardcoded to 0 with no backend built. Zero views is *negative* social proof (looks dead). Hide the widgets entirely (`hidden` until the API responds with a count > threshold, e.g. show only when ≥ 25 views).
10. **All 17 posts dated 2026-07-09** — a blog where everything was published the same day looks auto-generated/spammy to both readers and Google. Stagger `pubDate` across the past weeks realistically; going forward publish on the real cadence.
11. **Generic/repeated hero images** — guides about CEX.io/Bitget signup should show REAL annotated screenshots of the actual signup flow (that's what converts and what competitors don't have). Create a branded OG/hero template for news posts; screenshots for how-to posts.
12. **Author "AI Desk" persona is weak E-E-A-T** — posts should carry a real person (Dua) with photo, 2-line bio, Telegram/X links; keep the "AI-assisted" tag for transparency. Google and readers both trust faces.
13. **Native-speaker pass on Albanian AI drafts** — one awkward machine-Albanian sentence destroys trust with exactly the community the site targets. Add a "language reviewed" checkbox to the PR template; spot-check every affiliate post manually.
14. **No internal links between the live posts** — the 5 affiliate posts + pillars should cross-link (Tangem post → self-custody pillar → "a është bitcoin i ligjshëm"). Do a one-time linking pass; the AI prompt already requires it for future posts.
15. **Newsletter capture is only a box at the end of affiliate posts** — add a compact inline signup mid-article on ALL posts + one in the footer sitewide.
16. **Homepage rhythm** — same wall-of-cards issue as posts: add a featured-post hero, category rows, and a "Më të lexuarat" rail (once view counts exist).
17. **Trust bar** — the main site shows Telegram member count; news site should reuse it (social proof header/footer strip: "X,XXX anëtarë në Telegram · Që prej 2023").

## Acceptance
- [ ] Article text visible within first viewport on desktop AND mobile
- [ ] CEX.io post: steps rendered as cards, pros/cons block, 2 CTA buttons, ≥2 callouts
- [ ] Progress bar + TOC working; no CSP violations; build + smoke tests green
- [ ] Lighthouse perf ≥ 95 mobile; CLS = 0
- [ ] AI generator produces a draft using the new components without manual edits
