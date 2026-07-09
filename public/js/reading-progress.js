/** Thin reading progress bar at top of post pages. */
(function () {
  var bar = document.getElementById("reading-progress");
  var article = document.querySelector("article[data-pagefind-body]");
  if (!bar || !article) {
    if (bar) bar.remove();
    return;
  }

  function update() {
    var rect = article.getBoundingClientRect();
    var total = article.scrollHeight - window.innerHeight;
    if (total <= 0) return;
    var scrolled = window.scrollY - (article.offsetTop - 80);
    var pct = Math.min(100, Math.max(0, (scrolled / total) * 100));
    bar.style.width = pct + "%";
  }

  window.addEventListener("scroll", update, { passive: true });
  update();
})();
