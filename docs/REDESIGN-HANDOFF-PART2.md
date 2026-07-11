# Redesign Handoff — Part 2 (mockup parity)

**Prerequisite:** PR #6 merged (T1–T3 live).

**Scope:** Presentation + minimal content flags (`featured: true`). Obey `docs/DESIGN-SYSTEM.md` color law.

## T4 — TrustBar mono ticker

**File:** `src/components/TrustBar.astro`, `src/i18n/ui.ts`

- Mono ticker: `{trustLead} /// {count} {trustTelegramShort} /// {trustSince} {year}`
- Cyan outline **Bashkohu →** / **Join →** button (not orange)

## T5 — Remove marketing hero band

**Files:** `src/pages/index.astro`, `src/pages/en/index.astro`

- Delete the large “Bitcoin dhe Web3…” / heroTitle section
- Featured block is the page hero (`data-pagefind-body` on featured section)

## T6 — Pinned featured post

**Files:** `src/content.config.ts`, `src/lib/posts.ts`, Bitcoin guide posts, both index pages

- Schema: `featured: boolean` (default false)
- Set `featured: true` on `si-te-blej-bitcoin-ne-shqiperi.md` (sq) and `buy-bitcoin-in-albania.md` (en)
- `pickFeaturedPost()` — explicit flag wins; exclude featured from latest feed

## T7 — Feed row layout

**File:** `src/components/PostCard.astro`, `src/i18n/ui.ts`

- Order: meta → title → description (2-line clamp)
- Hatched placeholder thumb `PA FOTO — TEKST` / `NO PHOTO — TEXT` when no real image
- Views: only when `/api/views` returns ≥25 (existing script). No invented sats.

## Verify

- `npm run build`
- `npm run test:e2e`
- Homepage screenshots (sq + en, desktop + mobile)
