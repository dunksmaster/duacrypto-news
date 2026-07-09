/** Top posts by view count on homepage (requires /api/stats). */
(function () {
  const section = document.getElementById("popular-posts");
  const list = document.getElementById("popular-posts-list");
  const indexEl = document.getElementById("posts-index");
  if (!section || !list || !indexEl) return;

  let index = [];
  try {
    index = JSON.parse(indexEl.textContent || "[]");
  } catch {
    return;
  }
  const bySlug = Object.fromEntries(index.map((p) => [p.slug, p]));

  fetch("/api/stats")
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      const top = (data?.topViews || []).filter((r) => r.count >= 25 && bySlug[r.slug]).slice(0, 6);
      if (!top.length) return;

      list.innerHTML = top
        .map(
          (row, i) =>
            `<li class="flex gap-3 rounded-lg border border-border bg-card p-4">
              <span class="text-2xl font-bold text-primary/60">${i + 1}</span>
              <div>
                <a href="${bySlug[row.slug].href}" class="font-semibold text-dark hover:text-primary">${bySlug[row.slug].title}</a>
                <p class="mt-1 text-xs text-secondary">👁 ${new Intl.NumberFormat().format(row.count)}</p>
              </div>
            </li>`,
        )
        .join("");
      section.hidden = false;
    })
    .catch(() => {});
})();
