#!/usr/bin/env node
/**
 * Publish new posts to Nostr relays (kind 1 notes).
 *
 * Usage:
 *   NOSTR_NSEC=nsec1... node scripts/publish-nostr.mjs
 *   NOSTR_NSEC=nsec1... node scripts/publish-nostr.mjs --slug my-post-slug
 *
 * Updates src/data/nostr-events.json with event IDs.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { finalizeEvent, getPublicKey, Relay } from "nostr-tools";
import { decode } from "nostr-tools/nip19";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const postsDir = join(root, "src", "content", "posts");
const eventsPath = join(root, "src", "data", "nostr-events.json");
const site = JSON.parse(readFileSync(join(root, "src", "data", "site.json"), "utf8"));

function loadEvents() {
  try {
    return JSON.parse(readFileSync(eventsPath, "utf8"));
  } catch {
    return {};
  }
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  return parseYaml(match[1]);
}

function listPosts() {
  return readdirSync(postsDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const meta = parseFrontmatter(readFileSync(join(postsDir, f), "utf8"));
      return { slug, meta };
    })
    .filter((p) => p.meta && !p.meta.draft);
}

async function publishNote(sk, content, relays) {
  const event = finalizeEvent(
    {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [["t", "duacrypto"], ["t", "bitcoin"]],
      content,
    },
    sk,
  );

  const results = [];
  for (const url of relays) {
    const relay = await Relay.connect(url);
    try {
      await relay.publish(event);
      results.push({ url, ok: true });
    } catch (err) {
      results.push({ url, ok: false, error: err.message });
    } finally {
      relay.close();
    }
  }
  return { event, results };
}

const slugArg = process.argv.includes("--slug") ? process.argv[process.argv.indexOf("--slug") + 1] : null;
const nsec = process.env.NOSTR_NSEC;
if (!nsec) {
  console.error("NOSTR_NSEC is required (nsec1... bech32 key)");
  process.exit(1);
}

let sk;
try {
  sk = decode(nsec).data;
} catch {
  console.error("Invalid NOSTR_NSEC — expected nsec1...");
  process.exit(1);
}

const relays = site.nostrRelays?.length ? site.nostrRelays : ["wss://relay.damus.io"];
const npub = getPublicKey(sk);
console.log("Publishing as", npub);

const events = loadEvents();
const posts = listPosts().filter((p) => !slugArg || p.slug === slugArg);

if (!posts.length) {
  console.log("No published posts to process.");
  process.exit(0);
}

const base = "https://news.duacrypto.com";

for (const { slug, meta } of posts) {
  if (events[slug]) {
    console.log("SKIP", slug, "— already published", events[slug]);
    continue;
  }

  const path = meta.lang === "en" ? `/en/posts/${slug}/` : `/posts/${slug}/`;
  const url = base + path;
  const content = `${meta.title}\n\n${meta.description}\n\n${url}`;

  console.log("Publishing", slug, "...");
  const { event, results } = await publishNote(sk, content, relays);
  const ok = results.some((r) => r.ok);
  if (!ok) {
    console.error("FAIL", slug, results);
    continue;
  }

  events[slug] = event.id;
  console.log("OK", slug, event.id);
}

writeFileSync(eventsPath, JSON.stringify(events, null, 2) + "\n");
console.log("Updated", eventsPath);
