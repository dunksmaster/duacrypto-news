# Why you got GitHub / workflow emails today

## 1. Failed deploy (one real issue — fixed)

**When:** push `6b266b9` — “Add D1 analytics…”  
**Workflow:** Deploy to Cloudflare Pages  
**Error:** `Invalid database UUID (00000000-0000-0000-0000-000000000000)`

`wrangler.toml` still had the placeholder D1 id. Cloudflare rejected the Functions bundle.

**Fix:** commit `5b56fe6` set real id `37ab1a7d-520a-4928-acb3-ee9b2884bdd6`. Later deploys **succeeded**.

This triggered:
- GitHub “workflow run failed” email
- **CI failure alert** workflow (Telegram if secrets set)

---

## 2. Dependabot burst (new today)

We enabled **Dependabot** in Sprint S2. Within minutes it opened PRs on both repos:

| Repo | Examples |
|------|----------|
| duacrypto-news | bump `actions/setup-node`, `wrangler-action`, `create-pull-request`, … |
| TokenDC | bump `wrangler`, `fontawesome`, `playwright`, … |

Each PR triggers:
- **Verify build** (usually passes)
- **PR preview** (was **failing** — see below)

GitHub emails you for: new PR, failed checks, Dependabot summaries.

**What we changed:** skip preview for `dependabot[bot]` PRs; cap action updates; ignore major semver bumps.

You can **close** the 4 open action-bump PRs on duacrypto-news without merging — we pin Actions to SHAs manually.

---

## 3. PR preview failures (noise, not production)

**Error:** `Set CLOUDFLARE_PAGES_API_TOKEN and CLOUDFLARE_ACCOUNT_ID for PR previews`

Dependabot PRs **do not receive repository secrets** (GitHub security). Preview workflow treated missing secrets as hard failure → red X → email.

**Fix:** preview skips Dependabot; missing secrets → warning + skip (not fail).

---

## 4. AI draft post failure (expected until you add secret)

**When:** manual `workflow_dispatch` ~11:00 UTC  
**Error:** `ANTHROPIC_API_KEY is required`

Cron Mon/Wed/Fri will skip gracefully until you run:

```bash
gh secret set ANTHROPIC_API_KEY -R dunksmaster/duacrypto-news
```

---

## 5. Not email DNS / Cloudflare email routing

These notifications are **GitHub Actions**, not PrivateEmail/SPF/DMARC. Site contact form uses Formspree — unrelated.

---

## Reduce future email

GitHub → **Settings → Notifications** → uncheck “Actions” failures if you only want Telegram alerts.

Or keep emails but after today’s fixes you should only see:
- Real main-branch deploy failures
- Dependabot PR opens (weekly, fewer)

---

## Current status (2026-07-09 ~16:30 UTC)

| Workflow | Last main run |
|----------|----------------|
| Deploy to Cloudflare Pages | ✅ success (Part C) |
| Verify build | ✅ success |
| CI failure alert | skipped (no failure) |

Site is live; no action required unless you want to set `ANTHROPIC_API_KEY` or close Dependabot PRs.
