# Deferred work — see completed items below (2026-07-09)

## Part B — Zaps / Nostr

| Step | Status |
|------|--------|
| Zap button + LNURL modal | ✅ Code live — set `lightningAddress` in `src/data/site.json` |
| Nostr auto-publish | ✅ `scripts/publish-nostr.mjs` + workflow — set `NOSTR_NSEC` secret |
| Nostr note links on posts | ✅ `NostrNote.astro` — set `nostrPublicKey` + run publish |
| ZapThreads comments | ⏳ Optional — use nostr.band links for now |

## Part A — finish hardening

- Cloudflare Access on `/admin/stats` + `/api/stats` → **`docs/CLOUDFLARE-ACCESS-SETUP.md`**
- Rate-limit POSTs → ✅ D1 in code + **`docs/CLOUDFLARE-RATE-LIMITS.md`**
- IndexNow: re-verify Bing key (403 today)

## Geo + growth

- Geo language-suggestion banner → ✅ `/api/geo` + `GeoBanner.astro`
- GSC → content queue → ✅ `npm run import:gsc-queue`
- EN localize posts → ✅ 3 new EN pairs (Bitget, Tangem, legal)

## Optional

- `docs/POST-REDESIGN-PLAN.md` — post page visual refresh
- Merge Dependabot PRs manually

## Already live (do not rebuild)

- Part A analytics (D1 + views/likes/clicks)
- Part C (OG images, share row, embed, oEmbed)
- i18n `/en/` tree
- Security S1 + S2 (CSP, Dependabot, branch protection, CI alerts)