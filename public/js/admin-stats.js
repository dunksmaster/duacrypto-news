(function () {
  const loading = document.getElementById("stats-loading");
  const errorEl = document.getElementById("stats-error");
  const root = document.getElementById("stats-root");

  function table(headers, rows) {
    if (!rows.length) return "<p class='text-secondary'>No data yet.</p>";
    const th = headers.map((h) => `<th class="text-left p-2 border-b">${h}</th>`).join("");
    const body = rows
      .map(
        (row) =>
          `<tr>${row.map((c) => `<td class="p-2 border-b border-border">${c}</td>`).join("")}</tr>`,
      )
      .join("");
    return `<table class="w-full text-sm"><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table>`;
  }

  fetch("/api/stats")
    .then(async (res) => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then((data) => {
      loading?.classList.add("hidden");
      root?.classList.remove("hidden");
      if (!root) return;

      const t = data.totals || {};
      root.innerHTML = `
        <div class="grid gap-4 sm:grid-cols-3">
          <div class="rounded-lg border border-border p-4"><p class="text-secondary text-sm">Total views</p><p class="text-3xl font-bold">${t.total_views ?? 0}</p></div>
          <div class="rounded-lg border border-border p-4"><p class="text-secondary text-sm">Total likes</p><p class="text-3xl font-bold">${t.total_likes ?? 0}</p></div>
          <div class="rounded-lg border border-border p-4"><p class="text-secondary text-sm">Clicks (30d)</p><p class="text-3xl font-bold">${t.clicks_30d ?? 0}</p></div>
        </div>
        <section><h2 class="mb-3 text-xl font-bold">Top posts by views</h2>${table(["Slug", "Views"], (data.topViews || []).map((r) => [r.slug, r.count]))}</section>
        <section><h2 class="mb-3 text-xl font-bold">Top posts by likes</h2>${table(["Slug", "Likes"], (data.topLikes || []).map((r) => [r.slug, r.count]))}</section>
        <section><h2 class="mb-3 text-xl font-bold">Affiliate clicks (30d)</h2>${table(["Affiliate", "Clicks"], (data.clicksByAffiliate || []).map((r) => [r.affiliate, r.clicks]))}</section>
        <section><h2 class="mb-3 text-xl font-bold">Clicks by post (30d)</h2>${table(["Post", "Affiliate", "Clicks"], (data.clicksByPost || []).map((r) => [r.slug, r.affiliate, r.clicks]))}</section>
        <p class="text-xs text-secondary">Generated ${data.generatedAt || ""}</p>
      `;
    })
    .catch((err) => {
      loading?.classList.add("hidden");
      errorEl?.classList.remove("hidden");
      if (errorEl) errorEl.textContent = "Could not load stats: " + err.message;
    });
})();
