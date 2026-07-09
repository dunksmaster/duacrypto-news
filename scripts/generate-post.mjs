#!/usr/bin/env node
/**
 * Generate an AI draft post markdown file with validated frontmatter.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=... node scripts/generate-post.mjs "Topic title"
 *   ANTHROPIC_API_KEY=... node scripts/generate-post.mjs --queue
 *   ANTHROPIC_API_KEY=... node scripts/generate-post.mjs --localize si-te-blej-bitcoin-ne-shqiperi
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const postsDir = join(root, "src", "content", "posts");

const categories = ["news", "analysis", "guides", "community"];
const postTypes = ["affiliate", "news", "guide", "community"];

const scoreProfiles = {
  affiliate: { empathy: 80, storytelling: 70, cta: 60 },
  news: { empathy: 60, storytelling: 50, cta: 30 },
  guide: { empathy: 85, storytelling: 75, cta: 40 },
  community: { empathy: 90, storytelling: 90, cta: 50 },
};

const scoresSchema = z.object({
  empathy: z.number().int().min(0).max(100),
  storytelling: z.number().int().min(0).max(100),
  cta: z.number().int().min(0).max(100),
});

const postSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  pubDate: z.coerce.date(),
  author: z.string().default("Dua"),
  category: z.enum(["news", "analysis", "guides", "community"]),
  postType: z.enum(["affiliate", "news", "guide", "community"]).default("news"),
  scores: scoresSchema.optional(),
  tags: z.array(z.string()).default([]),
  image: z.string().optional(),
  draft: z.boolean().default(true),
  aiGenerated: z.boolean().default(true),
  lang: z.enum(["en", "sq"]).default("en"),
  translationKey: z.string().optional(),
  translationOf: z.string().optional(),
  targetKeyword: z.string().optional(),
  directAnswer: z.string().optional(),
});

const STYLE_GUIDE = `You write for DuaCrypto News (news.duacrypto.com) — Albania's first Bitcoin/Web3 community.
Voice: practical, welcoming, no hype. Audience: Albanian and Balkans readers plus global Bitcoiners.
Length: 800–1200 words (pillar guides: 1200–1500). Use markdown with ## subheadings. Cite sources when stating facts.
Link to duacrypto.com for events, donation, and corporate pages when relevant.

SEO (every post):
- ONE target keyword = ONE post. Put keyword front-loaded in title, H1 (title), first 100 words, one H2, image alt concept.
- Include targetKeyword and directAnswer in frontmatter (2–3 sentence quotable answer for AI search).
- Include faq: 2–3 real questions with short answers in frontmatter (renders as FAQ schema).
- Include 2–3 internal links to existing posts on news.duacrypto.com.
- For step-by-step guides, include howToSteps in frontmatter when applicable.

Affiliate posts (postType: affiliate):
- Write in Albanian (lang: sq) unless asked otherwise.
- Use pretty affiliate links only: /go/tangem, /go/bitget, /go/cex, /go/deeper, /go/newsletter
- End with a soft newsletter CTA pointing to /go/newsletter

Score profiles (include in frontmatter, self-rate honestly):
- affiliate: empathy 80, storytelling 70, cta 60
- news: empathy 60, storytelling 50, cta 30
- guide: empathy 85, storytelling 75, cta 40
- community: empathy 90, storytelling 90, cta 50`;

const LOCALIZE_GUIDE = `You LOCALIZE Albanian DuaCrypto News posts into English — never literal translation.

Rules:
- Own English target keyword (Google US/EU diaspora intent), own slug-friendly title, EUR/USD pricing — not LEK-first.
- Albanian diaspora angle (Italy, Germany, Switzerland) where relevant.
- Same facts and affiliate links (/go/*) but rewritten voice for English SEO.
- Keep translationKey identical to the source post.
- lang: en, draft: true, aiGenerated: true
- Include targetKeyword, directAnswer, faq (2-3), howToSteps when source is a guide.
- Link to /en/posts/ for English internal links; you may link once to the Albanian pillar with rel context.
- Do NOT copy Albanian sentence structure or calques.`;

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error("Response missing YAML frontmatter block");
  const data = parseYaml(match[1]);
  const body = match[2].trim();
  return { data, body };
}

async function callClaudeLocalize(sourceMeta, sourceBody, enKeywordHint) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is required");

  const prompt = `${LOCALIZE_GUIDE}

Source Albanian post frontmatter (YAML):
${sourceMeta}

Source body (markdown):
${sourceBody.slice(0, 12000)}

Suggested English keyword: ${enKeywordHint || "derive from topic for diaspora + Albania intent"}

Return ONLY a complete markdown file with YAML frontmatter for the EN localized version.
Required frontmatter fields: title, description, pubDate (today), author, category, postType, targetKeyword, directAnswer, translationKey (same as source), lang: en, tags, draft: true, aiGenerated: true.
Use a short English slug concept in the title (filename will be derived from title).`;

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

function loadSourcePost(slug) {
  const direct = join(postsDir, `${slug}.md`);
  if (existsSync(direct)) {
    const raw = readFileSync(direct, "utf8");
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) throw new Error(`${slug}.md: missing frontmatter`);
    return { slug, metaYaml: match[1], body: match[2].trim(), data: parseYaml(match[1]) };
  }
  const hit = readdirSync(postsDir).find((n) => n.endsWith(".md") && n.replace(/\.md$/, "") === slug);
  if (!hit) throw new Error(`Source post not found: ${slug}`);
  const raw = readFileSync(join(postsDir, hit), "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`${hit}: missing frontmatter`);
  return { slug: hit.replace(/\.md$/, ""), metaYaml: match[1], body: match[2].trim(), data: parseYaml(match[1]) };
}

async function localizeFromSlug(slug, enKeywordHint) {
  const source = loadSourcePost(slug);
  if (source.data.lang === "en") {
    throw new Error("Source post is already English — pick an Albanian (sq) pillar.");
  }
  if (!source.data.translationKey) {
    console.warn("Warning: source post has no translationKey — add one before publishing the pair.");
  }

  console.log(`Localizing (not translating): ${source.slug} → English`);
  const raw = await callClaudeLocalize(source.metaYaml, source.body, enKeywordHint);
  const { data, body } = parseFrontmatter(raw);
  const validated = postSchema.parse({
    ...data,
    lang: "en",
    translationKey: data.translationKey ?? source.data.translationKey,
    draft: true,
    aiGenerated: true,
  });

  const outSlug = slugify(validated.title);
  const filename = `${outSlug}.md`;
  const outPath = join(postsDir, filename);

  if (existsSync(outPath)) {
    throw new Error(`File already exists: ${filename} — edit manually or pick a new title.`);
  }

  writeFileSync(outPath, buildFile(validated, body), "utf8");
  console.log(`Wrote localized EN draft: ${outPath}`);
  return { filename, title: validated.title, translationKey: validated.translationKey };
}

async function callClaude(topic, category, postType, tags, lang, targetKeyword) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is required");

  const profile = scoreProfiles[postType] ?? scoreProfiles.news;
  const keywordLine = targetKeyword ? `Target keyword: ${targetKeyword}` : "";

  const prompt = `${STYLE_GUIDE}

Write a blog post about: ${topic}
Category: ${category}
postType: ${postType}
${keywordLine}
Target scores: empathy ${profile.empathy}, storytelling ${profile.storytelling}, cta ${profile.cta}
Language: ${lang}
Tags: ${tags.join(", ")}

Return ONLY a markdown file starting with YAML frontmatter:
---
title: "..."
description: "..."
pubDate: ${new Date().toISOString().slice(0, 10)}
author: "Dua"
category: ${category}
postType: ${postType}
targetKeyword: "..."
directAnswer: "2-3 sentence direct answer in ${lang === "sq" ? "Albanian" : "English"}"
scores:
  empathy: ${profile.empathy}
  storytelling: ${profile.storytelling}
  cta: ${profile.cta}
faq:
  - question: "..."
    answer: "..."
tags: [${tags.map((t) => `"${t}"`).join(", ")}]
lang: ${lang}
draft: true
aiGenerated: true
---

Then the article body in markdown. Open with the direct answer theme in first paragraph. Self-rate scores honestly.`;

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
  const scoresYaml = data.scores
    ? `scores:
  empathy: ${data.scores.empathy}
  storytelling: ${data.scores.storytelling}
  cta: ${data.scores.cta}
`
    : "";
  const langLine = data.lang && data.lang !== "en" ? `lang: ${data.lang}\n` : "";
  const keyLine = data.translationKey ? `translationKey: ${data.translationKey}\n` : "";
  const kwLine = data.targetKeyword ? `targetKeyword: "${String(data.targetKeyword).replace(/"/g, '\\"')}"\n` : "";
  const daLine = data.directAnswer
    ? `directAnswer: "${String(data.directAnswer).replace(/"/g, '\\"')}"\n`
    : "";
  return `---
title: "${data.title.replace(/"/g, '\\"')}"
description: "${data.description.replace(/"/g, '\\"')}"
pubDate: ${pubDate}
author: "${data.author}"
category: ${data.category}
postType: ${data.postType ?? "news"}
${kwLine}${daLine}${scoresYaml}tags: ${tagsYaml}
${langLine}${keyLine}draft: ${data.draft}
aiGenerated: ${data.aiGenerated}
---

${body}
`;
}

async function generateForTopic({
  title,
  category = "news",
  postType = "news",
  tags = [],
  lang = "en",
  targetKeyword,
}) {
  if (!categories.includes(category)) {
    throw new Error(`Invalid category: ${category}`);
  }
  if (!postTypes.includes(postType)) {
    throw new Error(`Invalid postType: ${postType}`);
  }

  console.log(`Generating draft: ${title} (${postType}, ${lang})`);
  const raw = await callClaude(title, category, postType, tags, lang, targetKeyword);
  const { data, body } = parseFrontmatter(raw);
  const profile = scoreProfiles[postType];
  const validated = postSchema.parse({
    ...data,
    postType,
    scores: data.scores ?? profile,
    lang,
    draft: true,
    aiGenerated: true,
  });

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
  const args = process.argv.slice(2);

  if (args[0] === "--localize") {
    const slug = args[1];
    const keywordHint = args[2];
    if (!slug) {
      console.error("Usage: node scripts/generate-post.mjs --localize <sq-slug> [en-keyword-hint]");
      process.exit(1);
    }
    await localizeFromSlug(slug, keywordHint);
    return;
  }

  const arg = args.join(" ").trim();

  if (arg === "--queue") {
    const queuePath = join(root, "content-queue.yaml");
    const queue = parseYaml(readFileSync(queuePath, "utf8"));
    const topic = queue.topics?.[0];
    if (!topic?.title) throw new Error("No topics in content-queue.yaml");
    await generateForTopic(topic);
    return;
  }

  if (!arg) {
    console.error('Usage: node scripts/generate-post.mjs "Topic" | --queue | --localize <sq-slug>');
    process.exit(1);
  }

  await generateForTopic({ title: arg, category: "news", postType: "news", tags: ["bitcoin"], lang: "en" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
