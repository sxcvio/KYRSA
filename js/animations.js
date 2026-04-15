(function () {
  // Плавное появление заголовков секций при скролле
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll(".section-head, .page-title").forEach(function (el) {
    el.classList.add("reveal");
    observer.observe(el);
  });
})();
