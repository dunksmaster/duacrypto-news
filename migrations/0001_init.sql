-- DuaCrypto News analytics (views, likes, affiliate clicks)
CREATE TABLE IF NOT EXISTS views (
  slug TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS likes (
  slug TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS clicks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  affiliate TEXT NOT NULL,
  from_slug TEXT,
  country TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_clicks_affiliate ON clicks (affiliate);
CREATE INDEX IF NOT EXISTS idx_clicks_created_at ON clicks (created_at);
CREATE INDEX IF NOT EXISTS idx_clicks_from_slug ON clicks (from_slug);
