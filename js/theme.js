(function () {
  var storageKey = "nonoir-theme";
  var root = document.documentElement;
  var buttons = document.querySelectorAll(".theme-toggle");
  var heroImage = document.querySelector('img[src*="hero-crypto"]');
  var brandImages = document.querySelectorAll(".brand-text");

  function syncHeroImage(theme) {
    if (!heroImage) return;
    heroImage.src = theme === "dark"
      ? "../image/content/hero-crypto black.png"
      : "../image/content/hero-crypto white.png";
  }

  function syncBrandImages(theme) {
    if (!brandImages.length) return;
    brandImages.forEach(function (img) {
      img.src = theme === "dark"
        ? "../image/logo/text_logo_nonoir.png"
        : "../image/logo/text_logo_nonoir_black.png";
    });
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    syncHeroImage(theme);
    syncBrandImages(theme);
    buttons.forEach(function (btn) {
      btn.textContent = theme === "dark" ? "Светлая тема" : "Тёмная тема";
    });
  }

  function getSavedTheme() {
    var saved = localStorage.getItem(storageKey);
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  applyTheme(getSavedTheme());

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem(storageKey, next);
    });
  });
})();
