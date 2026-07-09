#!/usr/bin/env node
/**
 * Post-build: markdown mirrors at public/md/posts/*.md for AI crawlers.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const postsDir = join(root, "src", "content", "posts");
const outDir = join(root, "public", "md", "posts");
const site = "https://news.duacrypto.com";

mkdirSync(outDir, { recursive: true });

function slugFromFilename(name) {
  return name.replace(/\.md$/, "");
}

let count = 0;
for (const name of readdirSync(postsDir)) {
  if (!name.endsWith(".md")) continue;
  const raw = readFileSync(join(postsDir, name), "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) continue;
  const data = parseYaml(match[1]);
  if (data.draft) continue;

  const slug = slugFromFilename(name);
  const body = match[2].trim();
  const canonical = `${site}/posts/${slug}/`;
  const mdMirror = `---
title: ${JSON.stringify(data.title)}
description: ${JSON.stringify(data.description)}
source: ${JSON.stringify(canonical)}
lang: ${JSON.stringify(data.lang ?? "en")}
targetKeyword: ${JSON.stringify(data.targetKeyword ?? "")}
pubDate: ${JSON.stringify(String(data.pubDate).slice(0, 10))}
---

${body}
`;
  writeFileSync(join(outDir, `${slug}.md`), mdMirror, "utf8");
  count += 1;
}

console.log(`Generated ${count} markdown mirror(s) in public/md/posts/`);
