# Rate limiting — views and likes APIs

## Application-level (deployed in code)

POST handlers for `/api/views/*` and `/api/likes/*` enforce **10 requests per minute per IP** using Cloudflare D1 table `rate_limits`.

Migration: [`migrations/0002_rate_limits.sql`](../migrations/0002_rate_limits.sql)

Apply to production (once, or on each deploy via CI):

```bash
npx wrangler d1 execute dc-news-analytics --remote --file=migrations/0002_rate_limits.sql
```

When exceeded, API returns **429** with `{ "error": "rate limit exceeded" }`.

## Edge-level (optional, Cloudflare dashboard)

For defense in depth, add a **Rate limiting rule** in Cloudflare:

1. **Security** → **WAF** → **Rate limiting rules** → **Create**
2. Rule name: `Limit engagement POSTs`
3. Expression:

```
(http.request.uri.path matches "^/api/(views|likes)/" and http.request.method eq "POST")
```

4. Characteristics: **IP**
5. Requests: **10** per **1 minute**
6. Action: **Block** (or Managed Challenge)

This complements D1 tracking; either layer can block abuse.

## Bot filtering

Views POST also skips known bot user-agents (`functions/_shared/validators.ts`). Likes POST uses rate limit only.
