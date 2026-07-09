# Keyword scoreboard — DuaCrypto News

Living tracker: keyword → target post → GSC position → next action.

Update weekly from [Google Search Console](https://search.google.com/search-console) Performance tab.  
Focus: keywords ranking **position 8–20** — strengthen those posts first (add section, internal links, FAQ).

## Priority clusters

| Priority | Keyword (sq) | Target post | Affiliate / goal | Position | Next action |
|----------|--------------|-------------|------------------|----------|-------------|
| 1 | si të blej bitcoin në shqipëri | [/posts/si-te-blej-bitcoin-ne-shqiperi/](/posts/si-te-blej-bitcoin-ne-shqiperi/) | Bitget, CEX | — | Submit GSC; add 2 internal links from older posts |
| 1 | si të blej bitcoin në kosovë | same pillar | Bitget | — | Add Kosovë H2 if GSC shows impressions |
| 2 | portofol harduerik | [/posts/2026-07-09-portofol-harduerik-tangem-shqiptaret/](/posts/2026-07-09-portofol-harduerik-tangem-shqiptaret/) | Tangem | — | Link from self-custody EN post ✓ |
| 2 | tangem shqip | Tangem post | Tangem | — | Monitor after indexing |
| 3 | kriptovaluta shqip / lajme kripto shqip | homepage + `/category/news/` | brand | — | Category copy in sq |
| 4 | a është bitcoin i ligjshëm në shqipëri | [/posts/a-eshte-bitcoin-i-ligjshem-ne-shqiperi/](/posts/a-eshte-bitcoin-i-ligjshem-ne-shqiperi/) | trust | — | Request indexing |
| 5 | si të njoh mashtrimet kripto / scam kripto | [/posts/si-te-njoh-mashtrimet-kripto/](/posts/si-te-njoh-mashtrimet-kripto/) | trust → guides | — | Link from Bitget/CEX posts |
| EN | buy bitcoin in albania | future `/en/` tree | diaspora | — | Phase i18n |

## Weekly GSC routine

1. Performance → filter **news.duacrypto.com** → last 28 days.
2. Export queries with position 8–20 and impressions > 10.
3. For each: open target post, add 1 paragraph + 1 internal link + FAQ item if missing.
4. Request indexing for updated URL in GSC.

## Rules (from SEO master plan)

- **One keyword = one post = one URL** — no cannibalization.
- Keyword in: title (front-loaded), H1, slug, first 100 words, one H2, image alt.
- Every new post: link to 2–3 old posts; add backlink from 1 older post.
- Answer block: 2–3 sentence `directAnswer` in frontmatter (GEO / AI citation).

## IndexNow

Key file: `https://news.duacrypto.com/994e8c5f3b2a1d0e7c6b9a8f4e3d2c1b.txt`  
Ping on deploy: `npm run ping:indexnow`
