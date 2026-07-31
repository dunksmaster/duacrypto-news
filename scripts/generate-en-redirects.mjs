#!/usr/bin/env node
/** Append 301 redirects from legacy /posts/ EN URLs to /en/posts/ */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const postsDir = join(root, "src", "content", "posts");
const redirectsPath = join(root, "public", "_redirects");

function slugFromFilename(name) {
  return name.replace(/\.md$/, "");
}

const redirectLines = new Set();

for (const name of readdirSync(postsDir)) {
  if (!name.endsWith(".md")) continue;
  const raw = readFileSync(join(postsDir, name), "utf8");
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) continue;
  const data = parseYaml(fm[1]);
  if (data.draft) continue;
  const lang = data.lang === "sq" ? "sq" : "en";
  if (lang !== "en") continue;
  const slug = slugFromFilename(name);
  redirectLines.add(`/posts/${slug}/ /en/posts/${slug}/ 301`);
}

const SHOP_REDIRECTS = [
  "/shop/ / 301",
  "/shop/bitcoin-supercycle/ /books/bitcoin-supercycle/ 301",
  "/shop/category/books/ /books/ 301",
  "/shop/category/mining/ /mining/ 301",
  "/en/shop/ /en/ 301",
  "/en/shop/bitcoin-supercycle/ /en/books/bitcoin-supercycle/ 301",
  "/en/shop/category/books/ /en/books/ 301",
  "/en/shop/category/mining/ /en/mining/ 301",
];

for (const line of SHOP_REDIRECTS) {
  redirectLines.add(line);
}

writeFileSync(redirectsPath, [...redirectLines].sort().join("\n") + "\n", "utf8");
console.log(`Updated _redirects (${redirectLines.size} lines; /go/* handled by Functions)`);
