# Next Phase Plan — Manual Setup + Testing & Optimization

Two groups: **Group 1 = YOU (manual, accounts/keys/money)** — do these first, in order.
**Group 2 = CURSOR (testing, UX, optimization)** — can start in parallel, doesn't depend on Group 1.

---

## Group 1 — Your manual jobs (with cost + time)

| # | Task | How | Cost | Time |
|---|------|-----|------|------|
| 1 | **Cloudflare Access** on `/admin/stats` + `/api/stats` | follow `docs/CLOUDFLARE-ACCESS-SETUP.md` (Zero Trust dashboard) | **Free** (up to 50 users) | 15 min |
| 2 | **ANTHROPIC_API_KEY** secret → scheduled AI drafts run again | console.anthropic.com → create key → `gh secret set ANTHROPIC_API_KEY -R dunksmaster/duacrypto-news` | ~**$0.05–0.15 per post** (Sonnet), ≈ $2–5/month at 3 posts/week | 10 min |
| 3 | **Alby Lightning address** (zaps) | getalby.com → create account → put address in `src/data/site.json` → `lightningAddress` | **Free** (Alby Hub basic) | 15 min |
| 4 | **Nostr identity** | generate keys (e.g. in Alby extension or `npx nostr-keygen`); npub → `site.json` `nostrPublicKey`; nsec → `gh secret set NOSTR_NSEC -R dunksmaster/duacrypto-news`; run "Publish to Nostr" workflow once | **Free** | 20 min |
| 5 | **Bing/IndexNow re-verify** (fixes the 403) | Bing Webmaster Tools → re-verify site → confirm key file matches | **Free** | 10 min |
| 6 | **UptimeRobot** monitors on both domains → Telegram alert | uptimerobot.com free plan, 2 monitors | **Free** (50 monitors) | 10 min |
| 7 | **2FA + scoped Cloudflare token** check | GitHub/Cloudflare settings; token = `Pages:Edit` only | Free | 15 min |
| 8 | **Telegram alert secrets** for `ci-failure-alert.yml` (`TELEGRAM_BOT_TOKEN`/`CHAT_ID` if not shared with post workflow) | GitHub secrets | Free | 5 min |
| 9 | **Native Albanian read-through** of the 5 affiliate posts | read on phone, note fixes as GitHub issues | Free | 1 h |

**Total cost: ~$2–5/month (only the Anthropic API). Everything else is free tier. Total time: ~2 h.**
Order matters only for 1→2 (secure the dashboard before promoting the site). 3–4 unlock the zap button; 5–8 are independent.

---

## Group 2 — Cursor: Testing & Optimization phase

Prompt to Cursor: *"Implement docs/NEXT-PHASE-PLAN.md Group 2, in order, one commit per step, all CI green."*

### T1 — Smoke tests (extend existing)
1. Every route returns 200: all posts (sq+en), categories, tags, authors, search, embed routes, rss, sitemap, llms.txt, md mirrors, /go/* (expect 302), oembed API.
2. Every post page contains: H1, meta description, canonical, hreflang (when paired), JSON-LD blocks parse as valid JSON, OG image URL resolves 200.
3. Run in CI on every PR against the built `dist/` (fast, no network) + a small post-deploy check against production.

### T2 — Integration tests (the APIs)
4. Views: POST increments, GET returns; bot UA does NOT increment; invalid slug → 404; 11th POST in a minute → 429.
5. Likes: same pattern. Clicks: `/go/tangem?from=x` → 302 to correct URL + row logged; unknown → 302 home.
6. oEmbed: valid JSON schema; embed route renders in iframe (no X-Frame-Options on /embed/*).
7. Zap invoice proxy: graceful 404/empty when `lightningAddress` unset.
8. Tooling: Vitest + Miniflare (Workers test env) so D1 functions are tested locally without touching prod data.

### T3 — Layout / UX / UI testing
9. Playwright (or Astro container + Playwright) viewport matrix: 375px, 768px, 1280px × light/dark. Assert: article text visible in first viewport (the redesign requirement), no horizontal scroll, tap targets ≥44px, hero ≤ 420px tall.
10. Visual regression: Playwright screenshots of homepage + one post per template variant committed as baselines; PR diff comments on change.
11. Accessibility pass: `axe-core` in Playwright — no critical violations on home, post, category, search.
12. Interaction tests: like button (optimistic + persists), share row copy-link, TOC links, language switcher (paired + unpaired posts), geo banner dismiss persists.

### T4 — Workflow testing
13. Dry-run mode for every workflow script (`--dry-run` flag: generate-post, publish-nostr, telegram-post, indexnow ping) + CI job that executes all dry-runs on PR.
14. AI draft pipeline test: schema-validate a fixture draft through `validate:posts`; test that malformed frontmatter fails the build (the safety net actually catches).
15. Failure-path test: deploy workflow fails → verify Telegram alert fires (manual trigger test once, then trust).

### T5 — Performance & optimization
16. Lighthouse CI (`lhci`) in GitHub Actions: budgets — perf ≥ 95 mobile, CLS = 0, LCP < 2.0s on post pages; fails PR if regressed.
17. Optimize what it finds; known candidates: font preloads on news, OG/hero image sizes (`srcset` on hero), Pagefind bundle lazy-load, inline critical CSS if Astro isn't already.
18. Bundle audit: no JS on pages that don't need it (Astro islands check), `public/js/*` under 5 KB each.

### T6 — Continuous improvement loop (after tests exist)
19. Weekly `npm run verify:engagement` + Lighthouse in a scheduled workflow → Telegram summary (1 message: routes ok, APIs ok, perf score, yesterday's views/clicks).
20. Add test results badge + coverage summary to README.

**Effort estimate for Cursor: T1–T2 ≈ 1 day; T3 ≈ 1 day; T4–T5 ≈ 1 day; T6 ≈ 2 h.**

---

## After this phase
Next up (separate plans, already written): POST-REDESIGN-PLAN.md items 9–17 (dates staggering, real screenshots, author persona), then content cadence + GSC-driven queue growth.
