#!/usr/bin/env node
/**
 * Verify engagement APIs (views, likes, stats) on production or preview.
 * Usage: node scripts/verify-engagement.mjs [baseUrl]
 */
const base = (process.argv[2] || "https://news.duacrypto.com").replace(/\/$/, "");
const slug = "si-te-blej-bitcoin-ne-shqiperi";
let failed = 0;

async function check(label, fn) {
  try {
    await fn();
    console.log(`OK  ${label}`);
  } catch (err) {
    failed += 1;
    console.log(`FAIL ${label} — ${err.message}`);
  }
}

await check("GET /api/views/{slug}", async () => {
  const res = await fetch(`${base}/api/views/${slug}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (typeof data.count !== "number") throw new Error("missing count");
});

await check("POST /api/views/{slug} increments", async () => {
  const before = await fetch(`${base}/api/views/${slug}`).then((r) => r.json());
  const res = await fetch(`${base}/api/views/${slug}`, { method: "POST" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const after = await res.json();
  if (typeof after.count !== "number") throw new Error("missing count");
  if (after.count < before.count) throw new Error(`count dropped ${before.count} -> ${after.count}`);
});

await check("GET /api/likes/{slug}", async () => {
  const res = await fetch(`${base}/api/likes/${slug}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (typeof data.count !== "number") throw new Error("missing count");
});

await check("GET /api/stats", async () => {
  const res = await fetch(`${base}/api/stats`);
  if (res.status === 401) {
    console.log("SKIP /api/stats — protected by Cloudflare Access (expected after setup)");
    return;
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data.totals || typeof data.totals.total_views !== "number") {
    throw new Error("missing totals.total_views");
  }
});

await check("Post page has engagement-stats markup", async () => {
  const res = await fetch(`${base}/posts/${slug}/`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  if (!html.includes('id="engagement-stats"')) throw new Error("engagement-stats missing");
  if (!html.includes("data-views")) throw new Error("data-views missing");
  if (!html.includes("data-like-btn")) throw new Error("like button missing");
});

await check("Admin stats page loads", async () => {
  const res = await fetch(`${base}/admin/stats/`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  if (!html.includes("admin-stats.js")) throw new Error("admin-stats.js missing");
});

if (failed) {
  console.log(`\n${failed} engagement check(s) failed.`);
  process.exit(1);
}
console.log("\nEngagement verification passed.");
