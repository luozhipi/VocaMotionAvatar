(function () {
  "use strict";

  var themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("avatar-theme", next); } catch (e) {}
    });
  }

  var nav = document.querySelector(".nav");
  var bar = document.querySelector(".progress-bar");
  function onScroll() {
    var y = window.scrollY || 0;
    if (nav) nav.classList.toggle("is-scrolled", y > 8);
    if (bar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if ("IntersectionObserver" in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealIO.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });

    document.querySelectorAll(".reveal").forEach(function (el) {
      revealIO.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".scenario-card"));

  function applyFilter(filter) {
    cards.forEach(function (card) {
      var tags = (card.dataset.tags || "").split(/\s+/);
      var visible = filter === "all" || tags.indexOf(filter) !== -1;
      card.hidden = !visible;
    });
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var filter = button.dataset.filter || "all";
      filterButtons.forEach(function (btn) {
        var active = btn === button;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });
      applyFilter(filter);
    });
  });

  document.querySelectorAll("video").forEach(function (video) {
    video.addEventListener("play", function () {
      document.querySelectorAll("video").forEach(function (other) {
        if (other !== video) other.pause();
      });
    });
  });
})();
