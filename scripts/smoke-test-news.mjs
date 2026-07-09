#!/usr/bin/env node
/**
 * Smoke-test news site + main-site blog redirects.
 * Usage: node scripts/smoke-test-news.mjs
 */
const checks = [
  { url: "https://dc-news-9n3.pages.dev/", expect: 200 },
  { url: "https://dc-news-9n3.pages.dev/posts/bitcoin-pizza-day-2025/", expect: 200 },
  {
    url: "https://dc-news-9n3.pages.dev/posts/2026-07-09-portofol-harduerik-tangem-shqiptaret/",
    expect: 200,
  },
  { url: "https://news.duacrypto.com/go/tangem", expect: 302, optional: true },
  { url: "https://duacrypto.com/blog/index.html", expect: 301, location: "https://news.duacrypto.com/" },
  {
    url: "https://duacrypto.com/blog/bitcoin-pizza-day-2025.html",
    expect: 301,
    location: "https://news.duacrypto.com/posts/bitcoin-pizza-day-2025/",
  },
  { url: "https://news.duacrypto.com/", expect: 200, optional: true },
  {
    url: "https://news.duacrypto.com/posts/2026-07-09-portofol-harduerik-tangem-shqiptaret/",
    expect: 200,
    optional: true,
  },
];

let failed = 0;

for (const { url, expect, location, optional } of checks) {
  try {
    const res = await fetch(url, { redirect: "manual" });
    const ok = res.status === expect;
    const locOk = !location || res.headers.get("location") === location;
    if (ok && locOk) {
      console.log(`OK  ${expect} ${url}`);
    } else if (optional && res.status !== expect) {
      console.log(`SKIP (optional) ${url} -> ${res.status}`);
    } else {
      failed += 1;
      console.log(
        `FAIL ${url} -> ${res.status} (expected ${expect}) loc=${res.headers.get("location")}`,
      );
    }
  } catch (err) {
    if (optional) {
      console.log(`SKIP (optional) ${url} — ${err.message}`);
    } else {
      failed += 1;
      console.log(`FAIL ${url} — ${err.message}`);
    }
  }
}

if (failed) process.exit(1);
console.log("\nSmoke test passed.");
