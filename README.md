# DuaCrypto — news.duacrypto.com

Astro site for **Bitcoin self-custody catalog** (TBH-style) plus DuaCrypto blog, guides, and community stories.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:4321

**Search:** Pagefind runs after build. To test search locally:

```bash
npm run build
npm run preview
```

Then open `/search/` or `/en/search/`. In plain `astro dev`, the search page shows a hint that build is required.

## Build

```bash
npm run build
npm run preview
```

`prebuild` syncs the [The Bitcoin Hole database](https://github.com/thebitcoinhole/database) (MIT) into `src/data/catalog/` and `public/catalog/img/`.

### TBH database source

The sync script ([scripts/sync-tbh-catalog.mjs](scripts/sync-tbh-catalog.mjs)) resolves data in this order:

1. `vendor/thebitcoinhole-database/` (git submodule — recommended for CI)
2. `.tmp-thebitcoinhole-database/` (local clone)
3. Shallow clone into `vendor/` during prebuild (requires network)

To pin the database as a submodule:

```bash
git submodule add https://github.com/thebitcoinhole/database.git vendor/thebitcoinhole-database
git submodule update --init --recursive
```

## Deploy (Cloudflare Pages)

1. Push to GitHub `main`.
2. GitHub Actions deploys to Cloudflare Pages project **`dc-news`**.
3. Custom domain: **`news.duacrypto.com`**.

## Content

- **Catalog:** synced from TBH database + [src/data/catalog/custom.json](src/data/catalog/custom.json) (mining category, affiliate buy links)
- **Blog posts:** `src/content/posts/*.md` — URLs stay at `/posts/[slug]/`

- `npm run validate:posts` — validate posts against schema
- `npm run generate:post -- "Topic here"` — AI draft (requires `ANTHROPIC_API_KEY`)
- `npm run smoke` — HTTP smoke tests for catalog + blog routes

## Site structure

| Path | Purpose |
|------|---------|
| `/` | Catalog homepage |
| `/books/`, `/hardware-wallets/`, … | TBH categories |
| `/mining/` | Custom mining devices (Telegram CTA) |
| `/brands/` | Brand index |
| `/blog/` | All blog posts |
| `/posts/[slug]/` | Individual posts (unchanged) |

Product data attribution: [The Bitcoin Hole](https://thebitcoinhole.com/) (MIT).
