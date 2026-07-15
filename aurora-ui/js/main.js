/* =============================================================
   AURORA UI · main.js
   Page-level bootstrap for the demo (index.html). Hides the
   loading screen, boots the three engine modules in order, and
   wires up the handful of interactions that only make sense on
   this specific showcase page (sidebar drawer toggle, demo toast
   buttons, live progress/circular-progress demo controls).
   ============================================================= */

(function () {
  "use strict";

  function hideLoadingScreen() {
    var screen = document.querySelector(".aur-loading-screen");
    if (!screen) return;
    /* setTimeout, not requestAnimationFrame: this is a one-shot "wait
       briefly, then reveal" step, not per-frame visual work. rAF can be
       suspended indefinitely for a backgrounded/hidden tab, which would
       leave the loading screen stuck forever; a timer still fires. */
    window.setTimeout(function () {
      screen.classList.add("is-hidden");
    }, 700);
  }

  function initSidebarDrawer() {
    document.addEventListener("click", function (evt) {
      var toggle = evt.target.closest("[data-sidebar-toggle]");
      if (toggle) {
        var sidebar = document.querySelector(".aur-shell__sidebar");
        var backdrop = document.querySelector('[data-backdrop="sidebar"]');
        if (sidebar) sidebar.classList.toggle("is-open");
        if (backdrop) backdrop.classList.toggle("is-visible");
        return;
      }
      if (evt.target.matches('[data-backdrop="sidebar"]')) {
        var open = document.querySelector(".aur-shell__sidebar.is-open");
        if (open) open.classList.remove("is-open");
        evt.target.classList.remove("is-visible");
      }
    });
  }

  function initDemoToastButtons() {
    document.querySelectorAll("[data-demo-toast]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var type = btn.getAttribute("data-demo-toast");
        var messages = {
          success: "저장이 완료되었습니다.",
          warning: "저장 공간이 얼마 남지 않았어요.",
          danger: "요청을 처리하지 못했습니다.",
          info: "새로운 업데이트가 있습니다."
        };
        window.AuroraUI.components.showToast(messages[type] || "알림입니다.", type);
      });
    });
  }

  function initDemoLoadingButton() {
    document.querySelectorAll("[data-demo-loading]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        btn.setAttribute("data-loading", "true");
        window.setTimeout(function () {
          btn.removeAttribute("data-loading");
          window.AuroraUI.components.showToast("작업이 끝났습니다!", "success");
        }, 1800);
      });
    });
  }

  function initDemoProgressControls() {
    var bar = document.querySelector("[data-demo-progress]");
    var circle = document.querySelector("[data-demo-progress-circle]");
    document.querySelectorAll("[data-progress-step]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var delta = parseInt(btn.getAttribute("data-progress-step"), 10);
        if (bar) {
          var current = parseInt(bar.style.getPropertyValue("--val") || "40", 10);
          var next = Math.min(100, Math.max(0, current + delta));
          bar.style.setProperty("--val", next + "%");
          var label = bar.parentElement.querySelector("[data-demo-progress-label]");
          if (label) label.textContent = next + "%";
        }
        if (circle) {
          var pct = parseInt(getComputedStyle(circle).getPropertyValue("--pct"), 10) || 65;
          var nextPct = Math.min(100, Math.max(0, pct + delta));
          circle.style.setProperty("--pct", nextPct);
          var span = circle.querySelector("span");
          if (span) span.textContent = nextPct + "%";
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (window.AuroraUI.theme) window.AuroraUI.theme.init();
    if (window.AuroraUI.interactions) window.AuroraUI.interactions.init();
    if (window.AuroraUI.components) window.AuroraUI.components.init();
    if (window.AuroraUI.spatial) window.AuroraUI.spatial.init();

    initSidebarDrawer();
    initDemoToastButtons();
    initDemoLoadingButton();
    initDemoProgressControls();

    hideLoadingScreen();
  });
})();
