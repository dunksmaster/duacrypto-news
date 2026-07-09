#!/usr/bin/env node
/**
 * Quick Lighthouse mobile check on built dist (requires prior `npm run build`).
 * Usage: node scripts/lighthouse-mobile.mjs [url]
 * Default: http://127.0.0.1:4321/posts/2026-07-09-cex-io-blerje-bitcoin-karte-ballkan/
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dist = join(root, "dist");
const MIN_PERF = Number(process.env.LH_MIN_PERF ?? 90);
const MIN_A11Y = Number(process.env.LH_MIN_A11Y ?? 90);

const targetPath =
  process.argv[2] ?? "/posts/2026-07-09-cex-io-blerje-bitcoin-karte-ballkan/";

function mime(path) {
  if (path.endsWith(".html")) return "text/html";
  if (path.endsWith(".css")) return "text/css";
  if (path.endsWith(".js")) return "application/javascript";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".xml")) return "application/xml";
  if (path.endsWith(".json")) return "application/json";
  return "application/octet-stream";
}

function startStaticServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let path = req.url?.split("?")[0] ?? "/";
      if (path.endsWith("/")) path += "index.html";
      if (path === "/index.html" && !existsSync(join(dist, "index.html"))) {
        path = "/404.html";
      }
      const file = join(dist, path.replace(/^\//, ""));
      if (!existsSync(file) || !file.startsWith(dist)) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, { "Content-Type": mime(file) });
      res.end(readFileSync(file));
    });
    server.listen(4321, "127.0.0.1", () => resolve(server));
  });
}

function runLighthouse(url) {
  return new Promise((resolve, reject) => {
    const args = [
      url,
      "--quiet",
      "--chrome-flags=--headless",
      "--only-categories=performance,accessibility",
      "--form-factor=mobile",
      "--output=json",
      "--output-path=stdout",
    ];
    const child = spawn("npx", ["lighthouse", ...args], {
      stdio: ["ignore", "pipe", "inherit"],
      shell: true,
    });
    let out = "";
    child.stdout.on("data", (chunk) => {
      out += chunk;
    });
    child.on("close", (code) => {
      if (code !== 0) reject(new Error(`lighthouse exited ${code}`));
      else resolve(JSON.parse(out));
    });
  });
}

if (!existsSync(dist)) {
  console.error("dist/ missing — run npm run build first");
  process.exit(1);
}

const server = await startStaticServer();
const url = `http://127.0.0.1:4321${targetPath.startsWith("/") ? targetPath : `/${targetPath}`}`;

try {
  console.log(`Lighthouse mobile → ${url}`);
  const report = await runLighthouse(url);
  const perf = Math.round((report.categories.performance?.score ?? 0) * 100);
  const a11y = Math.round((report.categories.accessibility?.score ?? 0) * 100);
  const cls = report.audits["cumulative-layout-shift"]?.displayValue ?? "n/a";

  console.log(`Performance: ${perf} (min ${MIN_PERF})`);
  console.log(`Accessibility: ${a11y} (min ${MIN_A11Y})`);
  console.log(`CLS: ${cls}`);

  let failed = 0;
  if (perf < MIN_PERF) {
    failed += 1;
    console.error(`FAIL performance ${perf} < ${MIN_PERF}`);
  }
  if (a11y < MIN_A11Y) {
    failed += 1;
    console.error(`FAIL accessibility ${a11y} < ${MIN_A11Y}`);
  }
  if (failed) process.exit(1);
  console.log("Lighthouse mobile check passed.");
} finally {
  server.close();
}
