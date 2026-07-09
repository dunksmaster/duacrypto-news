# DuaCrypto News — news.duacrypto.com

Astro content site for DuaCrypto news, guides, and community stories.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:4321

## Build

```bash
npm run build
npm run preview
```

## Deploy (Cloudflare Pages)

1. Create GitHub repo `duacrypto-news` and push this project.
2. Reuse TokenDC secrets: `CLOUDFLARE_PAGES_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
3. GitHub Actions deploys to Cloudflare Pages project **`dc-news`** on push to `main`.
4. In Cloudflare Pages → **dc-news** → Custom domains → add **`news.duacrypto.com`**.

## Content

Posts live in `src/content/posts/*.md` with validated frontmatter (see `src/content.config.ts`).

- `npm run fix:draft` — validate all posts against schema
- `npm run generate:post -- "Topic here"` — AI draft (local, requires `ANTHROPIC_API_KEY`)

## AI publishing

- **Cron:** `.github/workflows/ai-draft-post.yml` opens draft PRs Mon/Wed/Fri.
- **Interactive:** Claude Code in this repo — write markdown, review, push.
- Merging a PR to `main` auto-deploys via GitHub Actions.

## Seed posts

Migrated from TokenDC `public/md/blog/` (6 posts, July 2026).
