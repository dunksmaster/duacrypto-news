#!/usr/bin/env node
/** Build translation pair map for sitemap hreflang alternates */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const postsDir = join(root, "src", "content", "posts");
const outPath = join(root, "src", "data", "i18n-map.json");

function slugFromFilename(name) {
  return name.replace(/\.md$/, "");
}

const posts = [];
for (const name of readdirSync(postsDir)) {
  if (!name.endsWith(".md")) continue;
  const raw = readFileSync(join(postsDir, name), "utf8");
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) continue;
  const data = parseYaml(fm[1]);
  if (data.draft) continue;
  const slug = slugFromFilename(name);
  const lang = data.lang === "sq" ? "sq" : "en";
  const path = lang === "en" ? `/en/posts/${slug}/` : `/posts/${slug}/`;
  posts.push({
    slug,
    lang,
    path,
    translationKey: data.translationKey ?? null,
    translationOf: data.translationOf ?? null,
  });
}

const byKey = new Map();
for (const p of posts) {
  if (p.translationKey) {
    if (!byKey.has(p.translationKey)) byKey.set(p.translationKey, []);
    byKey.get(p.translationKey).push(p);
  }
}

const alternates = {};
for (const [, group] of byKey) {
  if (group.length < 2) continue;
  for (const p of group) {
    alternates[p.path] = group.map((g) => ({
      href: `https://news.duacrypto.com${g.path}`,
      hreflang: g.lang,
    }));
  }
}

// Legacy translationOf pairs
for (const p of posts) {
  if (p.translationOf) {
    const en = posts.find((x) => x.slug === p.translationOf);
    if (en) {
      alternates[p.path] = [
        { href: `https://news.duacrypto.com${p.path}`, hreflang: p.lang },
        { href: `https://news.duacrypto.com${en.path}`, hreflang: en.lang },
      ];
      alternates[en.path] = alternates[p.path];
    }
  }
}

writeFileSync(outPath, JSON.stringify({ alternates }, null, 2), "utf8");
console.log(`Wrote i18n-map with ${Object.keys(alternates).length} alternate sets`);
