# SEO master plan — implementation (Week 1)

Confirmed: **news.duacrypto.com uses `ai-train=yes`** (main site stays `ai-train=no`).

## Shipped

| Item | Location |
|------|----------|
| AI crawler robots + Content-Signal | `public/robots.txt`, `public/_headers` |
| llms.txt | `public/llms.txt` |
| Markdown mirrors | `public/md/posts/*.md` via `npm run generate:md-mirrors` (prebuild) |
| IndexNow | `scripts/ping-indexnow.mjs`, key at `public/994e8c5f....txt` |
| JSON-LD: Organization, BlogPosting, Breadcrumb, FAQ, HowTo | `src/lib/organization.ts`, post layout |
| Google Discover meta | `max-image-preview:large` in BaseLayout |
| Author page (E-E-A-T) | `/authors/dua/` |
| Keyword scoreboard | `docs/KEYWORDS.md` |
| Pillar posts (clusters 1, 4, 5) | `si-te-blej-bitcoin-ne-shqiperi`, legal, scams |
| AI generator SEO fields | `targetKeyword`, `directAnswer`, `faq` in prompt |

## Operator (manual)

- GSC: `docs/GSC-NEXT-STEPS.md` + weekly positions 8–20 from `docs/KEYWORDS.md`
- `gh secret set ANTHROPIC_API_KEY` for AI drafts
- Google News Publisher Center when ~20 news posts

## Phase 4 (later)

- AI crawler hit counter on stats dashboard
- Geo language banner (Cloudflare Functions)
