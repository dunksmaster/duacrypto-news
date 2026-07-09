# Cloudflare Access — protect `/admin/stats` and `/api/stats`

The analytics dashboard at `https://news.duacrypto.com/admin/stats/` and its API `GET /api/stats` are **public until you apply this policy**. Follow these steps in the Cloudflare dashboard (~15 minutes).

## Prerequisites

- Cloudflare account with **Zero Trust** enabled (free tier works)
- Domain `news.duacrypto.com` on Cloudflare
- Google account (or email OTP) for login

## Steps

### 1. Open Zero Trust

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Zero Trust**
2. **Access** → **Applications** → **Add an application**
3. Type: **Self-hosted**

### 2. Create application: `DuaCrypto News Admin`

| Field | Value |
|-------|-------|
| Application name | `DuaCrypto News Admin` |
| Session duration | 24 hours |
| Application domain | `news.duacrypto.com` |
| Path | `/admin` |

Add a **second path** on the same application (or duplicate app):

| Path | Purpose |
|------|---------|
| `/admin/*` | Stats dashboard HTML |
| `/api/stats` | JSON API used by the dashboard |

### 3. Identity provider

1. Zero Trust → **Settings** → **Authentication**
2. Add **Google** (recommended) or **One-time PIN** to your email
3. Save

### 4. Access policy

On the application → **Policies** → **Add a policy**:

| Setting | Value |
|---------|-------|
| Policy name | `Allow DuaCrypto team` |
| Action | **Allow** |
| Include | Emails ending in `@yourdomain.com` **OR** your personal Gmail |
| Require | (optional) 2FA in Google |

Save. Default deny applies to everyone else.

### 5. Verify

1. Open an incognito window → `https://news.duacrypto.com/admin/stats/`
2. You should see Cloudflare Access login, not the dashboard
3. After login, dashboard loads and `/api/stats` returns JSON

### 6. Optional — block API without session

If `/api/stats` still works without login, add a **separate** Access application with path `/api/stats` exactly (no trailing wildcard needed).

## Notes

- Access runs **at the edge** — no code changes required once configured
- PR previews on `*.pages.dev` are unaffected (different hostname)
- D1 backup and deploy workflows use API tokens, not browser Access

## Related

- Rate limiting: [`docs/CLOUDFLARE-RATE-LIMITS.md`](CLOUDFLARE-RATE-LIMITS.md)
- Engagement plan: [`docs/ENGAGEMENT-BUILD-PLAN.md`](ENGAGEMENT-BUILD-PLAN.md)
