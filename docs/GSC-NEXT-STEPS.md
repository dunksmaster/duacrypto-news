# Google Search Console — operator checklist

Automated preflight (run from TokenDC): `npm run verify:gsc-preflight`

## Main site (`https://duacrypto.com`)

1. Add/verify property in [Google Search Console](https://search.google.com/search-console)
2. Submit sitemap: `https://duacrypto.com/sitemap.xml`
3. Request indexing for:
   - `https://duacrypto.com/newsletter.html`
   - `https://duacrypto.com/events.html`

## News site (`https://news.duacrypto.com`)

1. Add URL-prefix or domain property for `https://news.duacrypto.com`
2. Verify via DNS (Cloudflare) or HTML tag
3. Submit sitemap: `https://news.duacrypto.com/sitemap-index.xml`
4. Request indexing for first affiliate posts:
   - `/posts/2026-07-09-portofol-harduerik-tangem-shqiptaret/`
   - `/posts/2026-07-09-bitget-regjistrim-shqiperi-kosove/`
   - `/posts/2026-07-09-cex-io-blerje-bitcoin-karte-ballkan/`

Google no longer accepts automated sitemap ping — submission must be done in the GSC UI.

## Done when

Both sitemaps show **Success** in GSC and key URLs are indexed or “Discovered”.
