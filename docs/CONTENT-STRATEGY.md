# Content strategy — implementation status

Affiliate and scoring layer for news.duacrypto.com (see TokenDC `docs/NEWS-SUBDOMAIN-PLAN.md`).

## Done

| Item | Location |
|------|----------|
| Affiliate SSOT | `src/data/affiliates.ts` |
| Pretty redirects | `public/_redirects` → `/go/tangem`, `/go/bitget`, `/go/cex`, `/go/deeper`, `/go/newsletter` |
| Disclosure box | `src/components/AffiliateDisclosure.astro` (auto on `postType: affiliate`) |
| Newsletter soft CTA | `src/components/NewsletterCTA.astro` (end of affiliate posts) |
| `rel="sponsored"` on `/go/*` | `src/lib/rehype-affiliate-links.mjs` |
| Scoring frontmatter | `postType` + `scores` in `src/content.config.ts` |
| AI prompt profiles | `scripts/generate-post.mjs` |
| Albanian affiliate queue | `content-queue.yaml` + 5 posts in `src/content/posts/` |

## Operator steps (manual)

1. **GSC** — submit `https://news.duacrypto.com/sitemap-index.xml` (see TokenDC `docs/GSC-NEXT-STEPS.md`)
2. **AI cron** — `gh secret set ANTHROPIC_API_KEY -R dunksmaster/duacrypto-news`
3. **Telegram** — optional `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`

## Post score profiles

| postType | empathy | storytelling | cta |
|----------|---------|--------------|-----|
| affiliate | 80 | 70 | 60 |
| news | 60 | 50 | 30 |
| guide | 85 | 75 | 40 |
| community | 90 | 90 | 50 |

Scores are internal metadata (not rendered on page).
