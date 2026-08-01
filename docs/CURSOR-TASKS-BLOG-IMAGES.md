# Cursor Task — Blog post cards show "PA FOTO — TEKST" on every post

**Unrelated to the catalog/marquee work** — this is the original news blog (`src/content/posts/`), not the product database. Safe to do in parallel with anything else in progress; touches only [src/lib/posts.ts](src/lib/posts.ts).

---

## Root cause (verified, not guessed)

All 21 posts in `src/content/posts/*.md` have no `image:` front-matter field:

```bash
grep -L "^image:" src/content/posts/*.md | wc -l   # 21 — all of them
```

That part is expected — no images have ever been assigned. The actual bug is that **branded images already exist for every post and aren't being used.**

`scripts/generate-og-images.mjs` runs on every `prebuild` and generates a 1200×630 branded title-card PNG per post (dark gradient, category label, wrapped title) to `public/og/{slug}.png`. All 21 already exist:

```bash
ls public/og/*.png | wc -l   # 21
```

[src/lib/posts.ts](src/lib/posts.ts) has two functions that decide what image to show:

```ts
// line 84 — used for social-share meta tags (og:image)
export function resolveOgImagePath(image: string | undefined, slug: string): string {
  if (image && image !== DEFAULT_OG) return image;
  return `/og/${slug}.png`;      // <-- already falls back correctly
}

// line 72 — used for the visible card thumbnail on the site itself
export function resolveHeroSrc(
  image: string | undefined,
  slug: string,
  heroStyle?: "banner" | "none" | "screenshot",
): string | null {
  if (heroStyle === "none") return null;
  if (heroStyle === "screenshot" && image && !isGenericHeroImage(image)) return image;
  if (image && !isGenericHeroImage(image)) return image;
  return null;                   // <-- returns null instead of falling back — this is the bug
}
```

Social sharing already gets a real image. The on-site card (`PostCard.astro`, `HomeBlogSection.astro`) calls `resolveHeroSrc`, gets `null`, and renders the "PA FOTO — TEKST" placeholder instead.

---

## Fix

**File:** [src/lib/posts.ts:72-81](src/lib/posts.ts:72)

Change the final `return null;` to fall back to the same generated OG image `resolveOgImagePath` already uses:

```ts
export function resolveHeroSrc(
  image: string | undefined,
  slug: string,
  heroStyle?: "banner" | "none" | "screenshot",
): string | null {
  if (heroStyle === "none") return null;
  if (heroStyle === "screenshot" && image && !isGenericHeroImage(image)) return image;
  if (image && !isGenericHeroImage(image)) return image;
  return `/og/${slug}.png`;
}
```

`heroStyle === "none"` still returns `null` deliberately — that flag exists so specific posts can opt out of a hero image entirely. Don't remove that line.

---

## Verify

```bash
npx astro build
grep -c "PA FOTO" dist/index.html dist/en/index.html
```
Expect `0` in both (or absent entirely) once posts render with the generated OG image as their card thumbnail.

Visual check: homepage "Artikujt e fundit" section and `/blog/` — every card should show a dark branded title-card image, no striped placeholder.

---

## Do not do

- **Do not** touch `scripts/generate-og-images.mjs` — it already works correctly and is already in `prebuild`.
- **Do not** download stock images or add Canva-made images as part of this task — that's a separate, optional upgrade for later, not required to fix the immediate bug. If real per-post photos get added later, use only properly licensed sources (Unsplash/Pexels/Pixabay, or a brand's own press kit for exchange/wallet logos) — never an unlicensed image pulled from a search result.
- **Do not** touch `resolveOgImagePath` — it's already correct and this task doesn't need it changed.
