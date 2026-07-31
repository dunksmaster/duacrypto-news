# Master Task List — Everything Open, Ready for Parallel Agents

**Purpose:** Every unresolved issue from the full audit, in one file, grouped so multiple agents can work **simultaneously without touching the same files.**

**Status check performed before writing this** — do not redo work already done:

| Earlier doc | Status |
|---|---|
| `CURSOR-TASKS-THEMING-AND-HYGIENE.md` (6 tasks) | ✅ All done, committed (3 commits) |
| `CURSOR-TASKS-VISUAL-STANDARDS.md` (7 tasks) | ✅ All done, committed |
| `CURSOR-TASKS-BRAND-WALL.md` (marquee) | 🟡 **Partially done, uncommitted** — see Task A below |
| `CURSOR-TASKS-PRODUCT-IMAGES.md` (image crop) | ❌ **Not started** — see Task B below |

This file supersedes the brand-wall and product-images docs above — use **this file's Task A / Task B** versions, which reflect current code, not the originals.

---

## How to run this in parallel

Each task below lists **exactly which files it touches.** Two tasks with no file overlap can run in separate agents/sessions at the same time. Tasks that share a file are marked — run those sequentially or have one agent do both.

| Task | Files touched | Conflicts with |
|---|---|---|
| **A** — Fix `/brands/` directory page | `CatalogBrandChip.astro`, `src/pages/brands/index.astro`, `catalog.css` (chip selector), `lib/catalog.ts` | none |
| **B** — Fix product image cropping | `CatalogGridCard.astro`, `CatalogProductHero.astro` | none |
| **C** — Category page stats bar + sort/filter | `src/pages/[category]/index.astro` (+ new component) | none |
| **D** — Verify Pagefind indexes the catalog | `astro.config.*`, build scripts, `data-pagefind-body` attrs | none |

**Uncommitted state warning:** `CatalogBrandChip.astro`, `CatalogHomeSections.astro`, `lib/catalog.ts`, and `catalog.css` currently have **uncommitted changes** from the marquee build. Task A's agent should `git status` / `git diff` those four files first to see the in-progress marquee work before editing, so it doesn't get overwritten.

---

# TASK A — `/brands/` directory page is still broken 🔴 CRITICAL

**This is the exact page from the user's screenshot. It is still unfixed.**

### What happened

The brand marquee (homepage) was built correctly and fixed logo legibility **there only**. A second, separate component variant — the default `.catalog-brand-chip` used by the **full `/brands/` directory page** — was never touched. That page still has both original defects:

**1. Dark background, not white**

```css
/* catalog.css:526 — .catalog-brand-chip (default, used by /brands/) */
background: var(--color-card);   /* dark in dark mode */
```

```css
/* catalog.css:478 — .catalog-brand-chip--marquee (homepage only) */
background: #ffffff;             /* correct — but only applies to the marquee variant */
```

The 20 logos that were measured at ~1.0 contrast (invisible) on a dark background are still invisible on `/brands/`, because that page never got the white-plaque fix.

**2. Ambiguous 2-letter monograms, not brand names**

```astro
<!-- CatalogBrandChip.astro:22-25 -->
) : variant === "marquee" ? (
  <span class="catalog-brand-chip__name" aria-hidden="true">{brand.name}</span>
) : (
  <span class="catalog-brand-chip__monogram" aria-hidden="true">{monogram}</span>   <!-- /brands/ still hits this -->
)
```

`/brands/index.astro` renders `<CatalogBrandChip brand={b} locale={locale} />` with no `variant` prop, so it defaults to `"grid"` and hits the monogram branch. The 25-of-43 collision (six brands all showing `"C"`) is unchanged.

### Fix

**File:** [src/styles/catalog.css](src/styles/catalog.css) — selector `.catalog-brand-chip` (~line 526)

Change:
```css
  background: var(--color-card);
```
to:
```css
  background: #ffffff;
```

**File:** [src/components/catalog/CatalogBrandChip.astro](src/components/catalog/CatalogBrandChip.astro) — remove the variant branching for the fallback; use the name in both cases:

```astro
<a href={brandPath(brand.id, locale)} class={chipClass} aria-label={brand.name}>
  {
    brand.logo ? (
      <img src={brand.logo} alt="" width="48" height="48" loading="lazy" />
    ) : (
      <span class="catalog-brand-chip__name" aria-hidden="true">{brand.name}</span>
    )
  }
</a>
```

Then delete the now-unused `catalog-brand-chip__monogram` CSS rule and the `monogram` / `brandMonogram` import if nothing else calls it:

```bash
grep -rn "brandMonogram" src/
```
If [src/lib/catalog.ts](src/lib/catalog.ts)'s `brandMonogram()` has no other callers after this change, delete the function too (it also has the punctuation bug from the earlier audit — `"D'Cent"` → `"D'"` — so deleting is preferable to fixing it if nothing needs it).

**Also add the name-label CSS** if it doesn't already cover the plain (non-marquee) chip size — check that `.catalog-brand-chip__name` renders legibly at the `/brands/` grid's tile size, which may differ from the marquee's 150×72.

### Verify

```bash
npx astro build
curl -s http://localhost:4321/brands/ | grep -c "catalog-brand-chip__monogram"   # expect 0
curl -s http://localhost:4321/brands/ | grep -oE 'catalog-brand-chip__name">[^<]+' | sort | uniq -d   # expect no output
```

Then load `/brands/` in the browser in **dark mode** and confirm every one of the 84 tiles is legible — this is the page to re-check against the original screenshot.

---

# TASK B — Product images still cropped 33% 🔴 CRITICAL

**Confirmed still present — no changes made since the last audit.**

```
CatalogGridCard.astro:67    aspect-ratio: 2 / 3;
CatalogProductHero.astro:136  aspect-ratio: 2 / 3;
```

All 287 catalog thumbnails are square (`150x150` / `500x500`, verified with `sharp` — zero exceptions across all 6 categories). Forcing them into a 2:3 box with `object-fit: cover` crops 33.3% of image width, 16.7% off each side. TBH's own thumbnails are also square and use `contain` — nothing crops on their site.

### Fix 1 — Grid cards

**File:** [src/components/catalog/CatalogGridCard.astro:63-70](src/components/catalog/CatalogGridCard.astro:63)

```css
  .product-card__media img {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 1 / 1;        /* was 2 / 3 */
    object-fit: contain;        /* was cover */
    transition: transform 0.25s ease;
  }
```

### Fix 2 — Product detail hero

**File:** [src/components/catalog/CatalogProductHero.astro:134-137](src/components/catalog/CatalogProductHero.astro:134)

```css
    width: 100%;
    height: auto;
    aspect-ratio: 1 / 1;        /* was 2 / 3 */
    object-fit: contain;        /* was cover */
```

### Fix 3 — Wrong intrinsic size, causes layout shift

**File:** [src/components/catalog/CatalogProductHero.astro:38](src/components/catalog/CatalogProductHero.astro:38)

```astro
<!-- was: width="420" height="630" (2:3, wrong) -->
<img src={image} alt={title} width="500" height="500" loading="lazy" />
```

### Check for other occurrences

```bash
grep -rn "aspect-ratio: 2 / 3\|aspect-ratio: 2/3" src/
grep -rn 'width="420"\|height="630"' src/
```

Apply the same correction anywhere found. **Do not** touch `object-fit` on blog post images — those have genuinely non-square sources and `cover` is correct there. This task is catalog product images only.

### Verify

```bash
npx astro build
grep -rn "aspect-ratio: 2 / 3" src/components/catalog/   # expect no output
```

Visual check on `/hardware-wallets/`, `/books/`, `/seed-backup/`, and `/books/the-genesis-book/` — no product should be clipped at the left/right edge. Expect letterboxing (background showing around non-full-bleed images) — that's correct, don't revert to `cover` to eliminate it.

---

# TASK C — Category pages have no stats bar, sort, or filters 🟡 NEW FEATURE

**Not a bug — a missing feature.** Sized differently from A and B: this is real engineering, not a CSS fix. Scope it as its own piece of work.

### What TBH has that you don't

Measured on `thebitcoinhole.com/hardware-wallets/`:

```
74 PRODUCTS   32 BRANDS   20% TOP DISCOUNT

Filters                    SORT BY: Default
[sidebar with ~90 filterable spec fields, grouped by category:
 BASIC INFORMATION, SECURITY, FIRMWARE, DEVICE LOCK, PRIVATE KEYS, ...]
```

Your equivalent page: breadcrumb → one-line blurb → flat card list. No count, no sort, no filter — despite the same spec data already existing in your JSON (`src/data/catalog/items/`).

### Minimum viable version (recommended starting scope)

Don't build the full 90-field filter sidebar in one pass — start with:

1. **Stats line** under the category heading: `{count} PRODUCTS · {brandCount} BRANDS` — trivial, data already available via `getItems(category)` in [src/lib/catalog.ts](src/lib/catalog.ts).
2. **Sort control**: Name (A–Z), Newest. Client-side, no backend needed.
3. **2–3 filter facets per category**, not all 90 — pick the ones most likely to matter (e.g. hardware wallets: "Available in Albania" / "Bitcoin-only firmware" / "Air-gapped"). Expand later based on what users actually filter by.

**New component suggestion:** `src/components/catalog/CatalogFilterBar.astro`, mounted in [src/pages/\[category\]/index.astro](src/pages/[category]/index.astro).

Client-side filtering (URL query params or plain JS state) is sufficient — this is a static site, no server-side filtering needed.

### This task needs a scoping decision, not blind execution

Before building: confirm with the project owner which facets matter per category, and whether sort/filter state should persist in the URL (recommended, so filtered views are shareable/bookmarkable and indexable). Don't guess at 90 filter fields from the JSON without that check-in.

---

# TASK D — Verify Pagefind indexes the catalog 🟡 VERIFICATION ONLY

**Quick check, not a rebuild.** The original restructure plan called for `data-pagefind-body` on catalog items so search covers all 287 products, not just the 20 blog posts.

```bash
grep -rn "data-pagefind-body" src/pages/\[category\]/ src/layouts/
```

If catalog pages are missing the attribute, add it to the product detail template. Then rebuild and check the generated Pagefind index actually contains catalog content:

```bash
npx astro build
grep -l "genesis\|tangem\|bitbox" dist/pagefind/*.json 2>/dev/null | head -3
```

If catalog pages already have `data-pagefind-body`, this task is done — report back rather than making speculative changes.

---

## Explicitly out of scope for all four tasks

- **Do not** fetch brand logos or product images from any third-party service at runtime.
- **Do not** apply `filter: invert()` to logos.
- **Do not** re-crop, re-export, or regenerate any image file — Task B is CSS only.
- **Do not** build the full 90-field filter sidebar in Task C without a scoping check-in first.
- **Do not** add a live BTC price ticker or build real `/deals/` and `/latest/` pages — both require ongoing editorial/data curation and are backlog items, not part of this list.
- **Do not** run `npm run build` while testing (its `postbuild` pings IndexNow and notifies search engines). Use `npx astro build`.
- **Do not** touch `.tmp-thebitcoinhole-database`, `vendor/`, `.gitattributes`, or the `/shop/*` routes — all already resolved in earlier rounds.

---

## Suggested commits

One per task, in this order (A and B first — both are user-visible regressions from the screenshot; C and D can follow):

```
A: Fix invisible logos and colliding monograms on /brands/ directory page
B: Stop cropping catalog product images by 33%
C: Add product count, sort, and initial filters to category pages
D: Verify/enable Pagefind indexing for catalog pages
```
