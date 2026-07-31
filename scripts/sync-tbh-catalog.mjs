#!/usr/bin/env node
/**
 * Sync The Bitcoin Hole database into src/data/catalog + public/catalog/img.
 * Source: vendor/thebitcoinhole-database (git submodule) or .tmp-thebitcoinhole-database.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const VENDOR = path.join(ROOT, "vendor", "thebitcoinhole-database");
const TMP = path.join(ROOT, ".tmp-thebitcoinhole-database");
const REPO = "https://github.com/thebitcoinhole/database.git";

const TBH_CATEGORIES = [
  "books",
  "hardware-wallets",
  "software-wallets",
  "bitcoin-nodes",
  "seed-backup",
  "inheritance",
];

const OUT_INDEX = path.join(ROOT, "src", "data", "catalog", "index.json");
const OUT_ITEMS = path.join(ROOT, "src", "data", "catalog", "items");
const OUT_BRANDS = path.join(ROOT, "src", "data", "catalog", "brands");
const OUT_IMG = path.join(ROOT, "public", "catalog", "img");

function resolveSource() {
  if (fs.existsSync(path.join(VENDOR, "item-types"))) return VENDOR;
  if (fs.existsSync(path.join(TMP, "item-types"))) return TMP;
  console.log("Cloning TBH database to vendor/thebitcoinhole-database …");
  fs.mkdirSync(path.dirname(VENDOR), { recursive: true });
  execSync(`git clone --depth 1 ${REPO} "${VENDOR}"`, { stdio: "inherit" });
  return VENDOR;
}

function rmDir(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function fieldValue(obj, key) {
  const node = obj?.[key];
  if (node == null) return undefined;
  if (typeof node === "object" && "value" in node) return node.value;
  return node;
}

function extractAuthor(item) {
  return (
    fieldValue(item.authorship, "authors") ??
    fieldValue(item.authorship, "author") ??
    fieldValue(item, "brand") ??
    ""
  );
}

function copyImage(srcDir, category, id, suffix) {
  const base = `${id}${suffix}`;
  for (const ext of [".webp", ".png"]) {
    const src = path.join(srcDir, `${base}${ext}`);
    if (!fs.existsSync(src)) continue;
    const dest = path.join(OUT_IMG, category, `${base}.webp`);
    ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);
    return `/catalog/img/${category}/${base}.webp`;
  }
  return null;
}

function syncBrands(source) {
  const brandsDir = path.join(source, "brands");
  rmDir(OUT_BRANDS);
  ensureDir(OUT_BRANDS);
  const brands = [];

  if (!fs.existsSync(brandsDir)) return brands;

  for (const file of fs.readdirSync(brandsDir).filter((f) => f.endsWith(".json"))) {
    const id = file.replace(/\.json$/, "");
    const raw = readJson(path.join(brandsDir, file));
    fs.writeFileSync(path.join(OUT_BRANDS, file), JSON.stringify(raw, null, 2));

    const logoDest = path.join(OUT_IMG, "brands", `${id}.webp`);
    const logoSrc = path.join(source, "brands", "img", `${id}.webp`);
    let logo = null;
    if (fs.existsSync(logoSrc)) {
      ensureDir(path.dirname(logoDest));
      fs.copyFileSync(logoSrc, logoDest);
      logo = `/catalog/img/brands/${id}.webp`;
    } else if (fs.existsSync(logoDest)) {
      // Keep logos fetched by scripts/fetch-brand-logos.mjs across catalog syncs
      logo = `/catalog/img/brands/${id}.webp`;
    }

    brands.push({
      id,
      name: fieldValue(raw, "brand") ?? id,
      headquarters: fieldValue(raw, "headquarters"),
      logo,
    });
  }

  brands.sort((a, b) => a.name.localeCompare(b.name));
  return brands;
}

function syncItems(source) {
  rmDir(OUT_ITEMS);
  ensureDir(OUT_ITEMS);
  const manifestItems = [];

  for (const category of TBH_CATEGORIES) {
    const itemsDir = path.join(source, "item-types", category, "items");
    const imgDir = path.join(source, "item-types", category, "img");
    if (!fs.existsSync(itemsDir)) continue;

    ensureDir(path.join(OUT_ITEMS, category));

    for (const file of fs.readdirSync(itemsDir).filter((f) => f.endsWith(".json"))) {
      const item = readJson(path.join(itemsDir, file));
      const id = item.id ?? file.replace(/\.json$/, "");

      fs.writeFileSync(
        path.join(OUT_ITEMS, category, `${id}.json`),
        JSON.stringify(item, null, 2),
      );

      const thumb = copyImage(imgDir, category, id, "-thumb");
      const image = copyImage(imgDir, category, id, "") ?? thumb;

      manifestItems.push({
        id,
        category,
        name: item.name ?? id,
        shortDescription: item["short-description"] ?? "",
        author: extractAuthor(item),
        thumb,
        image,
        purchasable: Boolean(item.purchasable),
        brand: fieldValue(item, "brand") ?? item.company ?? null,
      });
    }
  }

  return manifestItems;
}

function main() {
  const source = resolveSource();
  console.log(`Syncing TBH catalog from ${source}`);

  // Wipe product images only — preserve public/catalog/img/brands/ (fetched favicons)
  for (const category of TBH_CATEGORIES) {
    rmDir(path.join(OUT_IMG, category));
  }
  ensureDir(path.join(OUT_IMG, "brands"));

  const items = syncItems(source);
  const brands = syncBrands(source);

  const categoryCounts = {};
  for (const item of items) {
    categoryCounts[item.category] = (categoryCounts[item.category] ?? 0) + 1;
  }

  const categories = TBH_CATEGORIES.map((id) => {
    const sample = items.find((i) => i.category === id && i.thumb);
    return {
      id,
      count: categoryCounts[id] ?? 0,
      sampleThumb: sample?.thumb ?? null,
    };
  });

  const index = {
    syncedAt: new Date().toISOString(),
    source: "thebitcoinhole/database",
    categories,
    items,
    brands,
  };

  ensureDir(path.dirname(OUT_INDEX));
  fs.writeFileSync(OUT_INDEX, JSON.stringify(index, null, 2));

  console.log(
    `Synced ${items.length} items, ${brands.length} brands → src/data/catalog/index.json`,
  );
}

main();
