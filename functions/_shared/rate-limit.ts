const WINDOW_MS = 60_000;
const MAX_POSTS = 10;

export function clientIp(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP") ??
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

/** Returns true if request should be blocked (429). Prunes old rows opportunistically. */
export async function isRateLimited(
  db: D1Database,
  ip: string,
  route: string,
): Promise<boolean> {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  await db
    .prepare("DELETE FROM rate_limits WHERE created_at < ?")
    .bind(windowStart)
    .run();

  const row = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM rate_limits
       WHERE ip = ? AND route = ? AND created_at >= ?`,
    )
    .bind(ip, route, windowStart)
    .first<{ n: number }>();

  if ((row?.n ?? 0) >= MAX_POSTS) return true;

  await db
    .prepare("INSERT INTO rate_limits (ip, route, created_at) VALUES (?, ?, ?)")
    .bind(ip, route, now)
    .run();

  return false;
}
