#!/usr/bin/env node
/**
 * Ping IndexNow (Bing/Yandex) with all published post URLs.
 * Key file must exist at https://news.duacrypto.com/{key}.txt
 *
 * Usage: node scripts/ping-indexnow.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const KEY = "994e8c5f3b2a1d0e7c6b9a8f4e3d2c1b";
const HOST = "news.duacrypto.com";
const SITE = `https://${HOST}`;

const postsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "content", "posts");

const urls = [`${SITE}/`, `${SITE}/sitemap-index.xml`, `${SITE}/rss.xml`, `${SITE}/llms.txt`];

for (const name of readdirSync(postsDir)) {
  if (!name.endsWith(".md")) continue;
  const raw = readFileSync(join(postsDir, name), "utf8");
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) continue;
  const data = parseYaml(fm[1]);
  if (data.draft) continue;
  const slug = name.replace(/\.md$/, "");
  urls.push(`${SITE}/posts/${slug}/`);
  urls.push(`${SITE}/md/posts/${slug}.md`);
}

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: `${SITE}/${KEY}.txt`,
  urlList: urls,
};

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});

if (res.ok || res.status === 202) {
  console.log(`IndexNow OK (${res.status}): ${urls.length} URL(s)`);
} else {
  const text = await res.text();
  console.warn(`IndexNow ${res.status}: ${text}`);
  process.exit(0);
}
