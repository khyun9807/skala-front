import { eventBus } from "./event-bus.js";

/**
 * History API 기반 경량 SPA 라우터. 이 프로젝트의 데모 자체는 여러 HTML 페이지(MPA)로
 * 구성되지만, playground.html 안의 "미니 SPA 라우터 데모" 섹션에서 이 라우터로 동작하는
 * 가상 하위 화면을 보여준다(README에 MPA vs SPA 라우팅 차이를 설명).
 */
function matchRoute(pattern, pathname) {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;
  const params = {};
  for (let i = 0; i < patternParts.length; i += 1) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];
    if (patternPart.startsWith(":")) {
      params[patternPart.slice(1)] = decodeURIComponent(pathPart);
    } else if (patternPart !== pathPart) {
      return null;
    }
  }
  return params;
}

export function createRouter({ root = "" } = {}) {
  const routes = [];
  const scrollPositions = new Map();
  let notFoundHandler = null;

  function register(pattern, handler, { guard = null } = {}) {
    routes.push({ pattern, handler, guard });
    return () => {
      const idx = routes.findIndex((route) => route.pattern === pattern && route.handler === handler);
      if (idx !== -1) routes.splice(idx, 1);
    };
  }

  function setNotFound(handler) {
    notFoundHandler = handler;
  }

  function parseQuery(search) {
    return Object.fromEntries(new URLSearchParams(search));
  }

  function currentPath() {
    return window.location.pathname.replace(root, "") || "/";
  }

  function saveScroll() {
    scrollPositions.set(currentPath(), window.scrollY);
  }

  function restoreScroll(path) {
    window.scrollTo(0, scrollPositions.get(path) ?? 0);
  }

  async function resolve(pathname, search) {
    const query = parseQuery(search);
    for (const route of routes) {
      const params = matchRoute(route.pattern, pathname);
      if (!params) continue;
      if (route.guard) {
        const allowed = await route.guard({ params, query });
        if (!allowed) return;
      }
      eventBus.emit("router:before-change", { pathname });
      await route.handler({ params, query });
      eventBus.emit("router:after-change", { pathname });
      return;
    }
    notFoundHandler?.({ pathname });
  }

  function navigate(path, { replace = false } = {}) {
    saveScroll();
    if (replace) window.history.replaceState({}, "", root + path);
    else window.history.pushState({}, "", root + path);
    resolve(currentPath(), window.location.search);
    restoreScroll(path);
  }

  function goHash(hash) {
    window.location.hash = hash;
  }

  function handlePopstate() {
    resolve(currentPath(), window.location.search);
    restoreScroll(currentPath());
  }

  function handleHashchange() {
    eventBus.emit("router:hash-change", { hash: window.location.hash });
  }

  window.addEventListener("popstate", handlePopstate);
  window.addEventListener("hashchange", handleHashchange);

  function start() {
    resolve(currentPath(), window.location.search);
  }

  function destroy() {
    window.removeEventListener("popstate", handlePopstate);
    window.removeEventListener("hashchange", handleHashchange);
  }

  return {
    register,
    setNotFound,
    navigate,
    goHash,
    start,
    destroy,
    get currentPath() {
      return currentPath();
    },
  };
}

/** 로그인이 필요한 라우트에 붙이는 guard 팩토리 */
export function requireAuthGuard(isLoggedInFn, onDenied) {
  return ({ params, query }) => {
    if (isLoggedInFn()) return true;
    onDenied?.({ params, query });
    return false;
  };
}
