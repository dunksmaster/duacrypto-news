#!/usr/bin/env node
/** Build posts manifest for oEmbed Function and embed routes. */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const postsDir = join(root, "src", "content", "posts");
const siteBase = "https://news.duacrypto.com";
const outShared = join(root, "functions", "_shared", "posts-manifest.json");
const DEFAULT_OG = "/img/duacrypto-logo.png";

function resolveOgImagePath(image, slug) {
  if (image && image !== DEFAULT_OG) return image;
  return `/og/${slug}.png`;
}

function slugFromFilename(name) {
  return name.replace(/\.md$/, "");
}

function postPath(slug, lang) {
  return lang === "en" ? `/en/posts/${slug}/` : `/posts/${slug}/`;
}

function embedPath(slug, lang) {
  return lang === "en" ? `/en/embed/${slug}/` : `/embed/${slug}/`;
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
  const canonical = `${siteBase}${postPath(slug, lang)}`;
  const ogImage = resolveOgImagePath(data.image, slug);
  const ogImageUrl = ogImage.startsWith("http") ? ogImage : `${siteBase}${ogImage}`;

  posts.push({
    slug,
    lang,
    title: data.title,
    description: data.description,
    category: data.category,
    canonical,
    embedUrl: `${siteBase}${embedPath(slug, lang)}`,
    thumbnail: ogImageUrl,
  });
}

mkdirSync(dirname(outShared), { recursive: true });
writeFileSync(outShared, JSON.stringify({ posts }, null, 2), "utf8");
console.log(`Wrote posts manifest (${posts.length} posts) → functions/_shared/posts-manifest.json`);
