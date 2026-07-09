# Security, Infrastructure & Scaling Plan — DuaCrypto (main site + news)

Analysis date: 2026-07-09. Covers `TokenDC` (duacrypto.com) and `duacrypto-news` (news.duacrypto.com).

---

## 1. Where we are now (audit)

### What's already solid ✅
| Area | State |
|---|---|
| Hosting | Cloudflare Pages both sites — global CDN, DDoS protection, auto-TLS, effectively infinite static scale for free |
| CI/CD | News: GitHub Actions deploy on push to main, secrets correctly in GitHub Secrets (Cloudflare token, Anthropic key, Telegram bot) — nothing in the repo |
| AI pipeline | Cron drafts (Mon/Wed/Fri) → PR → human review → merge = deploy. Correct trust model |
| Headers (news) | HSTS (2y, preload), nosniff, frame deny, Permissions-Policy, immutable caching, `ai-train=yes` |
| Headers (main) | CSP enforced in CI build (per recent commits), same hardening set |
| Content infra | md mirrors, IndexNow ping, Pagefind search, smoke tests, post validation script |
| Git hygiene | News repo: clean tree, everything committed |

### Gaps found ⚠️ (ordered by risk)
1. ~~**News site has NO Content-Security-Policy**~~ ✅ Fixed — generated in prebuild, enforced in CI.
2. ~~**TokenDC has 17 uncommitted files**~~ ✅ Fixed — committed and pushed.
3. **Branch protection unverified** on either repo — see `docs/GITHUB-SECURITY-SETUP.md`.
4. ~~**No dependency security automation**~~ ✅ Dependabot + `npm audit --audit-level=high` in CI (both repos).
5. ~~**GitHub Actions not pinned to commit SHAs**~~ ✅ All workflows pinned; minimum `permissions:` set.
6. ~~**No monitoring**~~ ⚠️ CI failure → Telegram workflow added; UptimeRobot still manual (see setup doc).
7. **Account-level hardening unverified** — 2FA + scoped API tokens (manual).
8. **No backend yet** for views/clicks (planned Phase 4) — rate-limiting TBD when Functions land.

---

## 2. Security hardening plan (do in this order)

### Sprint S1 — this week, ~half day
1. **CSP on news site** ✅ — `lib/site-security-headers.mjs` + `scripts/generate-headers.mjs`; enforced in CI (`CSP_ENFORCE=1`). Allowlist: `'self'`, GA/gtag, Pagefind (self), Formspree.
2. **Commit & push the 17 pending TokenDC files.** ✅ Done — adopt the rule: nothing stays uncommitted overnight.
3. **Branch protection on both repos**: require PR before merge on `main`, no force-push, no deletion. Manual — `docs/GITHUB-SECURITY-SETUP.md`.
4. **2FA + token scoping**: verify 2FA on GitHub and Cloudflare; regenerate the Cloudflare API token scoped to `Pages:Edit` on the two projects only.

### Sprint S2 — next, ~half day
5. **Dependabot** ✅ — `.github/dependabot.yml` both repos + `npm audit --audit-level=high` in CI.
6. **Pin all GitHub Actions to full commit SHAs** ✅ — minimum `permissions:` on all workflows.
7. **Secret scanning**: enable GitHub secret scanning + push protection on both repos (manual — setup doc).
8. **CODEOWNERS** ✅ — `@dunksmaster` on both repos.
9. **PR preview URLs** ✅ — `preview.yml` deploys `pr-{n}.dc-news.pages.dev` and comments on PR.
10. **CI failure alerts** ✅ — `ci-failure-alert.yml` → Telegram (needs secrets).

### Sprint S3 — when Phase 4 backend lands
9. Views/likes/click Functions get: input validation (slug allowlist regex), rate limiting per IP (Cloudflare rate-limiting rule or KV counter), bot UA filtering, no PII stored (country + timestamp only — keeps GDPR trivial).
10. `/admin/stats` behind **Cloudflare Access** (free, Google login).
11. **Turnstile** (free CAPTCHA) on any future form (translation requests, comments).
12. D1 backup: weekly scheduled `wrangler d1 export` artifact (GitHub Action) — the analytics data becomes irreplaceable once it has history.

---

## 3. Infrastructure & structure improvements

1. **Environments**: use Cloudflare Pages preview deployments as staging — every PR already gets a preview URL; add the URL as a PR comment (pages-action supports it) so you review AI drafts *rendered*, not just as markdown diff.
2. **Config as code**: keep site config (affiliates, categories, i18n dictionaries) in typed `src/data/*.ts` — already the pattern; extend to headers/redirects generation so `_headers` is built, not hand-edited (main site already generates assets in prebuild — same pattern).
3. **Shared brand package (later, only if pain appears)**: main site and news duplicate tokens/fonts/footer content. If they drift annoyingly, extract a tiny `@duacrypto/brand` npm package (tokens + logo + footer data). Don't do it preemptively — two repos copying a CSS file is fine at this scale.
4. **Runbook docs**: `docs/RUNBOOK.md` per repo — how to deploy, rotate a secret, roll back (git revert = unpublish), where secrets live. 30 minutes now, saves hours during an incident.
5. **Repo cleanup (TokenDC)**: move planning .md files (`CURSOR_*`, `*_PLAN.md`) into `docs/plans/`; delete the stray `PC_Boost_Pro_v4.bat`/`PC_Security_Shield.bat` from the repo folder (unrelated to the site).

## 4. Scaling & growth plan

### Traffic scale — already solved
Static on Cloudflare = handles a viral post (100k visitors/day) without config or cost. The only components that can fall over are the future Functions/D1 — mitigations in S3 (rate limits, caching counts 60s at the edge).

### Content scale (the real growth lever)
1. **Increase AI cadence safely**: cron 3×/week → daily once review time per PR is <10 min; the PR preview URL (infra #1) is what makes fast review possible.
2. **Content queue as product**: grow `content-queue.yaml` from keyword clusters (KEYWORDS.md scoreboard) — GSC positions 8–20 auto-feed the queue ("strengthen this post" tasks, not just new posts).
3. **Language expansion** per the i18n plan: en → it → de, each triggered by analytics evidence, launched with UI + top-10 posts bundle.
4. **Distribution automation**: Telegram autopost exists ✓; add X/Twitter posting on merge; newsletter digest (weekly, from RSS) — closes the loop to the Gumroad funnel.

### Measurement scale
5. Phase 4 dashboard (views/clicks/likes) → weekly numbers review: posts published, GSC clicks, affiliate clicks per post, newsletter signups. One page, five numbers, every Monday.
6. **Uptime + deploy alerts**: UptimeRobot (free) on both domains → Telegram alert; GitHub Actions failure notifications → Telegram (small workflow step).
7. **Error tracking** on Functions when they land: Sentry free tier (already used on another of your projects) or simply `console.error` + Cloudflare Pages Functions logs.

### Revenue scale (sequence)
8. Affiliate posts (live) → 9. Newsletter cross-sell in every post (CTA scoring enforces this) → 10. When traffic proves out: own products (guides/courses on Gumroad — infrastructure already exists) → 11. Sponsored posts with disclosure (standards section already written).

---

## 5. Priority order (single list)

| # | Action | Effort | Impact |
|---|---|---|---|
| 1 | CSP on news site | 2h | closes top attack vector |
| 2 | Commit TokenDC pending work | 15min | stops data-loss risk |
| 3 | Branch protection + 2FA + scoped tokens | 1h | locks the supply chain |
| 4 | Dependabot + SHA-pinned actions + secret scanning | 2h | automated security floor |
| 5 | PR preview URLs for AI drafts | 1h | unlocks faster publishing |
| 6 | Uptime + CI-failure alerts to Telegram | 1h | you know when things break |
| 7 | Phase 4 backend (views/clicks) with S3 hardening built-in | 1–2d | measurement engine |
| 8 | Weekly metrics ritual + queue-from-GSC | ongoing | compounding growth |
