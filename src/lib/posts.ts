import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import type { Category } from "../content.config";
import { filterPostsByLocale, getPostLocale, type Locale } from "./i18n";
import { localePath } from "../i18n/ui";
import { slugifyHeadingUnique } from "./slugify-heading.mjs";

export type TocItem = { id: string; text: string };

export async function getPublishedPosts() {
  const posts = await getCollection("posts");
  return posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getPublishedPostsForLocale(locale: Locale) {
  return filterPostsByLocale(await getPublishedPosts(), locale);
}

/** Homepage hero: explicit `featured: true`, else newest post. */
export function pickFeaturedPost(posts: CollectionEntry<"posts">[]) {
  return posts.find((p) => p.data.featured) ?? posts[0];
}

export async function getPostsByCategory(category: Category, locale?: Locale) {
  const posts = locale ? await getPublishedPostsForLocale(locale) : await getPublishedPosts();
  return posts.filter((post) => post.data.category === category);
}

export async function getPostsByTag(tag: string, locale?: Locale) {
  const posts = locale ? await getPublishedPostsForLocale(locale) : await getPublishedPosts();
  return posts.filter((post) =>
    post.data.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
  );
}

export function formatDate(date: Date, locale: Locale = "en") {
  return date.toLocaleDateString(locale === "sq" ? "sq-AL" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Compact uppercase ticker date for post eyebrow meta (Terminal & Sats). */
export function formatTickerDate(date: Date, locale: Locale = "en") {
  const parts = date.toLocaleDateString(locale === "sq" ? "sq-AL" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return parts.toUpperCase();
}

export function readingTime(body: string) {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function postSlug(id: string) {
  return id.replace(/\.mdx?$/, "");
}

const DEFAULT_OG = "/img/duacrypto-logo.png";

export function isGenericHeroImage(image: string | undefined): boolean {
  return !image || image === DEFAULT_OG;
}

/** In-page hero src, or null for text-first (OG/social uses resolveOgImagePath). */
export function resolveHeroSrc(
  image: string | undefined,
  slug: string,
  heroStyle?: "banner" | "none" | "screenshot",
): string | null {
  if (heroStyle === "none") return null;
  if (heroStyle === "screenshot" && image && !isGenericHeroImage(image)) return image;
  if (image && !isGenericHeroImage(image)) return image;
  return null;
}

/** Branded build-time OG PNG unless the post has a custom hero image. */
export function resolveOgImagePath(image: string | undefined, slug: string): string {
  if (image && image !== DEFAULT_OG) return image;
  return `/og/${slug}.png`;
}

export function postHref(slug: string, locale: Locale) {
  return locale === "en" ? `/en/posts/${slug}/` : `/posts/${slug}/`;
}

export function categoryHref(category: string, locale: Locale) {
  return localePath(`/category/${category}/`, locale);
}

export function tagHref(tag: string, locale: Locale) {
  return localePath(`/tags/${tag}/`, locale);
}

/** H2 headings for table of contents (ids must match rehypeHeadingIds). */
export function extractToc(body: string): TocItem[] {
  const seen = new Map<string, number>();
  const items: TocItem[] = [];
  for (const match of body.matchAll(/^## (.+)$/gm)) {
    const raw = match[1]
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*_`]/g, "")
      .trim();
    if (!raw) continue;
    items.push({ id: slugifyHeadingUnique(raw, seen), text: raw });
  }
  return items;
}

/** Chronological neighbors within the same category + locale (newest-first list). */
export function getCategoryAdjacentPosts(
  post: CollectionEntry<"posts">,
  allPosts: CollectionEntry<"posts">[],
  locale: Locale,
) {
  const categoryPosts = allPosts.filter(
    (p) => getPostLocale(p) === locale && p.data.category === post.data.category,
  );
  const idx = categoryPosts.findIndex((p) => p.id === post.id);
  if (idx < 0) return { older: null, newer: null };
  return {
    older: idx < categoryPosts.length - 1 ? categoryPosts[idx + 1] : null,
    newer: idx > 0 ? categoryPosts[idx - 1] : null,
  };
}
