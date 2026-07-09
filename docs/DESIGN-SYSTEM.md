# DuaCrypto News Design System — "Terminal & Sats"

Approved direction (mockup: see owner's artifact "duacrypto-news-redesign"). Implements the
POST-REDESIGN-PLAN R1–R6 direction with a concrete identity. Every rule below overrides defaults.

## Idea
Crypto-native reading terminal: Reddit density, monospace metadata like a market ticker,
one ink-blue ground, and a strict color law — **cyan = identity, orange = money**.

## Tokens (replace in `src/styles/global.css`)

```css
:root { /* light */
  --bg:#F7F9FC; --surface:#FFFFFF; --ink:#17202E; --ink-2:#5A6B80;
  --hairline:#DCE3EC; --cyan:#0891B2; --cyan-bright:#22D3EE;
  --btc:#F7931A; --btc-ink:#1A1005; --warn-bg:#FFF7E8; --warn-edge:#D97706;
}
.dark / prefers-color-scheme dark {
  --bg:#0D1220; --surface:#131A2A; --ink:#E8EDF5; --ink-2:#8FA0B8;
  --hairline:#232D42; --cyan:#4DD9F0; --warn-bg:#241A08; --warn-edge:#FBBF24;
}
```
All pass WCAG 4.5:1 on their grounds (fixes step 0d). Map old names: `--color-page→--bg`,
`--color-dark→--ink`, `--color-secondary→--ink-2`, `--color-border→--hairline`,
`--color-primary→--cyan` (links) / `--cyan-bright` (accents only, never text on light).

## The color law (non-negotiable)
- **Orange `--btc` is ONLY for money actions**: affiliate CTA block, zap button/sat counts. Nothing else, ever.
- **Cyan** = brand, links, category labels, quick-answer edge, active states.
- **Amber warn tokens** = scam/risk callouts only.
- Buttons: orange bg + `--btc-ink` dark text (affiliate); cyan OUTLINE button (newsletter/secondary). No white-on-cyan anywhere.

## Typography
- Body: existing sans stack, 1.02rem/1.7, ~68ch column (max-w 680px).
- Headlines: same family, weight 800, letter-spacing -0.03em, `text-wrap:balance`. H1 2.1rem (1.65 mobile), H2 1.28rem with hairline `border-top` + generous padding-top.
- **Mono is the signature**: `ui-monospace, "Cascadia Mono", Menlo, Consolas` for ALL metadata — eyebrow, dates, reading time, view/sat counts, table headers, tags, section labels ("VAZHDO LEXIMIN"). Uppercase, 0.72rem, letter-spacing .08em. Separator between meta items: `///` in hairline color.

## Components (match mockup)
1. **Eyebrow meta line** (replaces breadcrumbs+pills+stats+date rows): `UDHËZUES /// 28 QER 2026 /// 5 MIN /// 👁 1.2K` — category in cyan, links to category page.
2. **Byline rail**: one row, avatar 26px + "**Dua** · Themelues, DuaCrypto" left; engagement pills right (🧡 count, ⚡ sats in orange-tinted outline, ↗ Ndaj). Hairlines above/below. Disclosure = one italic 0.78rem line under it.
3. **Quick answer**: flat, 3px `--cyan-bright` left border, mono label "⚡ PËRGJIGJE E SHPEJTË". No background box.
4. **Step cards**: grid `3.2rem 1fr`; number as outlined mono numeral (`-webkit-text-stroke: 1.5px var(--cyan)`, transparent fill, 2.4rem). H3 title + body.
5. **Warn callout** (only filled box allowed besides CTA): `--warn-bg` bg, 3px `--warn-edge` left border, mono "⚠ KUJDES" label.
6. **Money CTA block**: centered, `color-mix(--btc 9%, surface)` bg, orange 35% border, mono "₿ LIDHJE BASHKËPUNIMI" label, big orange button, small reassurance line. Exactly one per affiliate post + this replaces in-text affiliate links as primary CTA (text links stay as secondary).
7. **Newsletter**: ONE compact hairline row (text left, cyan outline button right). Delete all other newsletter blocks (fixes 0f).
8. **Tags**: mono, `#` prefix in cyan, no pill backgrounds.
9. **Related feed rows** (also homepage/category lists): hairline-separated rows — title (2-line clamp, 600 weight) + mono meta line (`UDHËZUES /// 3 KOR /// 👁 890 /// ⚡ 2 100` — sats in orange) + 64×48 thumb right. NO big image cards.
10. **Progress bar**: 3px sticky top, gradient `--cyan-bright → --btc`. The only gradient on the site.
11. **Tables**: hairline rows, mono uppercase headers, no zebra.

## Page furniture rules
- Hairlines (`border-top: 1px var(--hairline)`) separate sections; bordered/filled boxes limited to warn callout + money CTA.
- Trust bar: homepage only. Author full bio: end of post only (header keeps the one-line byline). Remove visible "Markdown" link. Embed = `</>` icon in share rail opening a popover.
- Hero image: only when it's a real informative image (screenshot/chart) — capped 380px, rounded 10px. Logo/missing → no hero, text-first.
- Prose link styling must not touch `.btn-*` or `.rail` elements (fixes 0e).

## Category/listing page fixes (confirmed live bugs, 2026-07-09 screenshot)
- **Never use generated OG images (`/og/*.png`) as in-site thumbnails** — they bake in title/category/domain, causing duplicated + truncated text inside cards. OG images are for external link previews ONLY. In-site thumbs: post hero if real, else no thumb (text-only row).
- Category pages: eyebrow label + H1 currently repeat the same word ("GUIDES"/"Guides") — keep only the H1.
- **Localize category headings**: SQ tree must show "Udhëzues", not "Guides" — route heading through the i18n dictionary like nav already does.
- Replace the card grid with feed rows (component #9) on ALL listings: category, tags, search, homepage sections.
- Trust bar: homepage only — remove from category/tag/post pages.

## Implementation notes for Cursor
- Apply tokens first (one commit) — the rename alone restyles the whole site safely.
- Then components in mockup order on PostLayout + /en + embed; then feed rows on home/category/tags.
- Keep all SEO/JSON-LD/analytics wiring untouched; this is presentation-only.
- Playwright visual baselines re-recorded after; axe contrast checks must pass both themes.
