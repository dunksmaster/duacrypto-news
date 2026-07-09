/** Copy link, Web Share, and embed popover for ShareRow. */
(function () {
  document.querySelectorAll("[data-share-url]").forEach(function (row) {
    var url = row.getAttribute("data-share-url");
    if (!url) return;

    var copyBtn = row.querySelector("[data-copy-link]");
    var nativeBtn = row.querySelector("[data-native-share]");
    var embedOpen = row.querySelector("[data-embed-open]");
    var popover = document.getElementById("embed-popover");

    if (navigator.share && nativeBtn) {
      nativeBtn.classList.remove("hidden");
      nativeBtn.addEventListener("click", function () {
        navigator.share({ url: url, title: document.title }).catch(function () {});
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        navigator.clipboard?.writeText(url).then(function () {
          var sq = copyBtn.textContent?.includes("Kopjo");
          copyBtn.textContent = sq ? "U kopjua!" : "Copied!";
          setTimeout(function () {
            copyBtn.textContent = sq ? "Kopjo linkun" : "Copy link";
          }, 2000);
        });
      });
    }

    function closeEmbed() {
      popover?.classList.add("hidden");
    }

    embedOpen?.addEventListener("click", function () {
      popover?.classList.remove("hidden");
    });

    popover?.querySelectorAll("[data-embed-close]").forEach(function (el) {
      el.addEventListener("click", closeEmbed);
    });

    popover?.querySelector("[data-embed-copy]")?.addEventListener("click", function () {
      var ta = popover.querySelector(".embed-popover-code");
      var code = row.getAttribute("data-embed-code") || ta?.value || "";
      navigator.clipboard?.writeText(code).then(function () {
        var btn = popover.querySelector("[data-embed-copy]");
        if (!btn) return;
        var sq = btn.textContent?.includes("Kopjo");
        btn.textContent = sq ? "U kopjua!" : "Copied!";
        setTimeout(function () {
          btn.textContent = sq ? "Kopjo" : "Copy";
        }, 2000);
      });
    });
  });
})();
