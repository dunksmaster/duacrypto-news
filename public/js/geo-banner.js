/** Language suggestion for diaspora / English browser locales on Albanian pages. */
(function () {
  const banner = document.getElementById("geo-banner");
  if (!banner) return;

  const locale = banner.getAttribute("data-locale");
  if (locale !== "sq") return;

  try {
    if (localStorage.getItem("geo-banner-dismissed") === "1") return;
  } catch {
    /* ignore */
  }

  banner.querySelector("[data-geo-dismiss]")?.addEventListener("click", () => {
    banner.classList.add("hidden");
    try {
      localStorage.setItem("geo-banner-dismissed", "1");
    } catch {
      /* ignore */
    }
  });

  fetch("/api/geo")
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (data?.suggestLocale === "en") {
        banner.classList.remove("hidden");
      }
    })
    .catch(() => {});
})();
