# Phase i18n — bilingual implementation

Architecture: **Albanian at `/`**, **English at `/en/`**, paired via `translationKey` (legacy `translationOf` still supported).

## Shipped

| Item | Location |
|------|----------|
| Astro i18n routing | `astro.config.mjs` — `defaultLocale: sq`, EN prefix |
| `translationKey` schema | `src/content.config.ts` |
| Locale helpers | `src/lib/i18n.ts`, `src/lib/posts.ts`, `src/i18n/ui.ts` |
| EN route tree | `src/pages/en/*` (home, posts, category, tags, search, 404, RSS) |
| Self-referencing canonicals + hreflang | `PostLayout.astro`, `BaseLayout.astro` |
| `og:locale` / `og:locale:alternate` | `BaseLayout.astro` |
| Language switcher | `LanguageSwitcher.astro` (pair or category fallback) |
| Request translation | `RequestTranslation.astro` (Formspree; D1 later) |
| Pagefind lang filter | `data-pagefind-filter="lang:sq|en"` on layout |
| Sitemap hreflang | `scripts/build-i18n-map.mjs` → `src/data/i18n-map.json`, `@astrojs/sitemap` serialize |
| EN legacy 301s | `scripts/generate-en-redirects.mjs` — `/posts/{en-slug}/` → `/en/posts/{en-slug}/` |
| AI localize mode | `npm run generate:localize -- --localize <sq-slug>` |
| Pilot pair | `si-te-blej-bitcoin-ne-shqiperi` ↔ `buy-bitcoin-in-albania` (`buy-bitcoin-albania-2026`) |
| Welcome pair | `translationKey: welcome-duacrypto-news-2026` |

## Content rules

1. **Localize, don't translate** — own EN keyword, slug, EUR/USD, diaspora angle.
2. **One keyword = one post per language** — pair with `translationKey`, not duplicate slugs.
3. **SQ posts** — `lang: sq`, URL `/posts/{slug}/`.
4. **EN posts** — `lang: en`, URL `/en/posts/{slug}/`.

## Operator commands

```bash
npm run prebuild          # i18n map + EN redirects + md mirrors
npm run build
npm run validate:posts
npm run generate:localize -- --localize si-te-blej-bitcoin-ne-shqiperi "buy bitcoin in albania"
```

## Not yet (Phase 4)

- Italian / German locales
- Geo language banner (Cloudflare Functions)
- Request-translation → D1 demand log (Formspree interim)
- Shared Giscus by `translationKey`
- Full EN coverage of affiliate + pillar posts

## Related

- SEO Week 1 (live): `docs/SEO-IMPLEMENTATION.md`
- Architecture source: TokenDC `docs/NEWS-SUBDOMAIN-PLAN.md` (bilingual section)
