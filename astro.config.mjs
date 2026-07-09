// @ts-check
import { readFileSync, existsSync } from "node:fs";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { rehypeAffiliateLinks } from "./src/lib/rehype-affiliate-links.mjs";
import { rehypeHeadingIds } from "./src/lib/rehype-heading-ids.mjs";

const i18nMapPath = new URL("./src/data/i18n-map.json", import.meta.url);
/** @type {{ alternates: Record<string, { href: string; hreflang: string }[]> }} */
const i18nMap = existsSync(i18nMapPath)
  ? JSON.parse(readFileSync(i18nMapPath, "utf8"))
  : { alternates: {} };

// https://astro.build/config
export default defineConfig({
  site: "https://news.duacrypto.com",
  i18n: {
    defaultLocale: "sq",
    locales: ["sq", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "sq",
        locales: {
          sq: "sq-AL",
          en: "en-US",
        },
      },
      serialize(item) {
        const path = new URL(item.url).pathname;
        const links = i18nMap.alternates[path];
        if (links?.length) {
          item.links = links.map((l) => ({ url: l.href, lang: l.hreflang }));
        }
        return item;
      },
    }),
  ],
  markdown: {
    rehypePlugins: [rehypeHeadingIds, rehypeAffiliateLinks],
  },
});
