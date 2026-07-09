import { findPostByUrl, findPostBySlug } from "../_shared/posts";
import { json } from "../_shared/validators";

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const format = url.searchParams.get("format");
  const targetUrl = url.searchParams.get("url");
  const slugParam = url.searchParams.get("slug");

  let post = targetUrl ? findPostByUrl(targetUrl) : undefined;
  if (!post && slugParam) {
    post = findPostBySlug(slugParam, url.searchParams.get("lang") ?? undefined);
  }

  if (!post) {
    return json({ error: "not found" }, { status: 404 });
  }

  const payload = {
    version: "1.0",
    type: "rich",
    provider_name: "DuaCrypto News",
    provider_url: "https://news.duacrypto.com/",
    title: post.title,
    author_name: "DuaCrypto",
    width: 1200,
    height: 630,
    html: `<iframe src="${post.embedUrl}" width="100%" height="360" frameborder="0" scrolling="no" allowtransparency="true" title="${post.title.replace(/"/g, "&quot;")}"></iframe>`,
    thumbnail_url: post.thumbnail,
    thumbnail_width: 1200,
    thumbnail_height: 630,
  };

  if (format === "json") {
    return json(payload, {
      headers: { "Cache-Control": "public, max-age=3600" },
    });
  }

  return json(payload, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
};
