#!/usr/bin/env node
/**
 * Validate post frontmatter against the content collection schema.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

const postsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "content", "posts");

const postSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  pubDate: z.coerce.date(),
  author: z.string(),
  category: z.enum(["news", "analysis", "guides", "community"]),
  tags: z.array(z.string()),
  image: z.string().optional(),
  draft: z.boolean(),
  aiGenerated: z.boolean(),
});

let count = 0;
for (const name of readdirSync(postsDir)) {
  if (!name.endsWith(".md")) continue;
  const raw = readFileSync(join(postsDir, name), "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error(`${name}: missing frontmatter`);
  const data = parseYaml(match[1]);
  postSchema.parse(data);
  count += 1;
  console.log(`  ✓ ${name}`);
}
console.log(`Validated ${count} post(s).`);
