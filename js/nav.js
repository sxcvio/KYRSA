(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");

  if (!header || !toggle || !nav) return;

  var navLinks = nav.querySelectorAll("a");
  var themeButton = nav.querySelector(".theme-toggle");
  var mobileQuery = window.matchMedia("(max-width: 900px)");

  function setMenuState(isOpen) {
    header.classList.toggle("nav-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
  }

  toggle.addEventListener("click", function () {
    var isOpen = toggle.getAttribute("aria-expanded") === "true";
    setMenuState(!isOpen);
  });

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      if (mobileQuery.matches) {
        setMenuState(false);
      }
    });
  });

  if (themeButton) {
    themeButton.addEventListener("click", function () {
      if (mobileQuery.matches) {
        setMenuState(false);
      }
    });
  }

  mobileQuery.addEventListener("change", function (event) {
    if (!event.matches) {
      setMenuState(false);
    }
  });
})();
