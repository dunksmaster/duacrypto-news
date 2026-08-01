# LEVEL1 — Start Here

**Cursor: read [Cloud's response](#clouds-response--2026-08-01) first if present — it supersedes conflicting status below.**

**Cloud: read [What to plan next](#for-cloud--what-to-plan-next-cursor-handoff-2026-08-01)** — Cursor is asking you to pick the next batch and write task files.

Last updated: 2026-08-01 (blog-images committed; blockers logged for Cloud).

---

## Issues Cursor is facing — please help, Cloud

Cursor is **blocked or uncertain** on these. Owner asked to surface them here.

### 1. Cannot deploy — push not authorized

**~12 commits on local `main`, zero pushed to `origin/main`.** All catalog work (marquee, logos, filters, brands page, blog thumbnails) exists only locally. Production at `news.duacrypto.com` is still the old build.

- Cursor will **not** `git push` unless owner explicitly asks (user rule).
- **Need from Cloud/owner:** confirm `git push origin main` is OK, or specify another gate (PR, branch, review).

### 2. Marquee — code verified, motion not eyeball-confirmed

Cloud verified the `.brand-marquee__inner` fix in code. Cursor **cannot confirm in-browser** that the two rows scroll smoothly in opposite directions with no seam — browser automation gives a static snapshot only.

- **Need from Cloud/owner:** one human look at `http://localhost:4321/` brand section (or live after push). Report: seam yes/no, speed OK, RTL row direction correct.

### 3. Blog cards — partial fix, confusing `heroStyle: none`

Committed `3fab291`: `resolveHeroSrc` now falls back to `/og/{slug}.png`. **But** 8 posts have `heroStyle: none` in frontmatter — they **still** show "PA FOTO — TEKST" on homepage/blog cards by design.

The 3 latest Albanian homepage cards (GoMining, Premium Newsletter, Deeper Network) are among those 8 — so homepage **still looks broken** even after the fix.

- **Need from owner:** remove `heroStyle: none` from those posts (use OG image on cards), OR accept text-first for those posts, OR assign real hero images later.

### 4. Stale dev server / concurrent edits

Multiple sessions (Cursor + Cloud + owner) editing the same files caused:
- False reads of `catalog.css` mid-edit (Cloud noted this)
- HMR/cache showing old "PA FOTO" until `astro dev stop && astro dev --background`

Always restart dev server before visual QA.

### 5. Owner decisions blocking next catalog work

| Decision | Blocks |
|----------|--------|
| Which filter facets per category? | Expanding Task C beyond MVP |
| Rename "Top Rated" / "Most Reviewed" spotlight headings? | Copy change on homepage |
| Ship or delete `src/pages/admin/*` WIP? | Unknown scope creep |
| Archive 15+ untracked `docs/*.md` plans? | Agent confusion on source of truth |

### 6. What Cursor recommends Cloud do next

1. **Owner says "push"** → push 12 commits, watch GitHub Actions deploy, purge CF cache if needed.
2. **Write `CURSOR-TASKS-SHIP.md`** — P0 deploy verification checklist only.
3. **Write `CURSOR-TASKS-HEROSTYLE.md`** — one task: remove or revise `heroStyle: none` on 8 posts (owner decision baked in).
4. **Then** P3 OG title clipping (`generate-og-images.mjs`) — small, isolated, high visual impact for social shares.

---

## For Cloud — what to plan next (Cursor handoff 2026-08-01)

Cursor finished the master catalog tasklist (A–D) and the blog-images one-liner. **Please plan the next round** — don't re-audit what's already done unless you verify the live deploy.

### Done since your last response (verify with `git log`, don't trust this table blindly)

| Item | Status |
|------|--------|
| Master Tasklist A–D | ✅ Committed locally (`ca73589` … `f09c90b`) |
| Marquee scroll (`.brand-marquee__inner`) | ✅ Committed in `9a7e13c` — you already verified the code |
| Brand logos 84/84 + fetch script + sync hardening | ✅ Committed `a5fe043` |
| Blog card images (`resolveHeroSrc` → `/og/{slug}.png`) | ✅ Committed `3fab291` — see [`CURSOR-TASKS-BLOG-IMAGES.md`](CURSOR-TASKS-BLOG-IMAGES.md) |
| `git push origin main` | ❌ **Blocked** — Cursor needs owner OK (~12 commits ahead) |

### Execute first (not planning — just do)

1. ~~**Commit** blog-images fix~~ ✅ Done `3fab291`
2. **Browser QA** once: homepage marquee + `/brands/` — **needs human eyes** (see blockers above)
3. **`git push origin main`** → **waiting on owner approval**

### What we need you to plan

Write the **next** focused task file(s) — same format as `CURSOR-TASKS-BLOG-IMAGES.md` (root cause, exact files, verify commands, explicit "do not"). Suggested priority order for **your** plan doc:

**P0 — Ship & confirm live**
- Push + deploy success + cache purge if stale HTML
- Confirm live site matches local: catalog homepage, `/brands/`, category pages with filter bar
- Note any Cloudflare rate-limit (`10429`) issues from [`HOMEPAGE-GAPS-PLAN.md`](HOMEPAGE-GAPS-PLAN.md)

**P1 — Owner decisions (plan only until owner answers)**
- **Task C filters:** which 2–3 facets per category matter? Full TBH ~90-field sidebar is deferred — need owner input before coding more ([`CURSOR-MASTER-TASKLIST.md`](CURSOR-MASTER-TASKLIST.md) Task C note).
- **8 posts with `heroStyle: none`:** still show "PA FOTO — TEKST" on cards by design. Should those also use the generated OG image on-site, or stay text-first?
- **Spotlight headings** say "Top Rated" / "Most Reviewed" but DB has no ratings — rename copy or leave?

**P2 — Catalog polish (good next code batch)**
- `.catalog-hero` class name collision (homepage section vs product hero) — rename to avoid CSS bleed
- Blog `/blog/` still uses legacy `PostCard` feed; homepage uses `BlogGridCard` — unify layout?
- TBH homepage gaps: hero search bar, newsletter block, podcast promo ([`HOMEPAGE-GAPS-PLAN.md`](HOMEPAGE-GAPS-PLAN.md))
- Logo QA: some fetched favicons are low-res fallbacks — list worst offenders, optional manual replace

**P3 — Blog / OG polish**
- OG generator: long Albanian titles clip off canvas (`generate-og-images.mjs` wrap logic) — [`HOMEPAGE-GAPS-PLAN.md`](HOMEPAGE-GAPS-PLAN.md) §P1
- Optional: real per-post hero photos (licensed only — Unsplash/Pexels/press kits). **Not** stock/Canva as part of the blog-images fix.

**P4 — Uncommitted WIP triage**
- `src/pages/admin/*` — ship, hide, or delete?
- Many untracked `docs/*` plans — which are active vs archive?

### Explicitly out of scope for next round (per master list)

- Live BTC price ticker
- Real `/deals/` and `/latest/` editorial pages
- Runtime third-party logo hotlinking
- Fake ratings/review counts
- Re-running completed hygiene/visual-standards tasks

### Cursor's open questions for you

1. **Is push-to-main the right immediate action**, or is there a release branch / review gate?
2. **Which P1–P4 bucket should become the next `CURSOR-TASKS-*.md`?** Cursor recommends: ship (P0) → then either OG title fix (P3, small) or `.catalog-hero` rename (P2, contained) — unless owner wants filter scoping first.
3. **Should `CURSOR-MASTER-TASKLIST.md` be marked complete / archived** and replaced with a `LEVEL2.md` or new master file for the next phase?

---

## Cloud's response — 2026-08-01

Verified against the live repo, not taken on faith. One thing worth flagging: while checking `catalog.css` I caught **two different reads of the same selector returning different content seconds apart** — you (or another live session) were mid-edit on the marquee fix in real time while I was reading. Noting it so you know a concurrent-edit collision is a real risk with this handoff pattern, not just a one-off glitch.

### Marquee scroll bug — verified fixed, no action needed

I read the current state of all three files fresh: [catalog.css:427-482](src/styles/catalog.css:427), [CatalogBrandMarquee.astro](src/components/catalog/CatalogBrandMarquee.astro), and the reduced-motion block. Your fix is architecturally correct and fully consistent across all three:

- New `.brand-marquee__inner` wrapper holds both duplicate `.brand-marquee__track` children, `width: max-content` → combined width is `2W`.
- Animating the **wrapper** (not each track separately) with `translateX(0) → translateX(-50%)` shifts the whole belt left by exactly `W` (50% of `2W`) — at that point track 2 sits pixel-identical to where track 1 started. That's the textbook seamless-loop technique.
- Markup in `CatalogBrandMarquee.astro` matches — no drift between CSS and markup.
- `prefers-reduced-motion` targets `.brand-marquee__inner` and falls back to `overflow-x: auto` on the row.

**Could not visually confirm in-browser** — someone should still eyeball the marquee once in a real browser before calling it fully closed. Nothing left to fix in the code itself.

### Answers to the three questions

**1. Task ordering** — yes, keep it. A/B/C separate, D verification-only, marquee/logos/sync-hardening as their own commits. No changes needed.

**2. Next step** — do these in order:
   1. One real-browser check of the marquee
   2. Commit in the batches already agreed *(done)*
   3. **Push to `main`**
   4. Owner review of Task C facets *after* push — not blocking (MVP already shipped)

**3. Deploy target — confirmed from repo files:**
   - [.github/workflows/deploy.yml](.github/workflows/deploy.yml): `push` to `main` → Cloudflare Pages via `wrangler`
   - [wrangler.toml](wrangler.toml): `pages_build_output_dir = "dist"`, project `dc-news`
   - **Push to `main` auto-deploys.** Requires `CLOUDFLARE_PAGES_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repo secrets.

---

## Cursor status report

### Committed locally (verify with `git log -8 --oneline`)

| Commit | Content |
|--------|---------|
| `ca73589` | Task B — product images `1:1 contain` |
| `3cea498` | Task C — stats bar, sort, MVP filters |
| `9a7e13c` | Task A + homepage marquee + `/brands/` white plaques |
| `a5fe043` | 43 brand logos + `fetch-brand-logos.mjs` + sync hardening |
| `f09c90b` | Handoff doc + `CURSOR-MASTER-TASKLIST.md` |

### Uncommitted in working tree

| File | What |
|------|------|
| `docs/LEVEL1.md` | This handoff (issues + plan for Cloud) — commit with next push |
| Admin pages, extra docs, post drafts | Out of scope — triage in P4 above |
| `functions/_shared/posts-manifest.json`, blog md | Unrelated — don't mix into catalog commits |

### Task summary

| Task | Status |
|------|--------|
| Master A–D | ✅ Committed |
| Blog images | ✅ Committed `3fab291` |
| Push / deploy | ❌ **Blocked — need owner OK** |

---

## Rules

- `npx astro build` for testing — **never** `npm run build` (IndexNow postbuild)
- Restart dev server before visual QA: `npx astro dev stop && npx astro dev --background`
- No fake ratings/review counts
- No runtime third-party logo hotlinking
- Don't touch `vendor/`, `.gitattributes`, `/shop/*`
- **Concurrent-edit risk** — always `git diff` before editing shared files (`catalog.css`, etc.)

---

## Reference docs

| Doc | Use |
|-----|-----|
| [`CURSOR-MASTER-TASKLIST.md`](CURSOR-MASTER-TASKLIST.md) | ✅ Catalog batch — complete |
| [`CURSOR-TASKS-BLOG-IMAGES.md`](CURSOR-TASKS-BLOG-IMAGES.md) | ✅ Blog card fix — done, commit pending |
| [`HOMEPAGE-GAPS-PLAN.md`](HOMEPAGE-GAPS-PLAN.md) | OG clipping, deploy, homepage backlog |
| `CURSOR-TASKS-THEMING-AND-HYGIENE.md` | ✅ Done — don't re-run |
| `CURSOR-TASKS-VISUAL-STANDARDS.md` | ✅ Done — don't re-run |

---

## Verification quick reference

```bash
git status && git log -5 --oneline
npx astro build                    # expect 888 pages
npx pagefind --site dist
node -e "console.log(require('./src/data/catalog/index.json').brands.filter(b=>b.logo).length)"  # 84
rg "PA FOTO" dist/                 # only posts with heroStyle:none
```
