/** Copy link + Web Share API for ShareRow. */
(function () {
  document.querySelectorAll("[data-share-url]").forEach(function (row) {
    var url = row.getAttribute("data-share-url");
    if (!url) return;

    var copyBtn = row.querySelector("[data-copy-link]");
    var nativeBtn = row.querySelector("[data-native-share]");

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
  });
})();
