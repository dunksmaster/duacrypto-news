# Build Plan: Views, Likes, Clicks, Zaps, Share/Embed — duacrypto-news

Repo: `duacrypto-news` (Astro, Cloudflare Pages, project `dc-news`).

## Status snapshot (2026-07-09)

| Part | Code | Live |
|------|------|------|
| **A — Analytics** | ✅ | ✅ D1 + Functions |
| **B — Zaps / Nostr** | ✅ | ⏳ set keys in site.json + secrets |
| **C — Share / embed / OG** | ✅ | ✅ |
| Geo language banner | ✅ | ⏳ deploy pending |

**D1 database ID:** `37ab1a7d-520a-4928-acb3-ee9b2884bdd6` (region EEUR)

## Part A — Analytics ✅

Steps 1–6 live. Step 7: D1 backup ✅; rate-limit POSTs ✅ in Functions + optional CF dashboard rule.

## Part B — Zaps / Nostr ✅ (code)

- `ZapButton.astro` + `/api/zap/invoice` LNURL proxy — set `lightningAddress` in `site.json`
- `scripts/publish-nostr.mjs` + `.github/workflows/publish-nostr.yml` — set `NOSTR_NSEC`
- `NostrNote.astro` — set `nostrPublicKey`, run publish workflow

## Part C — Share & embed ✅ (live)

11. **OG images** — `scripts/generate-og-images.mjs` → `public/og/{slug}.png` (1200×630, prebuild)
12. **Share row** — `ShareRow.astro` + `public/js/share.js` (Telegram, WhatsApp, X, copy, Web Share)
13. **Embed card** — `/embed/{slug}/` + `/en/embed/{slug}/`; CSP `frame-ancestors *` on embed paths only
14. **oEmbed** — `functions/api/oembed.ts` + discovery `<link rel="alternate" type="application/json+oembed">`

## Part B — Zaps / Nostr ✅ (code)

Needs Alby Lightning address + `NOSTR_NSEC` to activate UI.

## Operator (remaining manual)

- Cloudflare Access on `/admin/stats` + `/api/stats` — `docs/CLOUDFLARE-ACCESS-SETUP.md`
- Optional CF WAF rate rule — `docs/CLOUDFLARE-RATE-LIMITS.md`
- Part B keys (Lightning + Nostr)

## Acceptance checklist

- [x] Part A live
- [x] OG PNGs generated at build
- [x] Share row on posts
- [x] Embed routes + iframe-friendly headers
- [x] oEmbed API + discovery tag
- [ ] Verify Telegram link preview shows OG card (after deploy)
- [ ] Part B / geo banner
