/* =============================================================
   AURORA UI · theme.js
   Theme + accent color management: reads/writes localStorage,
   detects OS preference when the user hasn't chosen explicitly,
   and applies a short-lived transition class so switching never
   feels like a jarring flash.

   NOTE: a tiny inline script in <head> (see index.html) already
   applies the saved/detected theme BEFORE first paint, so there
   is no flash of the wrong theme. This file only wires up the
   *controls* (buttons/swatches) once the DOM is ready.
   ============================================================= */

window.AuroraUI = window.AuroraUI || {};

(function () {
  "use strict";

  var THEME_KEY = "aur-theme";
  var ACCENT_KEY = "aur-accent";
  var THEMES = ["dark", "light", "aurora", "mono", "cyber"];
  var ACCENTS = ["violet", "teal", "rose", "amber"];

  function safeGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (err) {
      return null;
    }
  }

  function safeSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (err) {
      /* localStorage unavailable (private mode / quota) — theme still
         applies for this page view, it just won't persist. */
    }
  }

  function withTransition(fn) {
    var root = document.documentElement;
    root.classList.add("aur-theme-transitioning");
    fn();
    window.setTimeout(function () {
      root.classList.remove("aur-theme-transitioning");
    }, 550);
  }

  function applyTheme(theme) {
    withTransition(function () {
      document.documentElement.setAttribute("data-theme", theme);
    });
    safeSet(THEME_KEY, theme);
    updateControls();
  }

  function applyAccent(accent) {
    withTransition(function () {
      document.documentElement.setAttribute("data-accent", accent);
    });
    safeSet(ACCENT_KEY, accent);
    updateControls();
  }

  function updateControls() {
    var currentTheme = document.documentElement.getAttribute("data-theme");
    var currentAccent = document.documentElement.getAttribute("data-accent");

    document.querySelectorAll("[data-theme-option]").forEach(function (btn) {
      var isActive = btn.getAttribute("data-theme-option") === currentTheme;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });

    document.querySelectorAll("[data-accent-option]").forEach(function (btn) {
      var isActive = btn.getAttribute("data-accent-option") === currentAccent;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });

    var themeLabel = document.querySelector("[data-current-theme-label]");
    if (themeLabel) themeLabel.textContent = currentTheme;
  }

  function cycleTheme() {
    var current = document.documentElement.getAttribute("data-theme");
    var idx = THEMES.indexOf(current);
    var next = THEMES[(idx + 1) % THEMES.length];
    applyTheme(next);
  }

  function init() {
    updateControls();

    document.addEventListener("click", function (evt) {
      var themeToggle = evt.target.closest("[data-theme-toggle]");
      if (themeToggle) {
        cycleTheme();
        return;
      }

      var themeOption = evt.target.closest("[data-theme-option]");
      if (themeOption) {
        applyTheme(themeOption.getAttribute("data-theme-option"));
        return;
      }

      var accentOption = evt.target.closest("[data-accent-option]");
      if (accentOption) {
        applyAccent(accentOption.getAttribute("data-accent-option"));
      }
    });

    /* Follow the OS theme live, but only while the user has never
       made an explicit choice on this device. */
    if (!safeGet(THEME_KEY) && window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: light)");
      var handler = function (e) {
        if (!safeGet(THEME_KEY)) {
          applyTheme(e.matches ? "light" : "dark");
        }
      };
      if (mq.addEventListener) mq.addEventListener("change", handler);
    }
  }

  window.AuroraUI.theme = {
    init: init,
    applyTheme: applyTheme,
    applyAccent: applyAccent,
    THEMES: THEMES,
    ACCENTS: ACCENTS
  };
})();
