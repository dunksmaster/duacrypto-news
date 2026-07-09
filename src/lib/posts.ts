import { getCollection } from "astro:content";
import type { Category } from "../content.config";
import { filterPostsByLocale, type Locale } from "./i18n";
import { localePath } from "../i18n/ui";

export async function getPublishedPosts() {
  const posts = await getCollection("posts");
  return posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getPublishedPostsForLocale(locale: Locale) {
  return filterPostsByLocale(await getPublishedPosts(), locale);
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

export function readingTime(body: string) {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function postSlug(id: string) {
  return id.replace(/\.mdx?$/, "");
}

const DEFAULT_OG = "/img/duacrypto-logo.png";

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
