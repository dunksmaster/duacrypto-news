# Later — deferred work (saved for when you return)

Pick up here after GitHub/Cloudflare noise is sorted.

## Part B — Zaps / Nostr (needs your keys)

| Step | Blocker |
|------|---------|
| Zap button + LNURL modal | Alby Lightning address → add to `src/data/site.json` |
| Nostr auto-publish | `NOSTR_NSEC` GitHub secret + `scripts/publish-nostr.mjs` |
| ZapThreads comments | Nostr event IDs + CSP updates for relay websockets |

## Part A — finish hardening

- Cloudflare Access on `/admin/stats` + `/api/stats`
- Rate-limit rule: 10 POST/min per IP on `/api/views/*` and `/api/likes/*`
- IndexNow: re-verify Bing key (403 today)

## Geo + growth

- Geo language-suggestion banner (Cloudflare Functions)
- GSC → content queue automation
- Weekly 5-number metrics ritual (`/admin/stats`)

## Optional

- `docs/POST-REDESIGN-PLAN.md` — post page visual refresh
- Merge Dependabot PRs manually (don't auto-merge major action bumps)

## Already live (do not rebuild)

- Part A analytics (D1 + views/likes/clicks)
- Part C (OG images, share row, embed, oEmbed)
- i18n `/en/` tree
- Security S1 + S2 (CSP, Dependabot, branch protection, CI alerts)
