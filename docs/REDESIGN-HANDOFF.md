# Redesign Handoff — Homepage & Header Polish (Terminal & Sats)

**For:** Cursor, working in this repo.
**Scope:** Presentation only. Do NOT touch SEO/JSON-LD, analytics, content collections, functions, or build scripts.
**Reference mockup:** `DuaCrypto Redesign.dc.html` (visual target). Screenshots in `screenshots/`.
**Design law (see `docs/DESIGN-SYSTEM.md`):** cyan = identity/links, orange (`--btc`) = money ONLY, mono for all metadata. Everything below obeys it.

The token system, `feed-row` PostCard, `meta-mono`, honest TrustBar, and hidden-empty-categories are already live. This handoff adds three upgrades on top of that:

- **T1** — Header: glass backdrop + monospace nav (ticker feel).
- **T2** — Featured hero: large headline + engagement meta line + one orange affiliate CTA.
- **T3** — Homepage: two-column layout with a sticky sidebar (category index + Lightning donate CTA).

Do them in order. One PR, preview URL, before/after homepage screenshots. Both locales (`sq` + `en`).

---

## Prep — i18n keys

Add these keys to `src/i18n/ui.ts` for both locales (wire through the existing dictionary; don't hardcode strings in components).

| key | sq | en |
|---|---|---|
| `heroKicker` | `NË FOKUS` | `IN FOCUS` |
| `readGuideCta` | `LEXO UDHËZUESIN →` | `READ THE GUIDE →` |
| `sidebarBrowse` | `SHFLETO SIPAS KATEGORISË` | `BROWSE BY CATEGORY` |
| `donateLabel` | `₿ NDIHMO KOMUNITETIN` | `₿ SUPPORT THE COMMUNITY` |
| `donateBody` | `Mbështet edukimin falas në shqip me sats mbi Lightning.` | `Support free education with sats over Lightning.` |
| `donateCta` | `⚡ DËRGO SATS` | `⚡ SEND SATS` |

`readingTime` + `formatTickerDate` already exist in `src/lib/posts.ts`. View/sat counts are optional — only render them if a real value is available (see T2 note).

---

## T1 — Header: glass + monospace nav

**File:** `src/components/Header.astro`

1. Header element — swap the opaque surface for a blurred translucent bar:

```diff
- <header class="sticky top-0 z-50 border-b border-border bg-surface shadow-sm">
+ <header class="site-header sticky top-0 z-50 border-b border-border">
```

2. Add this `<style>` block to the component (Astro scopes it):

```css
.site-header {
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
/* Monospace ticker nav */
.site-header .nav-link {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 600;
}
```

3. Wordmark: replace the `<span … >News</span>` beside the logo with the two-line terminal tag (keep it `sm:inline` / hidden on mobile):

```html
<span class="hidden sm:inline" style="font-family:var(--font-mono);font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;color:var(--color-text-muted);border-left:1px solid var(--color-border);padding-left:10px;line-height:1.3">News<br>Terminal</span>
```

**Acceptance:** header blurs content scrolling under it; nav labels are uppercase mono; active link still uses `nav-link-active` (cyan). No layout shift, no change to the mobile toggle script.

---

## T2 — Featured hero: headline + meta + orange CTA

**File:** `src/components/PostCard.astro` (the `featured` branch only — leave `feed-row` untouched).

Add, after the `<p class="feed-featured__dek">`, an actions row with the engagement meta and ONE orange affiliate-style CTA:

```astro
<div class="feed-featured__actions">
  <a href={href} class="feed-featured__cta">{strings.readGuideCta}</a>
  <p class="meta-mono feed-featured__stats">
    <time datetime={post.data.pubDate.toISOString()}>{tickerDate}</time>
    <span class="feed-meta-sep" aria-hidden="true">///</span>
    <span>{minutes} MIN</span>
    <span class="post-card-views" data-card-views={slug} hidden />
  </p>
</div>
```

`strings` is already available if you pass `locale`; import `t` and compute `const strings = t(locale);` in the frontmatter (mirror the pattern in `index.astro`).

Styles (append to the component `<style>`):

```css
.feed-featured__title { font-size: clamp(1.9rem, 4.5vw, 2.6rem); } /* bump from 2rem */
.feed-featured__actions {
  display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; margin-top: 0.25rem;
}
.feed-featured__cta {
  font-family: var(--font-mono); font-size: 0.78rem; letter-spacing: 0.06em;
  text-transform: uppercase; font-weight: 700;
  color: var(--btc-ink); background: var(--btc);
  padding: 12px 22px; border-radius: 9px; text-decoration: none;
  box-shadow: 0 1px 0 color-mix(in srgb, var(--btc-dark) 40%, transparent);
}
.feed-featured__cta:hover { background: var(--btc-dark); }
.feed-featured__stats { margin: 0; color: var(--color-text-muted); }
```

**Notes**
- The orange CTA is the ONE money action allowed on the homepage (design law). Do not add a second orange element.
- The existing `PopularPosts` script fills `[data-card-views]`; keep that wiring so real view counts appear when present. Do NOT invent sat/view numbers — the mockup's numbers are placeholders. Only show `⚡ sats` in the meta if a real value exists.

**Acceptance:** featured story reads as a hero (large balanced headline, dek, one orange CTA, mono meta). No baked-in OG image as a thumbnail (already handled by `resolveHeroSrc` — leave it).

---

## T3 — Homepage: two-column with sticky sidebar

**Files:** `src/pages/index.astro` AND `src/pages/en/index.astro` (keep them in sync).

Replace the standalone "browse by category" grid + the `CategoryRows` block with a two-column body: main feed left, sticky sidebar right. Keep the hero section and featured section full-width above it.

Structure (inside the existing shell, after the featured section):

```astro
<section class="pb-16">
  <div class="section-shell home-grid">
    <div class="home-main">
      <h2 class="feed-section-label">{strings.latestPosts}</h2>
      <div class="feed-list">
        {latest.map((post) => <PostCard post={post} locale={locale} />)}
      </div>
    </div>

    <aside class="home-side">
      {categoriesWithPosts.length > 0 && (
        <div>
          <p class="meta-mono side-label">{strings.sidebarBrowse}</p>
          <div class="side-cats">
            {categoriesWithPosts.map(({ category, label, count }) => (
              <a href={localePath(`/category/${category}/`, locale)} class="side-cat">
                <span>{label}</span>
                <span class="meta-mono side-cat__count">{String(count).padStart(2, "0")}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div class="side-donate">
        <p class="meta-mono side-donate__label">{strings.donateLabel}</p>
        <p class="side-donate__body">{strings.donateBody}</p>
        <a href={site.telegramUrl} class="side-donate__cta">{strings.donateCta}</a>
      </div>
    </aside>
  </div>
</section>
```

Add to `src/styles/global.css` (near the other homepage rules):

```css
.home-grid { display: grid; grid-template-columns: 1fr; gap: 2.5rem; }
@media (min-width: 1024px) { .home-grid { grid-template-columns: 1fr 260px; gap: 3rem; } }
.feed-section-label,
.side-label {
  font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.08em;
  text-transform: uppercase; font-weight: 600; color: var(--color-text-muted); margin: 0 0 0.75rem;
}
.feed-section-label {
  color: var(--color-text); padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--ink); display: inline-block;
}
.home-side { display: flex; flex-direction: column; gap: 2rem; }
@media (min-width: 1024px) { .home-side { position: sticky; top: 5.5rem; align-self: start; } }
.side-cats { display: flex; flex-direction: column; }
.side-cat {
  display: flex; justify-content: space-between; align-items: baseline;
  padding: 0.7rem 0; border-bottom: 1px solid var(--hairline);
  text-decoration: none; color: var(--color-text); font-weight: 600;
}
.side-cat:hover { color: var(--cyan); }
.side-cat__count { color: var(--color-text-muted); }
/* Lightning donate — the only sidebar money element (orange) */
.side-donate {
  padding: 18px; border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--btc) 35%, transparent);
  background: color-mix(in srgb, var(--btc) 9%, var(--surface));
}
.side-donate__label { color: var(--btc-dark); font-weight: 700; margin: 0 0 0.6rem; }
.side-donate__body { margin: 0 0 0.9rem; font-size: 0.92rem; line-height: 1.5; color: var(--color-text); }
.side-donate__cta {
  display: block; text-align: center; font-family: var(--font-mono);
  font-size: 0.74rem; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 700;
  color: var(--btc-ink); background: var(--btc); padding: 11px; border-radius: 9px; text-decoration: none;
}
.side-donate__cta:hover { background: var(--btc-dark); }
```

Then in both `index.astro` files: **remove** the old `<CategoryRows … />` usage and the old "browse by category" card grid `<section>` (their content now lives in the sidebar). Leave `PopularPosts` if you want it, or move it below the grid. Delete the now-unused `CategoryRows` import if nothing else uses it.

**Acceptance:** desktop shows latest feed left + sticky sidebar right; category index shows zero-padded counts (`07`, `02`) and hides empty categories; one orange Lightning CTA in the sidebar; mobile collapses to a single column (sidebar below the feed). `en` homepage matches with English strings.

---

## Verify before PR
- `npm run dev` → check `/` and `/en/` at mobile + desktop widths.
- Toggle dark mode — all new elements use tokens, so both themes must pass. Run the axe check: `npm run test:e2e` (contrast must pass both themes).
- Confirm no `/og/*.png` renders as an in-site thumbnail anywhere.
- Only ONE orange element per view (homepage: featured CTA + sidebar donate are the two allowed money actions; nothing else orange).
- `npm run build` clean.

Commit as one PR against `main`; GitHub Actions deploys to Cloudflare Pages `dc-news` on merge.

---

## Implementation status (Cursor, 2026-07-11)

| Task | Status |
|------|--------|
| Prep i18n keys | ✅ |
| T1 Header | ✅ |
| T2 Featured hero | ✅ |
| T3 Homepage grid | ✅ |

**Out of scope for this PR:** T4 article page, T5 listings (separate pass).

**Build:** `npm run build` + `npm run test:e2e` before merge.
