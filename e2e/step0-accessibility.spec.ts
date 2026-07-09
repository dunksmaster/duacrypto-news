import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = [
  "/",
  "/posts/2026-07-09-bitget-regjistrim-shqiperi-kosove/",
  "/en/posts/bitget-signup-albania-kosovo/",
];

const VIEWPORTS = [
  { width: 375, height: 812, name: "mobile" },
  { width: 768, height: 1024, name: "tablet" },
  { width: 1280, height: 800, name: "desktop" },
] as const;

async function setTheme(page: import("@playwright/test").Page, theme: "light" | "dark") {
  await page.addInitScript((t) => {
    localStorage.setItem("duacrypto-theme", t);
  }, theme);
}

function formatViolations(violations: { id: string; description: string; nodes: { target: string[] }[] }[]): string {
  return violations
    .map((v) => `${v.id}: ${v.description}\n  ${v.nodes.map((n) => n.target.join(" ")).join("\n  ")}`)
    .join("\n\n");
}

for (const route of ROUTES) {
  for (const viewport of VIEWPORTS) {
    for (const theme of ["light", "dark"] as const) {
      test(`contrast ${route} ${viewport.name} ${theme}`, async ({ page }) => {
        await setTheme(page, theme);
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(route, { waitUntil: "networkidle" });

        const results = await new AxeBuilder({ page })
          .withTags(["wcag2aa"])
          .include("body")
          .analyze();

        expect(results.violations, formatViolations(results.violations)).toEqual([]);
      });
    }
  }
}

test("post page: no logo hero and no visible Markdown link", async ({ page }) => {
  await page.goto("/posts/2026-07-09-bitget-regjistrim-shqiperi-kosove/");

  const hero = page.locator("img.post-hero");
  await expect(hero).toHaveCount(0);

  await expect(page.getByRole("link", { name: /markdown/i })).toHaveCount(0);

  const mdAlternate = page.locator('link[rel="alternate"][type="text/markdown"]');
  await expect(mdAlternate).toHaveCount(1);
});

test("CEX post: step cards, CTAs, and TOC", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/posts/2026-07-09-cex-io-blerje-bitcoin-karte-ballkan/");

  await expect(page.locator(".step-card")).toHaveCount(3);
  await expect(page.locator("a.btn-affiliate")).toHaveCount(2);
  await expect(page.locator(".callout")).toHaveCount(3);
  await expect(page.locator(".pros-cons")).toHaveCount(1);
  await expect(page.locator(".post-toc--mobile details")).toBeVisible();
});

test("post page: embed opens from share row popover", async ({ page }) => {
  await page.goto("/posts/2026-07-09-bitget-regjistrim-shqiperi-kosove/");

  const embedBtn = page.locator("[data-embed-open]");
  await expect(embedBtn).toBeVisible();
  await embedBtn.click();

  const popover = page.locator("#embed-popover");
  await expect(popover).toBeVisible();
  await expect(popover.locator(".embed-popover-code")).toContainText("<iframe");
});
