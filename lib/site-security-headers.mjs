/**
 * Cloudflare Pages `_headers` blocks for news.duacrypto.com.
 * Merged into public/_headers by scripts/generate-headers.mjs on every build.
 */

/** Site-wide security headers applied to all paths via `/*`. */
export function globalSecurityHeadersBlock() {
  const cspHeader =
    process.env.CSP_ENFORCE === "1"
      ? "Content-Security-Policy"
      : "Content-Security-Policy-Report-Only";

  const cspValue = [
    "default-src 'self';",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;",
    "style-src 'self' 'unsafe-inline';",
    "font-src 'self' data:;",
    "img-src 'self' data: https:;",
    "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://formspree.io;",
    "frame-src https://www.google.com;",
    "form-action 'self' https://formspree.io;",
    "base-uri 'self';",
    "object-src 'none';",
    "frame-ancestors 'none'",
  ].join(" ");

  return [
    "/*",
    "  X-Frame-Options: DENY",
    "  X-Content-Type-Options: nosniff",
    "  Referrer-Policy: strict-origin-when-cross-origin",
    "  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()",
    "  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload",
    "  Content-Signal: ai-train=yes, search=yes, ai-input=yes",
    `  ${cspHeader}: ${cspValue}`,
  ].join("\n");
}

/** Long-lived cache for static assets. */
export function staticCacheHeadersBlocks() {
  const cache = "  Cache-Control: public, max-age=31536000, immutable";
  return ["/img/*", "/_astro/*", "/pagefind/*", "/js/*"]
    .map((path) => `${path}\n${cache}`)
    .join("\n\n");
}

/** Markdown mirrors for AI crawlers (GEO). */
export function markdownMirrorBlock() {
  return [
    "/md/*",
    "  Content-Type: text/markdown; charset=utf-8",
    "  Content-Signal: ai-train=yes, search=yes, ai-input=yes",
  ].join("\n");
}

/** Full `_headers` file body. */
export function buildHeadersFile() {
  return [globalSecurityHeadersBlock(), "", staticCacheHeadersBlocks(), "", markdownMirrorBlock(), ""].join(
    "\n",
  );
}
