# Build Plan: Views, Likes, Clicks, Zaps, Share/Embed — duacrypto-news

Cursor-ready implementation plan. Repo: `duacrypto-news` (Astro, Cloudflare Pages, project `dc-news`).
Rule: work through steps IN ORDER, one commit per step, `npm run build` must pass after each.

## Dependencies to add
```
npm i -D wrangler                 # D1 migrations + local dev (if not already global)
npm i nostr-tools                 # step 9 — publish posts to Nostr (used in scripts/, not shipped to client)
npm i -D satori @resvg/resvg-js   # step 11 — build-time OG image generation (or use astro-og-canvas as simpler alt)
```
No client-side npm deps needed: view/like/zap widgets are tiny vanilla JS; ZapThreads loads as a `<script>` embed (add its origin to CSP).
Cloudflare resources (one-time, dashboard or wrangler): create D1 database `dc-news-analytics`, bind it to the Pages project as `DB`.
Secrets to add later (GitHub Actions): `NOSTR_NSEC` (step 9 only).

## Part A — Analytics backend (views + likes + affiliate clicks)

1. **D1 setup**: create `migrations/0001_init.sql` with tables
   `views(slug TEXT PRIMARY KEY, count INTEGER DEFAULT 0, updated_at TEXT)`,
   `likes(slug TEXT PRIMARY KEY, count INTEGER DEFAULT 0)`,
   `clicks(id INTEGER PRIMARY KEY AUTOINCREMENT, affiliate TEXT, from_slug TEXT, country TEXT, created_at TEXT)`.
   Apply with `wrangler d1 migrations apply dc-news-analytics --remote`. Bind as `DB` in Pages project settings.
2. **Views Function**: `functions/api/views/[slug].ts` — GET returns `{count}`; POST increments then returns. Validate slug against `^[a-z0-9-]{1,100}$` (404 otherwise). Skip increment when user-agent matches bot regex (`bot|crawl|spider|preview|GPTBot|Claude|Perplexity`). Cache GET at edge 60s.
3. **Likes Function**: `functions/api/likes/[slug].ts` — same pattern, POST increments once (client enforces via localStorage flag `liked:<slug>`).
4. **Click-tracking redirects**: replace static `/go/*` redirects with `functions/go/[name].ts` — look up affiliate URL from `src/data/affiliates.ts` (import the same map), log `(affiliate, from_slug from ?from= param, request.cf.country)` into `clicks`, 302 redirect. Unknown name → 302 to homepage. Keep URLs identical (`/go/tangem` etc.) so existing posts don't change.
5. **Frontend widget**: small inline script in the post layout — on load POST `/api/views/<slug>` (debounce: skip if `viewed:<slug>` in localStorage < 24h old), render `👁 N` in the post header and `🧡 N` like button (optimistic UI). Add view count to post cards on listings (GET, lazy, non-blocking — page must render fine if API fails).
6. **Stats dashboard**: static `/admin/stats/` page fetching `functions/api/stats.ts` (top posts by views/likes, clicks per affiliate per post, last 30 days). Protect BOTH the page and the API with Cloudflare Access (manual dashboard step — document it in the README section of this file when done).
7. **Hardening + backup**: rate-limit POSTs (per-IP KV counter or CF rate rule, 10/min), no PII stored; add weekly GitHub Action running `wrangler d1 export` and uploading the artifact.

## Part B — Zaps (Lightning / Nostr)

8. **Zap button (Level 1)**: create Lightning address first (manual: Alby — put the address in `src/data/site.ts`). Add "⚡ Zap this post" button in post layout → modal with LNURL QR code (generate QR client-side, tiny vanilla lib or inline SVG QR generator) + WebLN one-click path if `window.webln` exists. Log zap clicks to D1 (`clicks` table, affiliate='zap'). No backend payment handling — LNURL goes direct to the wallet provider.
9. **Nostr auto-publish (Level 2)**: `scripts/publish-nostr.mjs` using `nostr-tools` — on merge to main (new workflow step in deploy.yml, gated on `NOSTR_NSEC` secret existing), publish new/changed posts as NIP-23 long-form events to 5–6 major relays (damus, nos.lol, primal, snort). Add `.well-known/nostr.json` (NIP-05) with the site's npub. Store mapping slug→event-id in `public/nostr-events.json` (committed by the workflow) so re-runs update instead of duplicate.
10. **ZapThreads comments**: embed ZapThreads web component on post pages, anchored to the post's Nostr event id (from `nostr-events.json`; hide section if post has no event yet). Shows Nostr comments + total sats zapped. Add its script origin + relay websockets (`wss://`) to the CSP connect-src/script-src allowlist in `lib/site-security-headers.mjs`.

## Part C — Share & embed

11. **OG images at build**: prebuild script generates `public/og/<slug>.png` (1200×630, post title + category + DuaCrypto branding, satori + resvg or astro-og-canvas). Post layout sets `og:image` to it when the post has no custom hero. Verify with Telegram/X preview debuggers.
12. **Share row**: Telegram, WhatsApp, X, copy-link buttons + `navigator.share` on mobile. Pure links/vanilla JS, no SDK scripts. Append `?utm_source=share` for tracking.
13. **Embed card**: route `/embed/[slug]/` rendering a compact card (og image, title, excerpt, "Read on DuaCrypto News →"), `X-Frame-Options` removed ONLY for `/embed/*` (override in generated `_headers`), plus "Copy embed code" button on posts producing the iframe snippet.
14. **oEmbed**: `functions/api/oembed.ts` (or static per-post JSON at build) returning rich-type oEmbed pointing at the embed route; add `<link rel="alternate" type="application/json+oembed">` discovery tag in post heads.

## Acceptance checklist
- [ ] `npm run build` green; smoke tests updated for new UI elements
- [ ] View/like counts visible on post + cards; refresh doesn't double-count; curl with GPTBot UA doesn't increment
- [ ] `/go/tangem?from=some-post` logs a row and redirects correctly
- [ ] `/admin/stats` unreachable without Cloudflare Access login
- [ ] Zap modal shows QR; WebLN works with Alby extension
- [ ] Post appears on a Nostr client (e.g. primal.net) after merge; NIP-05 resolves
- [ ] Pasting a post URL in Telegram shows generated OG card
- [ ] Iframe embed renders on an external test page; oEmbed JSON valid
- [ ] CSP still enforced — no console CSP violations on post pages
```
