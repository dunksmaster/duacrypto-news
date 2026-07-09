import rss from "@astrojs/rss";
import { getPublishedPostsForLocale, postHref, postSlug } from "../../lib/posts";
import site from "../../data/site.json";

export async function GET(context: { site: string | undefined }) {
  const posts = await getPublishedPostsForLocale("en");
  return rss({
    title: `${site.siteName} (English)`,
    description: "Bitcoin and Web3 news for the Albanian diaspora and Balkans.",
    site: context.site ?? "https://news.duacrypto.com",
    customData: `<language>en-us</language>`,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: postHref(postSlug(post.id), "en"),
      categories: [post.data.category, ...post.data.tags],
    })),
  });
}
