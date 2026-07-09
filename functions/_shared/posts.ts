import manifest from "./posts-manifest.json";

export interface PostManifestEntry {
  slug: string;
  lang: string;
  title: string;
  description: string;
  category: string;
  canonical: string;
  embedUrl: string;
  thumbnail: string;
}

export function findPostByUrl(urlString: string): PostManifestEntry | undefined {
  try {
    const url = new URL(urlString);
    if (!url.hostname.endsWith("duacrypto.com")) return undefined;
    const m = url.pathname.match(/\/(?:en\/)?posts\/([a-z0-9-]{1,100})\/?$/i);
    if (!m) return undefined;
    const slug = m[1].toLowerCase();
    return manifest.posts.find((p) => p.slug === slug);
  } catch {
    return undefined;
  }
}

export function findPostBySlug(slug: string, lang?: string): PostManifestEntry | undefined {
  const normalized = slug.toLowerCase();
  if (lang) {
    return manifest.posts.find((p) => p.slug === normalized && p.lang === lang);
  }
  return manifest.posts.find((p) => p.slug === normalized);
}
