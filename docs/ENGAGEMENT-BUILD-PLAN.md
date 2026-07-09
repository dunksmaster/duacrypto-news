# Build Plan: Views, Likes, Clicks, Zaps, Share/Embed — duacrypto-news

Repo: `duacrypto-news` (Astro, Cloudflare Pages, project `dc-news`).

## Status snapshot (2026-07-09)

| Part | Code | Live |
|------|------|------|
| **A — Analytics** | ✅ | ✅ D1 + Functions |
| **B — Zaps / Nostr** | ❌ | ❌ |
| **C — Share / embed / OG** | ✅ | ⏳ deploy pending |
| Geo language banner | ❌ | ❌ |

**D1 database ID:** `37ab1a7d-520a-4928-acb3-ee9b2884bdd6` (region EEUR)

## Part A — Analytics ✅

Steps 1–6 live. Step 7 partial (D1 backup ✅; rate-limit POSTs still manual in CF dashboard).

## Part C — Share & embed ✅ (code)

11. **OG images** — `scripts/generate-og-images.mjs` → `public/og/{slug}.png` (1200×630, prebuild)
12. **Share row** — `ShareRow.astro` + `public/js/share.js` (Telegram, WhatsApp, X, copy, Web Share)
13. **Embed card** — `/embed/{slug}/` + `/en/embed/{slug}/`; CSP `frame-ancestors *` on embed paths only
14. **oEmbed** — `functions/api/oembed.ts` + discovery `<link rel="alternate" type="application/json+oembed">`

## Part B — Zaps / Nostr ❌

Needs Alby Lightning address + `NOSTR_NSEC`.

## Operator (remaining manual)

- Cloudflare Access on `/admin/stats` + `/api/stats`
- CF rate rule: 10 POST/min on `/api/views/*` and `/api/likes/*`
- Part B keys (Lightning + Nostr)

## Acceptance checklist

- [x] Part A live
- [x] OG PNGs generated at build
- [x] Share row on posts
- [x] Embed routes + iframe-friendly headers
- [x] oEmbed API + discovery tag
- [ ] Verify Telegram link preview shows OG card (after deploy)
- [ ] Part B / geo banner
