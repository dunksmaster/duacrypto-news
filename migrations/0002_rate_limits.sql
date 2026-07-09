-- Rate-limit tracking for POST /api/views and /api/likes (10/min per IP)
CREATE TABLE IF NOT EXISTS rate_limits (
  ip TEXT NOT NULL,
  route TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_route_ts ON rate_limits (ip, route, created_at);
