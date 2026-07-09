import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { postTypes } from "./lib/post-scores";

export const categories = ["news", "analysis", "guides", "community"] as const;
export type Category = (typeof categories)[number];

const scoresSchema = z.object({
  empathy: z.number().int().min(0).max(100),
  storytelling: z.number().int().min(0).max(100),
  cta: z.number().int().min(0).max(100),
});

const faqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

const howToStepSchema = z.object({
  name: z.string().min(1),
  text: z.string().min(1),
});

const posts = defineCollection({
  loader: glob({ base: "./src/content/posts", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default("DuaCrypto"),
    category: z.enum(categories),
    postType: z.enum(postTypes).default("news"),
    targetKeyword: z.string().optional(),
    directAnswer: z.string().optional(),
    scores: scoresSchema.optional(),
    faq: z.array(faqItemSchema).optional(),
    howToSteps: z.array(howToStepSchema).optional(),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    draft: z.boolean().default(false),
    aiGenerated: z.boolean().default(false),
    lang: z.enum(["en", "sq"]).default("en"),
    translationOf: z.string().optional(),
  }),
});

export const collections = { posts };
