#!/usr/bin/env node
/**
 * Generate an AI draft post markdown file with validated frontmatter.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=... node scripts/generate-post.mjs "Topic title"
 *   ANTHROPIC_API_KEY=... node scripts/generate-post.mjs --queue
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const postsDir = join(root, "src", "content", "posts");

const categories = ["news", "analysis", "guides", "community"];

const postSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  pubDate: z.coerce.date(),
  author: z.string().default("DuaCrypto AI Desk"),
  category: z.enum(["news", "analysis", "guides", "community"]),
  tags: z.array(z.string()).default([]),
  image: z.string().optional(),
  draft: z.boolean().default(true),
  aiGenerated: z.boolean().default(true),
});

const STYLE_GUIDE = `You write for DuaCrypto News (news.duacrypto.com) — Albania's first Bitcoin/Web3 community.
Voice: practical, welcoming, no hype. Audience: Albanian and Balkans readers plus global Bitcoiners.
Length: 800–1200 words. Use markdown with ## subheadings. Cite sources when stating facts.
Link to duacrypto.com for events, donation, and corporate pages when relevant.`;

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error("Response missing YAML frontmatter block");
  const yaml = match[1];
  const body = match[2].trim();
  const data = Object.fromEntries(
    yaml.split("\n").map((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return null;
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      if (val.startsWith("[") && val.endsWith("]")) {
        val = val
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean);
      } else if (val === "true") val = true;
      else if (val === "false") val = false;
      else val = val.replace(/^["']|["']$/g, "");
      return [key, val];
    }).filter(Boolean),
  );
  return { data, body };
}

async function callClaude(topic, category, tags) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is required");

  const prompt = `${STYLE_GUIDE}

Write a blog post about: ${topic}
Category: ${category}
Tags: ${tags.join(", ")}

Return ONLY a markdown file starting with YAML frontmatter:
---
title: "..."
description: "..."
pubDate: ${new Date().toISOString().slice(0, 10)}
author: "DuaCrypto AI Desk"
category: ${category}
tags: [${tags.map((t) => `"${t}"`).join(", ")}]
draft: true
aiGenerated: true
---

Then the article body in markdown.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${err}`);
  }

  const json = await res.json();
  const text = json.content?.find((c) => c.type === "text")?.text;
  if (!text) throw new Error("Empty Claude response");
  return text.trim();
}

function buildFile(data, body) {
  const tagsYaml = `[${data.tags.map((t) => `"${t}"`).join(", ")}]`;
  const pubDate =
    data.pubDate instanceof Date
      ? data.pubDate.toISOString().slice(0, 10)
      : String(data.pubDate).slice(0, 10);
  return `---
title: "${data.title.replace(/"/g, '\\"')}"
description: "${data.description.replace(/"/g, '\\"')}"
pubDate: ${pubDate}
author: "${data.author}"
category: ${data.category}
tags: ${tagsYaml}
draft: ${data.draft}
aiGenerated: ${data.aiGenerated}
---

${body}
`;
}

async function generateForTopic({ title, category = "news", tags = [] }) {
  if (!categories.includes(category)) {
    throw new Error(`Invalid category: ${category}`);
  }

  console.log(`Generating draft: ${title}`);
  const raw = await callClaude(title, category, tags);
  const { data, body } = parseFrontmatter(raw);
  const validated = postSchema.parse({ ...data, draft: true, aiGenerated: true });

  const date = validated.pubDate.toISOString().slice(0, 10);
  const slug = slugify(validated.title);
  const filename = `${date}-${slug}.md`;
  const outPath = join(postsDir, filename);

  if (existsSync(outPath)) {
    throw new Error(`File already exists: ${filename}`);
  }

  writeFileSync(outPath, buildFile(validated, body), "utf8");
  console.log(`Wrote ${outPath}`);
  return { filename, title: validated.title };
}

async function main() {
  const arg = process.argv.slice(2).join(" ").trim();

  if (arg === "--queue") {
    const queuePath = join(root, "content-queue.yaml");
    const queue = parseYaml(readFileSync(queuePath, "utf8"));
    const topic = queue.topics?.[0];
    if (!topic?.title) throw new Error("No topics in content-queue.yaml");
    await generateForTopic(topic);
    return;
  }

  if (!arg) {
    console.error("Usage: node scripts/generate-post.mjs \"Topic\" | --queue");
    process.exit(1);
  }

  await generateForTopic({ title: arg, category: "news", tags: ["bitcoin"] });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
