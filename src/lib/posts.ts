import { getCollection } from "astro:content";
import type { Category } from "../content.config";

export async function getPublishedPosts() {
  const posts = await getCollection("posts");
  return posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getPostsByCategory(category: Category) {
  const posts = await getPublishedPosts();
  return posts.filter((post) => post.data.category === category);
}

export async function getPostsByTag(tag: string) {
  const posts = await getPublishedPosts();
  return posts.filter((post) =>
    post.data.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
  );
}

export function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
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
