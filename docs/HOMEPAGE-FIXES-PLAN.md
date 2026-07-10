# Homepage Fixes Plan — news.duacrypto.com

From live review 2026-07-10. Ordered by priority. Cursor-ready.

## P0 — Trust: the fake Telegram number (do first, alone)
- `src/data/site.json` line 12: `"telegramMembers": "10,000+"` is FALSE — real group is ~200. On a crypto site, a provable lie in the header destroys the one asset that sells affiliate links: trust. Anyone can open the Telegram and count.
- **Fix options (pick one):**
  1. **Honest static number**: set to real count (e.g. `"200+"`) and update the "Që prej 2020" only if accurate.
  2. **Live count (best)**: the main site already has `functions/api/telegram-count.ts` — port it; TrustBar fetches the real member count from the Telegram API (`getChatMembersCount`) at build or runtime. Never wrong, never stale.
  3. **Drop the number**: "Komuniteti i parë Bitcoin në Shqipëri · Bashkohu në Telegram" — social proof without a claim.
- Recommendation: option 2 if the bot token is available (it is — used on main site), else option 1. Also **remove the TrustBar from article/category pages** — homepage only (per design system).

## P1 — Cards still use OG images as thumbnails (the recurring bug)
Every card shows the generated OG PNG: orange "news.duacrypto.com" bar, "GUIDES" badge, and the title baked into the image — so the title appears TWICE and gets cut off ("Çfarë merr subscriberët e Premium Newsletter" truncated).
- **Fix**: cards must NEVER use `/og/*.png`. Use the post's real hero image if it's a genuine photo/screenshot, otherwise NO image — text-only card/row. OG images are for external link previews only.
- Convert homepage + category + "Artikujt e fundit" to the **feed-row layout** (DESIGN-SYSTEM.md #9): title (2-line clamp), mono meta line (`GUIDES /// 7 KOR /// 👁 890`), small real thumb OR none. Kill the big image-card grid.

## P2 — English labels on the Albanian homepage
- Category cards show `NEWS / ANALYSIS / GUIDES / COMMUNITY` and eyebrows say `GUIDES` on SQ pages. Route ALL category labels through the i18n dictionary: Lajme / Analiza / Udhëzues / Komunitet.
- Featured eyebrow "COMMUNITY" → "KOMUNITET".

## P3 — Don't show empty categories
- "Shfleto sipas kategorisë" lists NEWS (0 artikuj) and ANALYSIS (0 artikuj) — advertising emptiness looks abandoned. Hide categories with 0 posts, OR seed 1–2 real posts into News & Analysis before launch push. (Content decision — flag to owner.)

## P4 — Featured section polish
- The "Në fokus" featured card duplicates the title (OG image + heading) — fixed by P1.
- Featured = one large text-forward block (big headline, dek, meta, real image only if strong), then the feed rows below. Currently two competing card styles.

## P5 — Small cleanups
- Nav has both "Kryefaqja" (Home) AND "Faqja kryesore" (also Home→main site?) — confusing duplicate; rename the second to "duacrypto.com ↗" so it's clearly the main site.
- Footer "© DuaCrypto 2025" → 2026 (or auto-year).
- Hero dek line length good; keep.

## Order for Cursor
1. P0 telegram (own commit) → 2. P1 feed rows + kill OG-thumbs sitewide → 3. P2 i18n labels → 4. P3/P4 → 5. P5.
One PR, preview URL, before/after screenshots of homepage. Presentation/content only — no SEO/analytics changes.
