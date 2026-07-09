// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { rehypeAffiliateLinks } from "./src/lib/rehype-affiliate-links.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://news.duacrypto.com",
  integrations: [sitemap()],
  markdown: {
    rehypePlugins: [rehypeAffiliateLinks],
  },
});
