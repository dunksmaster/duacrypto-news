# Content style — DuaCrypto News

Rules for human-written and AI-generated posts. The layout renders HTML blocks embedded in markdown.

## Voice

- Practical, welcoming, no hype. Albanian-first for `lang: sq`; English for diaspora SEO when `lang: en`.
- Hook intro ≤3 sentences. H2 every 150–250 words. Paragraphs max 3 sentences.
- Bold one key phrase per major section.

## Frontmatter

| Field | When |
|-------|------|
| `targetKeyword` | Every post — one keyword, one post |
| `directAnswer` | 2–3 sentence quotable summary (AI search + on-page callout) |
| `faq` | 2–3 real Q&A pairs (accordion + schema) |
| `howToSteps` | Step-by-step guides |
| `heroStyle: none` | Default for text-first posts (no generic logo hero) |

## HTML components (copy/paste)

### Callouts

```html
<div class="callout callout-tip">
  <p class="callout-title">💡 Këshillë</p>
  <p class="m-0">Body text.</p>
</div>
```

Variants: `callout-warning` (⚠️), `callout-info` (ℹ️).

### Key takeaways (guides)

```html
<div class="key-takeaways">
  <p class="key-takeaways-title">Çka mëson këtu</p>
  <ul>
    <li>First takeaway</li>
  </ul>
</div>
```

### Step cards

```html
<div class="step-card">
  <span class="step-card-num">1</span>
  <div>
    <p class="step-card-title">Step title</p>
    <p class="step-card-body">Step body.</p>
  </div>
</div>
```

### Pros / cons

```html
<div class="pros-cons">
  <div class="pros-cons-col">
    <h3>✅ Pro</h3>
    <ul><li>...</li></ul>
  </div>
  <div class="pros-cons-col">
    <h3>⚠️ Kufizime</h3>
    <ul><li>...</li></ul>
  </div>
</div>
```

### Affiliate CTA (2× per affiliate post)

```html
<a class="btn-affiliate" href="/go/cex">Hap llogari në CEX.io →</a>
```

Use `/go/*` pretty links only. Place after the first major step and again before the closing paragraph.

## Images

```markdown
![Alt text describing the screenshot](img/posts/slug-1.webp)
*Optional caption in italics.*
```

Or `<figure><img src="..." alt="..." /><figcaption>Caption</figcaption></figure>`.

## Internal links

Cross-link related affiliate posts, pillars, and scam/legal guides. Minimum 2–3 per post.

## Reference post

See `src/content/posts/2026-07-09-cex-io-blerje-bitcoin-karte-ballkan.md` for a fully migrated affiliate guide.
