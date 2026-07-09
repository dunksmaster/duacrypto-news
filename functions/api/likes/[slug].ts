import { isValidSlug, isBot, json } from "../../_shared/validators";
import { clientIp, isRateLimited } from "../../_shared/rate-limit";

interface Env {
  DB: D1Database;
}

async function getCount(db: D1Database, slug: string): Promise<number> {
  const row = await db.prepare("SELECT count FROM likes WHERE slug = ?").bind(slug).first<{ count: number }>();
  return row?.count ?? 0;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const slug = context.params.slug as string;
  if (!isValidSlug(slug)) {
    return json({ error: "not found" }, { status: 404 });
  }

  const { request, env } = context;
  const method = request.method.toUpperCase();

  if (method === "GET") {
    const count = env.DB ? await getCount(env.DB, slug) : 0;
    return json(
      { slug, count },
      {
        headers: {
          "Cache-Control": "public, max-age=60",
        },
      },
    );
  }

  if (method === "POST") {
    if (!env.DB) {
      return json({ slug, count: 0 });
    }

    const ua = request.headers.get("User-Agent");
    if (isBot(ua)) {
      const count = await getCount(env.DB, slug);
      return json({ slug, count, skipped: "bot" });
    }

    const ip = clientIp(request);
    if (await isRateLimited(env.DB, ip, "likes")) {
      const count = await getCount(env.DB, slug);
      return json({ slug, count, error: "rate limit exceeded" }, { status: 429 });
    }

    await env.DB.prepare(
      `INSERT INTO likes (slug, count, updated_at) VALUES (?, 1, datetime('now'))
       ON CONFLICT(slug) DO UPDATE SET count = count + 1, updated_at = datetime('now')`,
    )
      .bind(slug)
      .run();

    const count = await getCount(env.DB, slug);
    return json({ slug, count });
  }

  return json({ error: "method not allowed" }, { status: 405 });
};
