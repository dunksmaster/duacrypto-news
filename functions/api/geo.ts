import { json } from "../_shared/validators";

/** Geo hint for language-suggestion banner (uses Cloudflare cf.country). */
export const onRequest: PagesFunction = async (context) => {
  const req = context.request as Request & { cf?: { country?: string } };
  const country = req.cf?.country ?? null;
  const acceptLang = context.request.headers.get("Accept-Language") ?? "";

  let suggestLocale: "en" | null = null;
  if (country && !["AL", "XK", "MK"].includes(country)) {
    if (["US", "GB", "IE", "CA", "AU", "NZ", "DE", "IT", "CH", "AT", "NL", "SE", "NO", "DK"].includes(country)) {
      suggestLocale = "en";
    }
  }
  if (!suggestLocale && /^en/i.test(acceptLang) && !/sq/i.test(acceptLang)) {
    suggestLocale = "en";
  }

  return json(
    { country, suggestLocale },
    {
      headers: {
        "Cache-Control": "private, max-age=3600",
      },
    },
  );
};
