export const SLUG_RE = /^[a-z0-9-]{1,100}$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}

const BOT_RE = /bot|crawl|spider|preview|GPTBot|Claude|Perplexity|Bytespider|CCBot/i;

export function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return BOT_RE.test(userAgent);
}

export function slugFromReferer(referer: string | null): string | null {
  if (!referer) return null;
  try {
    const path = new URL(referer).pathname;
    const m = path.match(/\/(?:en\/)?posts\/([a-z0-9-]{1,100})\/?$/i);
    return m ? m[1].toLowerCase() : null;
  } catch {
    return null;
  }
}

export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { ...init, headers });
}
