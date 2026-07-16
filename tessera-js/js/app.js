import { eventBus } from "./core/event-bus.js";
import { EVENTS } from "./config/constants.js";
import { createLifecycle } from "./core/lifecycle.js";
import { registerGlobalErrorHandlers } from "./core/errors.js";
import { logger } from "./core/logger.js";
import { localStore } from "./storage/local-storage.js";
import { globalShortcuts } from "./events/shortcuts.js";
import { createElement, qs, qsa } from "./dom/selector.js";
import { trackMaxScrollDepth } from "./events/scroll.js";
import { debounce } from "./utils/debounce.js";
import * as auth from "./features/auth.js";
import * as visitor from "./features/visitor.js";

/**
 * 모든 페이지가 공통으로 필요로 하는 부트스트랩(테마, 네비게이션, 토스트, 오프라인 배너,
 * 전역 단축키, 세션 워처, 방문자 추적, 전역 에러 훅)을 한 곳에 모았다.
 * 각 페이지의 js/pages/*.js 컨트롤러는 initApp()을 가장 먼저 호출한 뒤 페이지 고유 로직을 이어간다.
 */
const THEME_KEY = "theme";

const NAV_LINKS = [
  { href: "index.html", label: "홈" },
  { href: "pages/profile.html", label: "소개" },
  { href: "pages/blog.html", label: "블로그" },
  { href: "pages/schedule.html", label: "일정" },
  { href: "pages/travel.html", label: "여행" },
  { href: "pages/visitors.html", label: "방문자" },
  { href: "pages/playground.html", label: "Playground" },
];

/** basePath: 루트 index.html이면 "", pages/ 하위 페이지면 "../" */
function resolveHref(href, basePath) {
  if (basePath === "") return href;
  if (href === "index.html") return "../index.html";
  return href.replace(/^pages\//, "");
}

function renderNavbar(basePath) {
  const root = qs("#navbar-root");
  if (!root) return;
  const linkElements = NAV_LINKS.map((link) => createElement("a", { class: "navbar__link", href: resolveHref(link.href, basePath) }, [link.label]));
  const nav = createElement("header", { class: "navbar" }, [
    createElement("div", { class: "container navbar__inner" }, [
      createElement("a", { class: "navbar__brand", href: resolveHref("index.html", basePath) }, ["🔷 TesseraJS"]),
      createElement("nav", { class: "navbar__links", "aria-label": "주요 메뉴" }, linkElements),
      createElement("div", { class: "navbar__status row" }, [
        createElement("button", { type: "button", class: "btn btn--sm btn--ghost", "data-theme-toggle": true, "aria-label": "테마 전환" }, ["🌓"]),
        createElement("span", { id: "nav-auth-slot" }),
      ]),
    ]),
  ]);
  root.replaceWith(nav);
}

function renderFooter() {
  const root = qs("#footer-root");
  if (!root) return;
  const footer = createElement("footer", { class: "footer container" }, [
    createElement("p", {}, ["TesseraJS 데모 — 외부 라이브러리 없이 Vanilla JS로 제작"]),
  ]);
  root.replaceWith(footer);
}

function ensureToastStack() {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = createElement("div", { class: "toast-stack", "aria-live": "polite", role: "status" });
    document.body.appendChild(stack);
  }
  return stack;
}

export function renderToast(toast) {
  const stack = ensureToastStack();
  const el = createElement("div", { class: `toast toast--${toast.type ?? "info"}` }, [toast.message]);
  stack.appendChild(el);
  setTimeout(() => el.remove(), toast.duration ?? 4000);
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

function initThemeToggle(lifecycle) {
  const stored = localStore.get(THEME_KEY, null);
  if (stored) applyTheme(stored);
  const toggleBtn = qs("[data-theme-toggle]");
  if (toggleBtn) {
    lifecycle.addEventListener(toggleBtn, "click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      localStore.set(THEME_KEY, next);
    });
  }
}

function highlightActiveNavLink() {
  const current = window.location.pathname.split("/").pop() || "index.html";
  qsa(".navbar__link").forEach((link) => {
    const href = link.getAttribute("href")?.split("/").pop();
    if (href === current) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function renderAuthSlot() {
  const slot = qs("#nav-auth-slot");
  if (!slot) return;
  slot.textContent = "";
  const session = auth.getSession();
  if (session) {
    slot.appendChild(createElement("span", { class: "text-sm" }, [`${session.name}님`]));
    const logoutBtn = createElement("button", { class: "btn btn--sm btn--ghost", type: "button" }, ["로그아웃"]);
    logoutBtn.addEventListener("click", () => {
      auth.logout();
      renderAuthSlot();
      renderToast({ message: "로그아웃되었습니다.", type: "info" });
    });
    slot.appendChild(logoutBtn);
  } else {
    slot.appendChild(createElement("a", { class: "btn btn--sm", href: "login.html" }, ["로그인"]));
  }
}

function initOfflineBanner(lifecycle) {
  let banner = qs("#offline-banner");
  if (!banner) {
    banner = createElement("div", { id: "offline-banner", class: "offline-banner", hidden: true }, [
      "오프라인 상태입니다. 최근 캐시된 데이터를 표시합니다.",
    ]);
    document.body.insertBefore(banner, document.body.firstChild);
  }
  function update() {
    banner.hidden = navigator.onLine;
  }
  update();
  eventBus.on(EVENTS.NETWORK_ONLINE, update);
  eventBus.on(EVENTS.NETWORK_OFFLINE, update);
  lifecycle.onCleanup(() => {
    eventBus.off(EVENTS.NETWORK_ONLINE, update);
    eventBus.off(EVENTS.NETWORK_OFFLINE, update);
  });
}

function initGlobalShortcuts() {
  globalShortcuts.register("/", (event) => {
    event.preventDefault();
    qs("[data-search-input]")?.focus();
  }, { description: "검색창 포커스" });
  globalShortcuts.register("ctrl+k", () => qs("[data-search-input]")?.focus(), { description: "빠른 검색" });
  globalShortcuts.register("escape", () => document.dispatchEvent(new CustomEvent("tessera:escape")), {
    description: "모달/드롭다운 닫기",
    allowInInputs: true,
  });
  globalShortcuts.register("?", () =>
    renderToast({ message: "단축키 — / 검색, Ctrl+K 검색, Ctrl+S 저장, Esc 닫기, ? 도움말", type: "info", duration: 5000 }),
  { description: "단축키 안내" });
}

export function initApp({ pageName, basePath = "../", requireLogin = false } = {}) {
  const lifecycle = createLifecycle(pageName);
  registerGlobalErrorHandlers(logger);
  eventBus.on(EVENTS.TOAST_SHOW, renderToast);

  renderNavbar(basePath);
  renderFooter();
  initThemeToggle(lifecycle);
  highlightActiveNavLink();
  renderAuthSlot();
  initOfflineBanner(lifecycle);
  initGlobalShortcuts();

  const touchActivityDebounced = debounce(() => auth.touchActivity(), 1000);
  lifecycle.addEventListener(document, "click", touchActivityDebounced);
  lifecycle.addEventListener(document, "keydown", touchActivityDebounced);
  const stopSessionWatcher = auth.startSessionWatcher(lifecycle);
  lifecycle.onCleanup(stopSessionWatcher);
  eventBus.on(EVENTS.AUTH_SESSION_EXPIRING, () => renderToast({ message: "곧 자동 로그아웃됩니다.", type: "warning" }));
  eventBus.on(EVENTS.AUTH_SESSION_EXPIRED, () => {
    renderToast({ message: "세션이 만료되어 로그아웃되었습니다.", type: "warning" });
    renderAuthSlot();
  });
  eventBus.on(EVENTS.AUTH_LOGIN, renderAuthSlot);
  eventBus.on(EVENTS.AUTH_LOGOUT, renderAuthSlot);

  visitor.recordVisitStart(pageName);
  visitor.trackPageDuration(pageName, lifecycle);
  lifecycle.addEventListener(document, "click", () => visitor.logEvent({ type: "click" }));
  lifecycle.onCleanup(trackMaxScrollDepth((depth) => visitor.logEvent({ type: "scroll-depth", depth })));

  if (requireLogin && !auth.requireAuth()) {
    window.location.href = basePath === "" ? "pages/login.html" : "login.html";
  }

  return { lifecycle };
}
