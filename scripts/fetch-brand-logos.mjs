#!/usr/bin/env node
/**
 * Fetch missing brand logos from each brand's website (favicon / touch icon).
 * Saves to public/catalog/img/brands/{id}.webp and updates index.json.
 *
 * One-off / manual run — not wired into prebuild (avoid network on every build).
 *
 * Usage: node scripts/fetch-brand-logos.mjs [--force] [--id=brand-id]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { Resvg } from "@resvg/resvg-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BRANDS_DIR = path.join(ROOT, "src", "data", "catalog", "brands");
const INDEX_PATH = path.join(ROOT, "src", "data", "catalog", "index.json");
const OUT_DIR = path.join(ROOT, "public", "catalog", "img", "brands");
const WORDMARK_FALLBACK_PATH = path.join(
  ROOT,
  "src",
  "data",
  "catalog",
  "brand-logo-wordmark-fallback.json",
);

const UA = "DuaCrypto-BrandLogoFetcher/1.0 (+https://news.duacrypto.com)";
const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyId =
  args.find((a) => a.startsWith("--id="))?.split("=")[1] ??
  (args.includes("--id") ? args[args.indexOf("--id") + 1] : undefined);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function normalizeUrl(raw) {
  if (!raw) return null;
  try {
    return new URL(raw).href;
  } catch {
    try {
      return new URL(`https://${raw}`).href;
    } catch {
      return null;
    }
  }
}

function extractIconHrefs(html, pageUrl) {
  const hrefs = [];
  const linkRe = /<link\b[^>]*>/gi;
  for (const tag of html.match(linkRe) ?? []) {
    const rel = (tag.match(/\brel=["']([^"']+)["']/i)?.[1] ?? "").toLowerCase();
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
    if (!href) continue;
    const isIcon =
      rel.includes("icon") ||
      rel.includes("apple-touch-icon") ||
      rel.includes("mask-icon") ||
      rel.includes("shortcut icon");
    if (!isIcon) continue;
    try {
      hrefs.push(new URL(href, pageUrl).href);
    } catch {
      /* skip bad href */
    }
  }
  return hrefs;
}

async function fetchBuffer(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const isGoogleFavicon = url.includes("google.com/s2/favicons");
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": UA, Accept: "image/*,*/*;q=0.8" },
      redirect: "follow",
    });
    if (!res.ok && !(isGoogleFavicon && res.status === 404)) return null;
    const type = res.headers.get("content-type") ?? "";
    if (type.includes("text/html")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 80) return null;
    return buf;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function discoverIconUrls(websiteUrl, raw = {}) {
  const origin = new URL(websiteUrl).origin;
  const candidates = [
    `${origin}/apple-touch-icon.png`,
    `${origin}/apple-touch-icon-precomposed.png`,
    `${origin}/favicon.svg`,
    `${origin}/favicon.png`,
    `${origin}/favicon.ico`,
  ];

  const githubUrl = normalizeUrl(raw.github?.url);
  if (githubUrl) {
    try {
      const host = new URL(githubUrl).hostname;
      candidates.push(
        `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`,
      );
      const org = githubUrl.match(/github\.com\/([^/?#]+)/)?.[1];
      if (org) {
        candidates.push(`https://github.com/${org}.png?size=128`);
      }
    } catch {
      /* ignore */
    }
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(websiteUrl, {
      signal: controller.signal,
      headers: { "User-Agent": UA, Accept: "text/html" },
      redirect: "follow",
    });
    clearTimeout(timer);
    if (res.ok) {
      const html = await res.text();
      candidates.unshift(...extractIconHrefs(html, res.url));
    }
  } catch {
    /* HTML parse optional */
  }

  try {
    const domain = new URL(websiteUrl).hostname;
    candidates.push(
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`,
    );
  } catch {
    /* ignore */
  }

  return [...new Set(candidates)];
}

async function fetchBrandIcon(websiteUrl, raw = {}) {
  const candidates = await discoverIconUrls(websiteUrl, raw);
  /** @type {{ buf: Buffer, source: string } | null} */
  let fallback = null;

  for (const url of candidates) {
    const buf = await fetchBuffer(url);
    if (!buf) continue;

    try {
      const meta = await sharp(buf, { failOn: "none" }).metadata();
      if (meta.width && meta.height && meta.format) {
        return { buf, source: url };
      }
    } catch {
      /* try next */
    }

    if (!fallback && buf.length >= 80) {
      fallback = { buf, source: url };
    }
  }

  return fallback;
}

async function saveLogo(id, buf, sourceUrl = "") {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, `${id}.webp`);

  let input = buf;
  const head = buf.subarray(0, 512).toString("utf8").trimStart();
  const isSvg =
    sourceUrl.endsWith(".svg") ||
    head.startsWith("<svg") ||
    (head.startsWith("<?xml") && head.includes("<svg"));

  if (isSvg) {
    input = new Resvg(buf.toString("utf8"), {
      fitTo: { mode: "width", value: 256 },
    }).render().asPng();
  }

  await sharp(input, { failOn: "none" })
    .resize(128, 128, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .webp({ quality: 88 })
    .toFile(outPath);
  return `/catalog/img/brands/${id}.webp`;
}

async function auditWordmarkFallbacks() {
  const index = readJson(INDEX_PATH);
  const ids = [];
  for (const brand of index.brands ?? []) {
    if (!brand.logo) continue;
    const fp = path.join(ROOT, "public", brand.logo.replace(/^\//, ""));
    if (!fs.existsSync(fp)) continue;
    try {
      const { data, info } = await sharp(fp).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      let lum = 0;
      let n = 0;
      for (let i = 0; i < data.length; i += info.channels) {
        if (data[i + 3] < 40) continue;
        lum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        n += 1;
      }
      const cov = n / (info.width * info.height);
      const avg = n ? lum / n : 0;
      if (avg > 160 && cov > 0.05) ids.push(brand.id);
    } catch {
      /* skip unreadable assets */
    }
  }
  ids.sort();
  writeJson(WORDMARK_FALLBACK_PATH, ids);
  console.log(`Wordmark fallbacks: ${ids.length} (light logos on white plaque)`);
}

async function main() {
  const index = readJson(INDEX_PATH);
  const brands = index.brands ?? [];
  const results = { ok: [], skipped: [], failed: [] };

  const targets = brands.filter((b) => {
    if (onlyId && b.id !== onlyId) return false;
    if (force) return true;
    return !b.logo;
  });

  console.log(`Fetching logos for ${targets.length} brand(s)…\n`);

  for (const brand of targets) {
    const jsonPath = path.join(BRANDS_DIR, `${brand.id}.json`);
    if (!fs.existsSync(jsonPath)) {
      results.failed.push({ id: brand.id, reason: "missing brand JSON" });
      continue;
    }

    const raw = readJson(jsonPath);
    const websiteUrl = normalizeUrl(raw.website?.url);
    if (!websiteUrl) {
      results.failed.push({ id: brand.id, reason: "no website.url" });
      continue;
    }

    process.stdout.write(`${brand.id} … `);
    const fetched = await fetchBrandIcon(websiteUrl, raw);
    if (!fetched) {
      console.log("FAIL");
      results.failed.push({ id: brand.id, reason: "no favicon found", url: websiteUrl });
      await sleep(400);
      continue;
    }

    try {
      const logoPath = await saveLogo(brand.id, fetched.buf, fetched.source);
      brand.logo = logoPath;
      console.log(`OK (${fetched.source})`);
      results.ok.push({ id: brand.id, logo: logoPath, source: fetched.source });
    } catch (err) {
      console.log("FAIL (sharp)");
      results.failed.push({
        id: brand.id,
        reason: err instanceof Error ? err.message : "save failed",
        url: websiteUrl,
      });
    }

    await sleep(500);
  }

  writeJson(INDEX_PATH, index);

  const withLogo = brands.filter((b) => b.logo).length;
  console.log("\n--- Summary ---");
  console.log(`Success: ${results.ok.length}`);
  console.log(`Failed:  ${results.failed.length}`);
  console.log(`Logos in index: ${withLogo}/${brands.length}`);

  if (results.ok.length) {
    console.log("\nFetched:");
    for (const r of results.ok) console.log(`  ✓ ${r.id}`);
  }
  if (results.failed.length) {
    console.log("\nFailed (need manual logo):");
    for (const r of results.failed) console.log(`  ✗ ${r.id} — ${r.reason}`);
  }

  await auditWordmarkFallbacks();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
