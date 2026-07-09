#!/usr/bin/env node
/** Copy affiliate map for Cloudflare Pages Functions (/go/* click tracking). */
import { copyFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src", "data", "affiliates.json");
const outDir = join(root, "functions", "_shared");
const out = join(outDir, "affiliates.json");

mkdirSync(outDir, { recursive: true });
copyFileSync(src, out);
console.log(`Synced affiliates.json → functions/_shared/`);
