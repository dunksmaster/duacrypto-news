# Build Plan: Views, Likes, Clicks, Zaps, Share/Embed — duacrypto-news

Repo: `duacrypto-news` (Astro, Cloudflare Pages, project `dc-news`).

## Status snapshot (2026-07-09)

| Part | Code | Live |
|------|------|------|
| **A — Analytics** | ✅ Steps 1–6, 7 partial | ✅ D1 `dc-news-analytics` created, migrated, Functions deployed |
| **B — Zaps / Nostr** | ❌ | ❌ |
| **C — Share / embed / OG** | ❌ | ❌ |
| Geo language banner | ❌ | ❌ |

**D1 database ID:** `37ab1a7d-520a-4928-acb3-ee9b2884bdd6` (region EEUR)

## Dependencies

```
npm i -D wrangler                 # ✅ in devDependencies
npm i nostr-tools                 # step 9 — Part B
npm i -D satori @resvg/resvg-js   # step 11 — Part C
```

## Part A — Analytics backend ✅ (code + live)

1. **D1 setup** ✅ — `migrations/0001_init.sql`; remote DB created and migrated.
2. **Views Function** ✅ — `functions/api/views/[slug].ts`
3. **Likes Function** ✅ — `functions/api/likes/[slug].ts`
4. **Click-tracking `/go/*`** ✅ — `functions/go/[name].ts` (static redirects removed)
5. **Frontend widget** ✅ — `public/js/engagement.js`, PostLayout + PostCard
6. **Stats dashboard** ✅ — `/admin/stats/` + `functions/api/stats.ts`
7. **Hardening + backup** ⚠️ — weekly `d1-backup.yml` ✅; rate-limit POSTs still TODO

## Part B — Zaps (Lightning / Nostr) ❌

8. Zap button + LNURL modal
9. Nostr auto-publish + `nostr.json`
10. ZapThreads comments + CSP updates

## Part C — Share & embed ❌

11. OG images at build
12. Share row
13. `/embed/[slug]/`
14. oEmbed API

## Operator (remaining manual)

1. ~~Create D1 + migrate~~ ✅ done
2. ~~Bind `DB` + redeploy~~ ✅ wrangler deploy with `wrangler.toml`
3. **Cloudflare Access** on `/admin/stats` and `/api/stats`
4. **Alby Lightning address** + **NOSTR_NSEC** (Part B)
5. **GSC** submission if not done
6. Rate-limit rule: 10 POST/min per IP on `/api/views/*` and `/api/likes/*` (CF dashboard)

## Acceptance checklist

- [x] `npm run build` green
- [x] `/go/tangem` → 302 to Tangem
- [x] POST `/api/views/{slug}` increments; GET returns count
- [ ] View/like UI on posts (verify in browser after cache clears)
- [ ] `/admin/stats` behind Cloudflare Access
- [ ] Zap modal (Part B)
- [ ] Nostr publish (Part B)
- [ ] Generated OG card in Telegram (Part C)
- [ ] Embed + oEmbed (Part C)
- [x] CSP enforced — no changes needed for Part A widgets (`self` only)
