import { json } from "../_shared/validators";

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  if (!context.env.DB) {
    return json({ error: "analytics not configured" }, { status: 503 });
  }

  const db = context.env.DB;

  const topViews = await db
    .prepare(
      `SELECT slug, count FROM views ORDER BY count DESC LIMIT 20`,
    )
    .all<{ slug: string; count: number }>();

  const topLikes = await db
    .prepare(
      `SELECT slug, count FROM likes ORDER BY count DESC LIMIT 20`,
    )
    .all<{ slug: string; count: number }>();

  const clicksByAffiliate = await db
    .prepare(
      `SELECT affiliate, COUNT(*) AS clicks
       FROM clicks
       WHERE created_at >= datetime('now', '-30 days')
       GROUP BY affiliate
       ORDER BY clicks DESC`,
    )
    .all<{ affiliate: string; clicks: number }>();

  const clicksByPost = await db
    .prepare(
      `SELECT from_slug AS slug, affiliate, COUNT(*) AS clicks
       FROM clicks
       WHERE from_slug IS NOT NULL AND created_at >= datetime('now', '-30 days')
       GROUP BY from_slug, affiliate
       ORDER BY clicks DESC
       LIMIT 50`,
    )
    .all<{ slug: string; affiliate: string; clicks: number }>();

  const totals = await db
    .prepare(
      `SELECT
         (SELECT COALESCE(SUM(count), 0) FROM views) AS total_views,
         (SELECT COALESCE(SUM(count), 0) FROM likes) AS total_likes,
         (SELECT COUNT(*) FROM clicks WHERE created_at >= datetime('now', '-30 days')) AS clicks_30d`,
    )
    .first<{ total_views: number; total_likes: number; clicks_30d: number }>();

  return json(
    {
      generatedAt: new Date().toISOString(),
      totals: totals ?? { total_views: 0, total_likes: 0, clicks_30d: 0 },
      topViews: topViews.results ?? [],
      topLikes: topLikes.results ?? [],
      clicksByAffiliate: clicksByAffiliate.results ?? [],
      clicksByPost: clicksByPost.results ?? [],
    },
    {
      headers: {
        "Cache-Control": "private, max-age=60",
      },
    },
  );
};
