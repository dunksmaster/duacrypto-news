#!/usr/bin/env node
/** Generate public/_headers from lib/site-security-headers.mjs */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildHeadersFile } from "../lib/site-security-headers.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, "public", "_headers");

writeFileSync(outPath, buildHeadersFile(), "utf8");
console.log(`Wrote ${outPath} (CSP: ${process.env.CSP_ENFORCE === "1" ? "enforce" : "report-only"})`);
