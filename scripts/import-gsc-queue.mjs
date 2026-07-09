#!/usr/bin/env node
/**
 * Import GSC queries (positions 8–20) into content-queue.yaml.
 *
 * Export from Search Console → Performance → Queries → Export,
 * save as data/gsc-export.json (see example file).
 *
 * Usage: node scripts/import-gsc-queue.mjs [path/to/gsc-export.json]
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const exportPath = process.argv[2] || join(root, "data", "gsc-export.json");
const queuePath = join(root, "content-queue.yaml");

if (!existsSync(exportPath)) {
  console.error("Missing", exportPath);
  console.error("Copy data/gsc-export.example.json and fill with GSC export rows.");
  process.exit(1);
}

const rows = JSON.parse(readFileSync(exportPath, "utf8"));
const queue = existsSync(queuePath)
  ? parseYaml(readFileSync(queuePath, "utf8"))
  : { topics: [] };

const existingTitles = new Set((queue.topics || []).map((t) => t.title?.toLowerCase()));
let added = 0;

for (const row of rows) {
  const query = (row.query || row.Query || "").trim();
  const position = Number(row.position ?? row.Position ?? 999);
  const impressions = Number(row.impressions ?? row.Impressions ?? 0);
  if (!query || position < 8 || position > 20 || impressions < 10) continue;

  const looksAlbanian = /[ëç]| shqi| kosov| kripto/i.test(query);
  const lang = looksAlbanian ? "sq" : "en";
  const title = `Strengthen: ${query} (GSC pos ${position})`;
  if (existingTitles.has(title.toLowerCase())) continue;

  queue.topics.push({
    title,
    category: "guides",
    postType: "guide",
    lang,
    targetKeyword: query,
    tags: ["gsc", "strengthen", lang],
    source: "gsc-import",
    gscPosition: position,
    gscImpressions: impressions,
  });
  existingTitles.add(title.toLowerCase());
  added += 1;
}

writeFileSync(queuePath, stringifyYaml(queue));
console.log(`Added ${added} topic(s) to ${queuePath}`);
