/** Client-side view + like counters — hidden until meaningful social proof (≥25 views). */
(function () {
  const MIN_VIEWS = 25;

  const root = document.getElementById("engagement-stats");
  if (!root) return;

  const slug = root.dataset.slug;
  if (!slug) return;

  const viewsEl = root.querySelector("[data-views]");
  const likesEl = root.querySelector("[data-likes]");
  const likeBtn = root.querySelector("[data-like-btn]");
  const viewsStat = root.querySelector("[data-views-stat]");
  const likesStat = root.querySelector("[data-likes-stat]");

  function format(n) {
    return new Intl.NumberFormat().format(n);
  }

  function showEngagement(viewCount, likeCount) {
    if (viewCount >= MIN_VIEWS) {
      root.classList.remove("hidden");
      if (viewsStat) viewsStat.hidden = false;
    }
    if (likeCount > 0 && likesStat) {
      root.classList.remove("hidden");
      likesStat.hidden = false;
    }
  }

  async function fetchJson(url, options) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  function viewedRecently() {
    try {
      const raw = localStorage.getItem("viewed:" + slug);
      if (!raw) return false;
      return Date.now() - Number(raw) < 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  }

  function markViewed() {
    try {
      localStorage.setItem("viewed:" + slug, String(Date.now()));
    } catch {
      /* ignore */
    }
  }

  function alreadyLiked() {
    try {
      return localStorage.getItem("liked:" + slug) === "1";
    } catch {
      return false;
    }
  }

  function markLiked() {
    try {
      localStorage.setItem("liked:" + slug, "1");
    } catch {
      /* ignore */
    }
  }

  async function loadCounts() {
    const views = await fetchJson("/api/views/" + encodeURIComponent(slug));
    const likes = await fetchJson("/api/likes/" + encodeURIComponent(slug));
    const viewCount = views?.count ?? 0;
    const likeCount = likes?.count ?? 0;

    if (viewsEl) viewsEl.textContent = format(viewCount);
    if (likesEl) likesEl.textContent = format(likeCount);
    showEngagement(viewCount, likeCount);

    if (likeBtn && alreadyLiked()) {
      likeBtn.setAttribute("aria-pressed", "true");
      likeBtn.classList.add("engagement-liked");
    }
  }

  async function recordView() {
    if (viewedRecently()) return;
    const data = await fetchJson("/api/views/" + encodeURIComponent(slug), { method: "POST" });
    const viewCount = data?.count ?? 0;
    if (viewsEl) viewsEl.textContent = format(viewCount);
    const likes = await fetchJson("/api/likes/" + encodeURIComponent(slug));
    showEngagement(viewCount, likes?.count ?? 0);
    markViewed();
  }

  async function onLike() {
    if (alreadyLiked() || !likeBtn) return;
    likeBtn.setAttribute("disabled", "true");
    const data = await fetchJson("/api/likes/" + encodeURIComponent(slug), { method: "POST" });
    const likeCount = data?.count ?? 0;
    if (likesEl) likesEl.textContent = format(likeCount);
    markLiked();
    likeBtn.setAttribute("aria-pressed", "true");
    likeBtn.classList.add("engagement-liked");
    likeBtn.removeAttribute("disabled");
    const views = await fetchJson("/api/views/" + encodeURIComponent(slug));
    showEngagement(views?.count ?? 0, likeCount);
    if (likesStat) likesStat.hidden = false;
    root.classList.remove("hidden");
  }

  loadCounts();
  recordView();
  if (likeBtn) likeBtn.addEventListener("click", onLike);
})();

/** Lazy view counts on listing cards — only ≥25 views */
(function () {
  const MIN_VIEWS = 25;
  const cards = document.querySelectorAll("[data-card-views]");
  if (!cards.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        const slug = el.getAttribute("data-card-views");
        if (!slug) continue;
        observer.unobserve(el);
        fetch("/api/views/" + encodeURIComponent(slug))
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data && data.count >= MIN_VIEWS) {
              el.textContent = "👁 " + new Intl.NumberFormat().format(data.count);
              el.hidden = false;
            }
          })
          .catch(() => {});
      }
    },
    { rootMargin: "100px" },
  );

  cards.forEach((el) => observer.observe(el));
})();
