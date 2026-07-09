#!/usr/bin/env node
/** Generate 1200×630 OG PNGs for posts without custom hero images. */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { Resvg } from "@resvg/resvg-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const postsDir = join(root, "src", "content", "posts");
const outDir = join(root, "public", "og");
const site = JSON.parse(readFileSync(join(root, "src", "data", "site.json"), "utf8"));

mkdirSync(outDir, { recursive: true });

function slugFromFilename(name) {
  return name.replace(/\.md$/, "");
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapTitle(title, maxLen = 72) {
  const words = title.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxLen && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function buildSvg({ title, category, lang }) {
  const categoryLabel = site.categoryLabels[category] ?? category;
  const titleLines = wrapTitle(title);
  const titleTspans = titleLines
    .map((line, i) => `<tspan x="80" dy="${i === 0 ? 0 : 52}">${escapeXml(line)}</tspan>`)
    .join("");
  const langLabel = lang === "sq" ? "DuaCrypto News · SQ" : "DuaCrypto News · EN";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#1e3a5f"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="540" width="1200" height="90" fill="#f7931a" opacity="0.95"/>
  <text x="80" y="100" fill="#f7931a" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="700">${escapeXml(langLabel)}</text>
  <text x="80" y="140" fill="#94a3b8" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="600">${escapeXml(categoryLabel)}</text>
  <text x="80" y="240" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="52" font-weight="700">${titleTspans}</text>
  <text x="80" y="590" fill="#0f172a" font-family="Segoe UI, Arial, sans-serif" font-size="26" font-weight="700">news.duacrypto.com</text>
</svg>`;
}

let count = 0;
for (const name of readdirSync(postsDir)) {
  if (!name.endsWith(".md")) continue;
  const raw = readFileSync(join(postsDir, name), "utf8");
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) continue;
  const data = parseYaml(fm[1]);
  if (data.draft) continue;

  const slug = slugFromFilename(name);
  const lang = data.lang === "sq" ? "sq" : "en";
  const svg = buildSvg({
    title: data.title,
    category: data.category,
    lang,
  });
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
  const png = resvg.render().asPng();
  writeFileSync(join(outDir, `${slug}.png`), png);
  count += 1;
}

console.log(`Generated ${count} OG image(s) in public/og/`);
