/**
 * Early theme apply — prevents flash before paint (matches duacrypto.com).
 */
(function () {
  try {
    var stored = localStorage.getItem("duacrypto-theme");
    var theme =
      stored === "dark" || stored === "light"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    var root = document.documentElement;
    var isDark = theme === "dark";
    root.classList.toggle("dark", isDark);
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
    window.__DUACRYPTO_THEME__ = { early: true, theme: theme };
  } catch (e) {
    /* ignore */
  }
})();
