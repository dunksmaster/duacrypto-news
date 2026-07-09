import type { CollectionEntry } from "astro:content";
import { postSlug } from "./posts";
import { localePath, type Locale, ogLocales } from "../i18n/ui";

export type PostEntry = CollectionEntry<"posts">;

export function getPostLocale(post: PostEntry): Locale {
  return post.data.lang === "sq" ? "sq" : "en";
}

export function postUrl(post: PostEntry, siteBase = "https://news.duacrypto.com"): string {
  const slug = postSlug(post.id);
  const locale = getPostLocale(post);
  const path = locale === "en" ? `/en/posts/${slug}/` : `/posts/${slug}/`;
  return new URL(path, siteBase).href;
}

export function findTranslationPartner(
  post: PostEntry,
  allPosts: PostEntry[],
): PostEntry | undefined {
  const key = post.data.translationKey;
  if (key) {
    return allPosts.find(
      (p) => p.id !== post.id && !p.data.draft && p.data.translationKey === key,
    );
  }
  // Legacy translationOf (sq points to en slug)
  if (post.data.translationOf) {
    return allPosts.find(
      (p) => !p.data.draft && postSlug(p.id) === post.data.translationOf,
    );
  }
  if (post.data.lang === "en") {
    return allPosts.find(
      (p) => !p.data.draft && p.data.translationOf === postSlug(post.id),
    );
  }
  return undefined;
}

export function buildHreflangAlternates(
  post: PostEntry,
  allPosts: PostEntry[],
  siteBase = "https://news.duacrypto.com/",
): { hreflang: string; href: string }[] {
  const partner = findTranslationPartner(post, allPosts);
  if (!partner) return [];

  const selfLang = getPostLocale(post);
  const partnerLang = getPostLocale(partner);
  const selfUrl = postUrl(post, siteBase.replace(/\/$/, ""));
  const partnerUrl = postUrl(partner, siteBase.replace(/\/$/, ""));

  return [
    { hreflang: selfLang, href: selfUrl },
    { hreflang: partnerLang, href: partnerUrl },
    { hreflang: "x-default", href: selfLang === "sq" ? selfUrl : partnerUrl },
  ];
}

export function buildOgLocaleAlternates(
  post: PostEntry,
  allPosts: PostEntry[],
): { locale: string; alternates: string[] } {
  const partner = findTranslationPartner(post, allPosts);
  const locale = getPostLocale(post);
  const primary = ogLocales[locale];
  const alternates = partner
    ? [ogLocales[getPostLocale(partner)]]
    : locale === "sq"
      ? [ogLocales.en]
      : [ogLocales.sq];
  return { locale: primary, alternates };
}

export function filterPostsByLocale(posts: PostEntry[], locale: Locale): PostEntry[] {
  return posts.filter((p) => getPostLocale(p) === locale);
}

export function detectLocaleFromPath(pathname: string): Locale {
  return pathname.startsWith("/en") ? "en" : "sq";
}

export function switcherTarget(
  post: PostEntry | undefined,
  allPosts: PostEntry[],
  currentLocale: Locale,
): { href: string; label: string; available: boolean } {
  const strings = currentLocale === "sq" ? "sq" : "en";
  if (!post) {
    return {
      href: localePath("/", currentLocale === "sq" ? "en" : "sq"),
      label: currentLocale === "sq" ? "English" : "Shqip",
      available: true,
    };
  }
  const partner = findTranslationPartner(post, allPosts);
  if (partner) {
    const partnerLocale = getPostLocale(partner);
    return {
      href: postUrl(partner).replace("https://news.duacrypto.com", ""),
      label: partnerLocale === "en" ? "English" : "Shqip",
      available: true,
    };
  }
  const fallbackLocale = currentLocale === "sq" ? "en" : "sq";
  return {
    href: localePath(`/category/${post.data.category}/`, fallbackLocale),
    label: currentLocale === "sq" ? "English (category)" : "Shqip (kategori)",
    available: false,
  };
}
