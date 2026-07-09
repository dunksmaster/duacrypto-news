import rss from "@astrojs/rss";
import { getPublishedPosts, postSlug } from "../lib/posts";
import site from "../data/site.json";

export async function GET(context: { site: string | undefined }) {
  const posts = await getPublishedPosts();
  return rss({
    title: site.siteName,
    description: site.siteDescription,
    site: context.site ?? "https://news.duacrypto.com",
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/posts/${postSlug(post.id)}/`,
      categories: [post.data.category, ...post.data.tags],
    })),
  });
}
