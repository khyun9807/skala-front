/* =============================================================
   AURORA UI · spatial.js
   The engine behind the "immersive space" layer: a depth-aware
   starfield, a lerp-following custom cursor, a shared pointer
   field broadcast as CSS variables, a scroll-reactive portal, a
   magnetic dock, and a draggable 3D orbit carousel.

   Every module here is purely additive: if this script fails to
   load, the page underneath (core Aurora UI) is unaffected.

   Performance notes (read before adding another rAF loop here):
   - Only ONE `pointermove` listener is attached at window level
     (see `sharedPointer` below). Every module that needs live
     cursor coordinates reads from it instead of attaching its own
     listener — with 3-4 independent global listeners each doing
     its own work, every physical mouse move was paying for all of
     them, which is the single biggest source of jank this layer
     could cause.
   - Continuous per-frame loops (starfield, cursor lerp, pointer
     field easing) all check `isPageVisible` and stop scheduling
     the next frame while the tab is backgrounded, resuming on
     `visibilitychange`. A hidden tab has no business burning CPU
     on decorative animation.
   - The starfield — the most expensive single effect (a full
     -viewport canvas redraw) — is additionally capped to ~30fps.
     Slow ambient drift and twinkle look identical at 30fps; there
     is no reason to pay for 60.
   - Scroll-linked effects (the portal) recompute inside rAF, not
     directly on the scroll event, so fast/high-frequency scroll
     input collapses to at most one recalculation per rendered
     frame instead of once per raw scroll event.
   ============================================================= */

window.AuroraUI = window.AuroraUI || {};

(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isFinePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  var raf = window.requestAnimationFrame || function (fn) { return window.setTimeout(fn, 16); };

  var isPageVisible = document.visibilityState !== "hidden";
  document.addEventListener("visibilitychange", function () {
    isPageVisible = document.visibilityState !== "hidden";
  });

  /* ---------------------------------------------------------
     Shared pointer tracker — the ONE window-level pointermove
     listener for this whole module. Cursor, starfield parallax
     and the pointer field all read from `sharedPointer` instead
     of each registering their own listener.
     --------------------------------------------------------- */
  var sharedPointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  if (isFinePointer) {
    window.addEventListener("pointermove", function (evt) {
      sharedPointer.x = evt.clientX;
      sharedPointer.y = evt.clientY;
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     Starfield canvas — depth-parallax particle field
     --------------------------------------------------------- */
  function initStarfield() {
    var canvas = document.querySelector(".aur-spatial-canvas");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var stars = [];
    var w, h, dpr;
    var FRAME_INTERVAL = 1000 / 30; // cap the ambient background to ~30fps
    var lastFrameTime = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      var count = Math.min(160, Math.floor((w * h) / 9000));
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: 0.15 + Math.random() * 0.85,
          r: 0.4 + Math.random() * 1.6,
          twinkleOffset: Math.random() * Math.PI * 2,
          driftX: (Math.random() - 0.5) * 0.06,
          driftY: (Math.random() - 0.5) * 0.06
        });
      }
    }

    function drawStatic() {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      stars.forEach(function (s) {
        ctx.globalAlpha = 0.35 + s.z * 0.5;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * s.z, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    var t = 0;
    function render() {
      t += 0.032;
      ctx.clearRect(0, 0, w, h);
      var pointerX = isFinePointer ? (sharedPointer.x / w) * 2 - 1 : 0;
      var pointerY = isFinePointer ? (sharedPointer.y / h) * 2 - 1 : 0;
      var parallaxX = pointerX * 22;
      var parallaxY = pointerY * 22;

      stars.forEach(function (s) {
        s.x += s.driftX * 2;
        s.y += s.driftY * 2;
        if (s.x < -10) s.x = w + 10; else if (s.x > w + 10) s.x = -10;
        if (s.y < -10) s.y = h + 10; else if (s.y > h + 10) s.y = -10;

        var depthShift = (1 - s.z);
        var px = s.x + parallaxX * depthShift;
        var py = s.y + parallaxY * depthShift;
        var twinkle = 0.5 + Math.sin(t * 1.4 + s.twinkleOffset) * 0.5;

        ctx.globalAlpha = (0.25 + s.z * 0.55) * (0.6 + twinkle * 0.4);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(px, py, s.r * (0.6 + s.z * 0.8), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    function loop(now) {
      if (!isPageVisible) {
        raf(loop);
        return;
      }
      if (now - lastFrameTime >= FRAME_INTERVAL) {
        lastFrameTime = now;
        render();
      }
      raf(loop);
    }

    resize();
    seed();

    if (reduceMotion) {
      drawStatic();
    } else {
      raf(loop);
    }

    window.addEventListener("resize", function () {
      resize();
      seed();
      if (reduceMotion) drawStatic();
    });
  }

  /* ---------------------------------------------------------
     Global pointer field — broadcasts normalized pointer position
     as CSS custom properties on :root for any element to consume
     --------------------------------------------------------- */
  function initPointerField() {
    if (!isFinePointer || reduceMotion) return;
    var root = document.documentElement;
    var eased = { x: 0, y: 0 };
    var running = true;

    function tick() {
      if (!isPageVisible) {
        raf(tick);
        return;
      }
      var rawX = (sharedPointer.x / window.innerWidth) * 2 - 1;
      var rawY = (sharedPointer.y / window.innerHeight) * 2 - 1;
      eased.x += (rawX - eased.x) * 0.08;
      eased.y += (rawY - eased.y) * 0.08;
      root.style.setProperty("--field-x", eased.x.toFixed(3));
      root.style.setProperty("--field-y", eased.y.toFixed(3));
      if (running) raf(tick);
    }
    raf(tick);
  }

  /* ---------------------------------------------------------
     Custom cursor — lerp-following ring + dot
     --------------------------------------------------------- */
  function initCursor() {
    if (!isFinePointer) return;
    var cursor = document.querySelector(".aur-cursor");
    if (!cursor) return;
    var dot = cursor.querySelector(".aur-cursor__dot");
    var ring = cursor.querySelector(".aur-cursor__ring");

    document.body.classList.add("aur-cursor-active");

    var ringPos = { x: sharedPointer.x, y: sharedPointer.y };

    function tick() {
      if (!isPageVisible) {
        raf(tick);
        return;
      }
      dot.style.transform = "translate3d(" + sharedPointer.x + "px," + sharedPointer.y + "px,0)";
      if (!reduceMotion) {
        ringPos.x += (sharedPointer.x - ringPos.x) * 0.18;
        ringPos.y += (sharedPointer.y - ringPos.y) * 0.18;
      } else {
        ringPos.x = sharedPointer.x;
        ringPos.y = sharedPointer.y;
      }
      ring.style.transform = "translate3d(" + ringPos.x + "px," + ringPos.y + "px,0)";
      raf(tick);
    }
    raf(tick);

    /* Scoped to real interactive elements only; pointerover/out fire
       far less often than pointermove (only on boundary crossings),
       so delegating this one is fine. */
    document.addEventListener("pointerover", function (evt) {
      if (evt.target.closest && evt.target.closest("a, button, [data-cursor-hover]")) {
        cursor.classList.add("is-hovering");
      }
    });
    document.addEventListener("pointerout", function (evt) {
      if (evt.target.closest && evt.target.closest("a, button, [data-cursor-hover]")) {
        cursor.classList.remove("is-hovering");
      }
    });
  }

  /* ---------------------------------------------------------
     Portal — scroll-reactive 3D depth hero (reacts to normal
     scroll, never hijacks it)
     --------------------------------------------------------- */
  function initPortal() {
    var portal = document.querySelector(".aur-portal");
    if (!portal) return;
    var ticking = false;

    /* Recomputed inside rAF rather than directly on the scroll event:
       fast/trackpad scrolling can fire far more scroll events than
       there are frames to paint, so without this a single scroll
       gesture could trigger many redundant getBoundingClientRect +
       style writes whose results never even get shown on screen. */
    function update() {
      var rect = portal.getBoundingClientRect();
      var total = rect.height;
      var scrolled = Math.min(Math.max(-rect.top, 0), total);
      var progress = total > 0 ? scrolled / total : 0;
      portal.style.setProperty("--portal-progress", progress.toFixed(3));
      ticking = false;
    }

    update();
    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        raf(update);
      }
    }, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ---------------------------------------------------------
     Magnetic dock — icons scale based on cursor distance
     --------------------------------------------------------- */
  function initDock() {
    var dock = document.querySelector(".aur-dock");
    if (!dock || !isFinePointer || reduceMotion) return;
    var items = Array.prototype.slice.call(dock.querySelectorAll(".aur-dock__item"));

    dock.addEventListener("pointermove", function (evt) {
      items.forEach(function (item) {
        var rect = item.getBoundingClientRect();
        var center = rect.left + rect.width / 2;
        var dist = Math.abs(evt.clientX - center);
        var mag = Math.max(1, 1.7 - dist / 90);
        item.style.setProperty("--mag", mag.toFixed(2));
      });
    });

    dock.addEventListener("pointerleave", function () {
      items.forEach(function (item) { item.style.setProperty("--mag", 1); });
    });
  }

  /* ---------------------------------------------------------
     3D orbit carousel — drag to rotate, auto-spins when idle
     --------------------------------------------------------- */
  function initOrbitCarousel() {
    document.querySelectorAll(".aur-orbit-carousel").forEach(function (carousel) {
      var stage = carousel.querySelector(".aur-orbit-carousel__stage");
      if (!stage) return;
      var current = 0;
      var dragging = false;
      var startX = 0;
      var startAngle = 0;
      var n = parseInt(getComputedStyle(carousel).getPropertyValue("--n"), 10) || 6;

      if (!reduceMotion) stage.classList.add("is-auto-rotating");

      function setAngle(deg) {
        current = deg;
        stage.style.setProperty("--aur-ry", deg + "deg");
      }

      function syncCurrentFromComputedStyle() {
        /* While .is-auto-rotating is active, the CSS @keyframes drives
           --aur-ry directly and `current` (the JS-tracked angle) goes
           stale. Reconcile it with the live computed value before
           handing control back to JS, or the drag would snap the
           carousel back to wherever `current` last was. */
        var computed = getComputedStyle(stage).getPropertyValue("--aur-ry");
        var parsed = parseFloat(computed);
        if (!isNaN(parsed)) current = parsed;
      }

      function pause() {
        syncCurrentFromComputedStyle();
        stage.classList.remove("is-auto-rotating");
        stage.style.setProperty("--aur-ry", current + "deg");
      }

      stage.addEventListener("pointerdown", function (evt) {
        dragging = true;
        pause();
        startX = evt.clientX;
        startAngle = current;
        stage.classList.add("is-dragging");
        stage.setPointerCapture(evt.pointerId);
      });

      stage.addEventListener("pointermove", function (evt) {
        if (!dragging) return;
        var delta = evt.clientX - startX;
        setAngle(startAngle + delta * 0.4);
      });

      function endDrag() {
        if (!dragging) return;
        dragging = false;
        stage.classList.remove("is-dragging");
      }
      stage.addEventListener("pointerup", endDrag);
      stage.addEventListener("pointercancel", endDrag);

      carousel.querySelectorAll("[data-orbit-prev]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          pause();
          setAngle(current - 360 / n);
        });
      });
      carousel.querySelectorAll("[data-orbit-next]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          pause();
          setAngle(current + 360 / n);
        });
      });
    });
  }

  /* ---------------------------------------------------------
     Assemble-in — scattered cards settle into place on scroll
     --------------------------------------------------------- */
  function initAssemble() {
    var targets = document.querySelectorAll(".aur-assemble");
    if (!targets.length) return;
    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-assembled"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-assembled");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    targets.forEach(function (el) { io.observe(el); });
  }

  window.AuroraUI.spatial = {
    init: function () {
      initStarfield();
      initPointerField();
      initCursor();
      initPortal();
      initDock();
      initOrbitCarousel();
      initAssemble();
    }
  };
})();
