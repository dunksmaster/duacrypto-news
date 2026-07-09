import rss from "@astrojs/rss";
import { getPublishedPostsForLocale, postHref, postSlug } from "../lib/posts";
import site from "../data/site.json";

export async function GET(context: { site: string | undefined }) {
  const posts = await getPublishedPostsForLocale("sq");
  return rss({
    title: `${site.siteName} (Shqip)`,
    description: site.siteDescription,
    site: context.site ?? "https://news.duacrypto.com",
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: postHref(postSlug(post.id), "sq"),
      categories: [post.data.category, ...post.data.tags],
    })),
  });
}
