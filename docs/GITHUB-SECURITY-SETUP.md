# GitHub security setup (manual steps)

Items that cannot be fully automated from the repo. Do once per repository (`duacrypto-news`, `TokenDC`).

## Branch protection (required)

✅ **Active** — ruleset `Protect main` on both repos (PR required, `verify` status check, no force-push). Repo admins can bypass for emergencies.

To review: GitHub → **Settings → Rules → Rulesets**.

## Secret scanning + push protection

GitHub → **Settings → Code security and analysis**:

- Enable **Secret scanning** (public repos: free)
- Enable **Push protection** (blocks commits containing known secret patterns)

## Account hardening

- GitHub + Cloudflare: **2FA enabled**
- Cloudflare API token: scoped to **Pages Edit** on `dc-site` + `dc-news` only (separate DNS Edit token for fix-dns workflows)
- Rotate tokens if ever pasted into chat or committed

## Dependabot

Configured in `.github/dependabot.yml` (weekly npm + github-actions). Review and merge Dependabot PRs promptly.

## Pinned Actions

Workflows pin third-party actions to full commit SHAs (comment shows tag). When Dependabot opens an actions bump PR, verify the new SHA and merge.

## CI failure alerts

`.github/workflows/ci-failure-alert.yml` posts to Telegram when a main-branch workflow fails. Requires repo secrets:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

(Same secrets as news publish notifications — optional on TokenDC if you only want news alerts.)

## Uptime monitoring (external)

Free tier: [UptimeRobot](https://uptimerobot.com) monitors:

- `https://duacrypto.com/`
- `https://news.duacrypto.com/`

Alert channel: Telegram or email.

## Quick verify commands

```bash
gh api repos/dunksmaster/duacrypto-news/rulesets
gh api repos/dunksmaster/TokenDC/rulesets
```
