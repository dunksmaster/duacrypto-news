/** Client-side view + like counters (graceful when API/D1 unavailable). */
(function () {
  const root = document.getElementById("engagement-stats");
  if (!root) return;

  const slug = root.dataset.slug;
  if (!slug) return;

  const viewsEl = root.querySelector("[data-views]");
  const likesEl = root.querySelector("[data-likes]");
  const likeBtn = root.querySelector("[data-like-btn]");

  function format(n) {
    return new Intl.NumberFormat().format(n);
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
      const ts = Number(raw);
      return Date.now() - ts < 24 * 60 * 60 * 1000;
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
    if (views && viewsEl) viewsEl.textContent = format(views.count ?? 0);

    const likes = await fetchJson("/api/likes/" + encodeURIComponent(slug));
    if (likes && likesEl) likesEl.textContent = format(likes.count ?? 0);

    if (likeBtn && alreadyLiked()) {
      likeBtn.setAttribute("aria-pressed", "true");
      likeBtn.classList.add("engagement-liked");
    }
  }

  async function recordView() {
    if (viewedRecently()) return;
    const data = await fetchJson("/api/views/" + encodeURIComponent(slug), { method: "POST" });
    if (data && viewsEl) viewsEl.textContent = format(data.count ?? 0);
    markViewed();
  }

  async function onLike() {
    if (alreadyLiked() || !likeBtn) return;
    likeBtn.setAttribute("disabled", "true");
    const data = await fetchJson("/api/likes/" + encodeURIComponent(slug), { method: "POST" });
    if (data && likesEl) likesEl.textContent = format(data.count ?? 0);
    markLiked();
    likeBtn.setAttribute("aria-pressed", "true");
    likeBtn.classList.add("engagement-liked");
    likeBtn.removeAttribute("disabled");
  }

  loadCounts();
  recordView();
  if (likeBtn) likeBtn.addEventListener("click", onLike);
})();

/** Lazy view counts on listing cards */
(function () {
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
            if (data && data.count > 0) {
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
