# Deploy dc-news to news.duacrypto.com

## One-time setup

1. Push repo to GitHub as `duacrypto-news` (or under your org).
2. Add GitHub secrets (same as TokenDC):
   - `CLOUDFLARE_PAGES_API_TOKEN` — Account → Cloudflare Pages → Edit
   - `CLOUDFLARE_ACCOUNT_ID`
3. Push to `main` — workflow creates/deploys project **dc-news**.
4. Cloudflare dashboard → Workers & Pages → **dc-news** → Custom domains → **news.duacrypto.com**.
5. TokenDC main site: deploy redirect rules in `public/_redirects` (see TokenDC PR).

## Verify

```bash
curl -I https://news.duacrypto.com/
curl -I https://duacrypto.com/blog/index.html   # should 301 to news
```

## Rollback

Revert the merge commit on `main` or `git revert` the post file — redeploys automatically.
