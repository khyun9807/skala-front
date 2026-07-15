/* =============================================================
   AURORA UI · interactions.js
   Generic, reusable, DOM-agnostic interaction effects: spotlight,
   tilt, magnetic buttons, ripple, parallax, scroll-reveal, animated
   counters, and an aurora hero background that drifts toward the
   pointer. Every purely decorative effect here is skipped when the
   user has `prefers-reduced-motion: reduce` set.
   ============================================================= */

window.AuroraUI = window.AuroraUI || {};

(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var raf = window.requestAnimationFrame || function (fn) { return window.setTimeout(fn, 16); };

  /* ---------- Spotlight cards: light follows the cursor ----------
     Scoped per-card (like tilt/magnetic below) instead of a single
     document-wide listener: a page-level pointermove handler used to
     run a closest() lookup on every mouse movement anywhere on the
     page, even when nowhere near a spotlight card. Attaching directly
     to each card means the browser only ever calls this while the
     pointer is actually over one. */
  function initSpotlight() {
    document.querySelectorAll(".aur-card--spotlight").forEach(function (card) {
      card.addEventListener("pointermove", function (evt) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--sx", (evt.clientX - rect.left) + "px");
        card.style.setProperty("--sy", (evt.clientY - rect.top) + "px");
      });
    });
  }

  /* ---------- Tilt cards: perspective rotate toward cursor ---------- */
  function initTilt() {
    if (reduceMotion) return;
    document.querySelectorAll(".aur-card--tilt").forEach(function (card) {
      card.addEventListener("pointermove", function (evt) {
        var rect = card.getBoundingClientRect();
        var px = (evt.clientX - rect.left) / rect.width - 0.5;
        var py = (evt.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty("--ry", (px * 14).toFixed(2) + "deg");
        card.style.setProperty("--rx", (py * -14).toFixed(2) + "deg");
      });
      card.addEventListener("pointerleave", function () {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* ---------- Magnetic buttons: nudge toward cursor within a radius ---------- */
  function initMagnetic() {
    if (reduceMotion) return;
    var radius = 60;
    document.querySelectorAll(".aur-btn--magnetic").forEach(function (btn) {
      btn.addEventListener("pointermove", function (evt) {
        var rect = btn.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = evt.clientX - cx;
        var dy = evt.clientY - cy;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < radius * 2.2) {
          btn.style.setProperty("--mx", (dx * 0.25).toFixed(1));
          btn.style.setProperty("--my", (dy * 0.25).toFixed(1));
        }
      });
      btn.addEventListener("pointerleave", function () {
        btn.style.setProperty("--mx", 0);
        btn.style.setProperty("--my", 0);
      });
    });
  }

  /* ---------- Ripple: delegated click handler on any .aur-btn ---------- */
  function initRipple() {
    document.addEventListener("click", function (evt) {
      var btn = evt.target.closest && evt.target.closest(".aur-btn");
      if (!btn || reduceMotion) return;
      var rect = btn.getBoundingClientRect();
      var span = document.createElement("span");
      var size = Math.max(rect.width, rect.height);
      span.className = "aur-ripple";
      span.style.width = span.style.height = size + "px";
      span.style.left = (evt.clientX - rect.left - size / 2) + "px";
      span.style.top = (evt.clientY - rect.top - size / 2) + "px";
      btn.appendChild(span);
      span.addEventListener("animationend", function () {
        span.remove();
      });
    });
  }

  /* ---------- Parallax layers (data-parallax-speed="0.3") ---------- */
  function initParallax() {
    if (reduceMotion) return;
    var layers = Array.prototype.slice.call(document.querySelectorAll("[data-parallax-speed]"));
    if (!layers.length) return;
    var ticking = false;
    function update() {
      var y = window.scrollY;
      layers.forEach(function (el) {
        var speed = parseFloat(el.getAttribute("data-parallax-speed")) || 0.2;
        el.style.transform = "translate3d(0," + (y * speed * -0.15).toFixed(1) + "px,0)";
      });
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) {
        raf(update);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------- Hero background drifts toward pointer ---------- */
  function initAuroraFollow() {
    if (reduceMotion) return;
    var hero = document.querySelector(".aur-hero");
    if (!hero) return;
    hero.addEventListener("pointermove", function (evt) {
      var rect = hero.getBoundingClientRect();
      var px = (evt.clientX - rect.left) / rect.width - 0.5;
      var py = (evt.clientY - rect.top) / rect.height - 0.5;
      hero.style.setProperty("--mx", (px * 40).toFixed(1));
      hero.style.setProperty("--my", (py * 40).toFixed(1));
    });
  }

  /* ---------- Animated number counters (IntersectionObserver, run once) ---------- */
  function initCounters() {
    var counters = document.querySelectorAll(".aur-counter[data-target]");
    if (!counters.length || !("IntersectionObserver" in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { io.observe(el); });

    function animateCounter(el) {
      var target = parseFloat(el.getAttribute("data-target")) || 0;
      var duration = reduceMotion ? 0 : 1200;
      var start = performance.now();
      var suffix = el.getAttribute("data-suffix") || "";

      function tick(now) {
        var progress = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.round(target * eased);
        el.textContent = value.toLocaleString() + suffix;
        if (progress < 1) raf(tick);
      }
      raf(tick);
    }
  }

  /* ---------- Scroll reveal + bar/line chart trigger ---------- */
  function initScrollReveal() {
    var targets = document.querySelectorAll(".aur-reveal, .aur-chart-bar__col, .aur-chart-line");
    if (!targets.length || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-in-view"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Scroll-position reading progress bar ---------- */
  function initScrollProgress() {
    var bar = document.querySelector("[data-scroll-progress]");
    if (!bar) return;
    var ticking = false;
    /* Recomputed inside rAF: a fast scroll gesture can fire scroll
       events far more often than the screen actually repaints, so
       running this straight off the scroll event would recompute
       and rewrite the bar's width many times per frame for no
       visible benefit — throttling to rAF caps it at once/frame. */
    function update() {
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - doc.clientHeight;
      var pct = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0;
      bar.style.width = pct + "%";
      ticking = false;
    }
    document.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        raf(update);
      }
    }, { passive: true });
    update();
  }

  /* ---------- Active section indicator (sidebar / navbar) ---------- */
  function initActiveSection() {
    var sections = document.querySelectorAll("main [id]");
    var navLinks = document.querySelectorAll("[data-nav-link]");
    if (!sections.length || !navLinks.length || !("IntersectionObserver" in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle("is-active", link.getAttribute("data-nav-link") === entry.target.id);
        });
      });
    }, { rootMargin: "-40% 0px -50% 0px" });

    sections.forEach(function (section) { io.observe(section); });
  }

  window.AuroraUI.interactions = {
    init: function () {
      initSpotlight();
      initTilt();
      initMagnetic();
      initRipple();
      initParallax();
      initAuroraFollow();
      initCounters();
      initScrollReveal();
      initScrollProgress();
      initActiveSection();
    }
  };
})();
