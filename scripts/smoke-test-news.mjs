#!/usr/bin/env node
/**
 * Smoke-test news/catalog site + main-site blog redirects.
 * Usage: node scripts/smoke-test-news.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");

const checks = [
  // Catalog homepage + core routes
  { url: "https://dc-news-9n3.pages.dev/", expect: 200 },
  { url: "https://dc-news-9n3.pages.dev/books/", expect: 200 },
  { url: "https://dc-news-9n3.pages.dev/books/bitcoin-supercycle/", expect: 200 },
  { url: "https://dc-news-9n3.pages.dev/brands/", expect: 200 },
  { url: "https://dc-news-9n3.pages.dev/blog/", expect: 200 },
  { url: "https://dc-news-9n3.pages.dev/mining/", expect: 200 },
  // Legacy shop redirects
  {
    url: "https://dc-news-9n3.pages.dev/shop/bitcoin-supercycle/",
    expect: 301,
    location: "https://dc-news-9n3.pages.dev/books/bitcoin-supercycle/",
  },
  { url: "https://dc-news-9n3.pages.dev/shop/", expect: 301, location: "https://dc-news-9n3.pages.dev/" },
  // Posts unchanged
  { url: "https://dc-news-9n3.pages.dev/posts/bitcoin-pizza-day-2025/", expect: 200 },
  {
    url: "https://dc-news-9n3.pages.dev/posts/2026-07-09-portofol-harduerik-tangem-shqiptaret/",
    expect: 200,
  },
  { url: "https://dc-news-9n3.pages.dev/go/tangem", expect: 302, optional: true },
  // Main site blog redirects
  { url: "https://duacrypto.com/blog/index.html", expect: 301, location: "https://news.duacrypto.com/" },
  {
    url: "https://duacrypto.com/blog/bitcoin-pizza-day-2025.html",
    expect: 301,
    location: "https://news.duacrypto.com/posts/bitcoin-pizza-day-2025/",
  },
  // Production (optional — may lag deploy)
  { url: "https://news.duacrypto.com/", expect: 200, optional: true },
  { url: "https://news.duacrypto.com/books/", expect: 200, optional: true },
  { url: "https://news.duacrypto.com/blog/", expect: 200, optional: true },
  {
    url: "https://news.duacrypto.com/shop/bitcoin-supercycle/",
    expect: 301,
    location: "https://news.duacrypto.com/books/bitcoin-supercycle/",
    optional: true,
  },
  {
    url: "https://news.duacrypto.com/posts/2026-07-09-portofol-harduerik-tangem-shqiptaret/",
    expect: 200,
    optional: true,
  },
];

const localContentChecks = [
  {
    file: "index.html",
    needles: ["Independent · Not sponsored", "Libra më të vlerësuar", "NODE SHOWDOWN"],
  },
  {
    file: path.join("books", "the-genesis-book", "index.html"),
    needles: ["Autorësia", "share-row", "Authors"],
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

for (const { file, needles } of localContentChecks) {
  const fullPath = path.join(distDir, file);
  if (!fs.existsSync(fullPath)) {
    console.log(`SKIP (no dist) ${file}`);
    continue;
  }
  const html = fs.readFileSync(fullPath, "utf8");
  for (const needle of needles) {
    if (html.includes(needle)) {
      console.log(`OK  dist ${file} contains "${needle}"`);
    } else {
      failed += 1;
      console.log(`FAIL dist ${file} missing "${needle}"`);
    }
  }
}

if (failed) process.exit(1);
console.log("\nSmoke test passed.");
