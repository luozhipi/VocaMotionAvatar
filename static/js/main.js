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

  function pauseOtherVideos(activeVideo) {
    document.querySelectorAll("video").forEach(function (other) {
      if (other !== activeVideo) other.pause();
    });
  }

  function wireVideo(video) {
    video.addEventListener("play", function () {
      pauseOtherVideos(video);
    });
  }

  document.querySelectorAll("video").forEach(function (video) {
    wireVideo(video);
  });

  var libraryVideos = Array.isArray(window.ALL_AVATAR_VIDEOS) ? window.ALL_AVATAR_VIDEOS : [];
  var libraryGrid = document.getElementById("all-video-grid");
  var librarySearch = document.getElementById("library-search");
  var libraryCount = document.getElementById("library-count");
  var libraryReset = document.getElementById("library-reset");
  var libraryTabs = Array.prototype.slice.call(document.querySelectorAll("[data-library-filter]"));
  var libraryFilter = "all";
  var libraryQuery = "";

  function createEl(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (typeof text === "string") el.textContent = text;
    return el;
  }

  function matchesLibraryFilter(item) {
    var haystack = [item.title, item.filename, item.version, item.mode, item.id].join(" ").toLowerCase();
    var queryOk = !libraryQuery || haystack.indexOf(libraryQuery) !== -1;
    var filterOk = libraryFilter === "all" || item.version === libraryFilter || item.mode === libraryFilter;
    return queryOk && filterOk;
  }

  function renderLibrary() {
    if (!libraryGrid) return;
    var shown = libraryVideos.filter(matchesLibraryFilter);
    libraryGrid.textContent = "";
    if (libraryCount) {
      libraryCount.textContent = "显示 " + shown.length + " / " + libraryVideos.length;
    }
    if (!shown.length) {
      libraryGrid.appendChild(createEl("div", "library-empty", "没有匹配的视频素材"));
      return;
    }
    var fragment = document.createDocumentFragment();
    shown.forEach(function (item) {
      var card = createEl("article", "video-card library-card");
      var frame = createEl("div", "library-frame");
      frame.dataset.src = item.src;
      frame.dataset.poster = item.poster;
      frame.dataset.title = item.title;

      var img = document.createElement("img");
      img.src = item.poster;
      img.alt = item.version + " " + (item.mode === "sing" ? "唱歌" : "说话") + "：" + item.title;
      img.loading = "lazy";
      frame.appendChild(img);

      var play = createEl("button", "library-play");
      play.type = "button";
      play.setAttribute("aria-label", "播放 " + item.title);
      play.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7L8 5Z"/></svg><span>播放</span>';
      frame.appendChild(play);

      var copy = createEl("div", "card-copy");
      var tags = createEl("div", "tag-row");
      tags.appendChild(createEl("span", item.mode === "sing" ? "tag tag-sing" : "tag tag-speech", item.mode === "sing" ? "Sing" : "Speech"));
      tags.appendChild(createEl("span", "tag", item.version));
      tags.appendChild(createEl("span", "tag", item.id));
      copy.appendChild(tags);
      copy.appendChild(createEl("h3", "", item.title));
      copy.appendChild(createEl("div", "library-file", item.filename));

      card.appendChild(frame);
      card.appendChild(copy);
      fragment.appendChild(card);
    });
    libraryGrid.appendChild(fragment);
  }

  libraryTabs.forEach(function (button) {
    button.addEventListener("click", function () {
      libraryFilter = button.dataset.libraryFilter || "all";
      libraryTabs.forEach(function (tab) {
        var active = tab === button;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-pressed", active ? "true" : "false");
      });
      renderLibrary();
    });
  });

  if (librarySearch) {
    librarySearch.addEventListener("input", function () {
      libraryQuery = librarySearch.value.trim().toLowerCase();
      renderLibrary();
    });
  }

  if (libraryReset) {
    libraryReset.addEventListener("click", function () {
      libraryFilter = "all";
      libraryQuery = "";
      if (librarySearch) librarySearch.value = "";
      libraryTabs.forEach(function (tab) {
        var active = tab.dataset.libraryFilter === "all";
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-pressed", active ? "true" : "false");
      });
      renderLibrary();
    });
  }

  if (libraryGrid) {
    libraryGrid.addEventListener("click", function (event) {
      var button = event.target.closest(".library-play");
      if (!button) return;
      var frame = button.closest(".library-frame");
      if (!frame) return;
      var video = document.createElement("video");
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.poster = frame.dataset.poster;
      video.src = frame.dataset.src;
      frame.textContent = "";
      frame.appendChild(video);
      wireVideo(video);
      video.play().catch(function () {});
    });
  }

  renderLibrary();
})();
