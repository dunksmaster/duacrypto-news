import { getAffiliate } from "../_shared/affiliates";
import { isValidSlug, slugFromReferer } from "../_shared/validators";

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const name = (context.params.name as string)?.toLowerCase();
  const partner = getAffiliate(name);

  if (!partner) {
    return Response.redirect("https://news.duacrypto.com/", 302);
  }

  const url = new URL(context.request.url);
  let fromSlug = url.searchParams.get("from");
  if (fromSlug && !isValidSlug(fromSlug)) {
    fromSlug = null;
  }
  if (!fromSlug) {
    fromSlug = slugFromReferer(context.request.headers.get("Referer"));
  }

  const country = (context.request as Request & { cf?: { country?: string } }).cf?.country ?? null;

  if (context.env.DB) {
    try {
      await context.env.DB.prepare(
        "INSERT INTO clicks (affiliate, from_slug, country, created_at) VALUES (?, ?, ?, datetime('now'))",
      )
        .bind(name, fromSlug, country)
        .run();
    } catch {
      // Non-fatal — still redirect
    }
  }

  return Response.redirect(partner.href, 302);
};
