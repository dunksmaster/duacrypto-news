# Hero screenshots — operator checklist (item 11)

How-to affiliate posts (Bitget, CEX.io, Tangem) convert better with **real annotated screenshots** of the signup flow — not the generic DuaCrypto logo.

## Current state

- Posts with `heroStyle: none` skip the generic logo hero in [`PostLayout.astro`](../src/layouts/PostLayout.astro).
- Branded OG PNGs still generate at build time for social previews (`/og/{slug}.png`).

## What to capture (manual — only you can do this)

| Post | Screenshots needed |
|------|-------------------|
| Bitget signup | Register screen, KYC step, 2FA toggle, first BTC buy confirmation |
| CEX.io card buy | Card deposit, fee summary, spot buy screen |
| Tangem | App pairing, receive address, test withdrawal from exchange |

## How to add

1. Save WebP/PNG under `public/img/posts/{slug}/` (e.g. `public/img/posts/cex-io/step-1.webp`).
2. Update post frontmatter:
   ```yaml
   image: /img/posts/cex-io/hero.webp
   heroStyle: screenshot
   ```
3. Embed step images in markdown body with alt text per step.
4. Rebuild — hero shows capped at 380px desktop / 240px mobile.

## Do not

- Use stock crypto art or repeated logo for how-to guides.
- Publish screenshots with real balances, emails, or ID numbers visible — blur or use demo account.
