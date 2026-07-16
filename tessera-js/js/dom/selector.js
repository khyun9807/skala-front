/**
 * DOM 조회/생성/클래스/이벤트 위임을 위한 저수준 유틸리티.
 * 반복적인 querySelector 호출과 리스너 남발을 줄이기 위한 얇은 래퍼.
 */

export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

/**
 * 태그/속성/자식을 한 번에 지정해 요소를 생성한다. children의 문자열은
 * 항상 textContent로 들어가므로(안전) HTML 삽입이 필요하면 별도 노드를 children으로 넘긴다.
 */
export function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === "class" || key === "className") {
      el.className = value;
    } else if (key === "dataset") {
      Object.assign(el.dataset, value);
    } else if (key.startsWith("on") && typeof value === "function") {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === true) {
      el.setAttribute(key, "");
    } else {
      el.setAttribute(key, String(value));
    }
  }
  const list = Array.isArray(children) ? children : [children];
  for (const child of list) {
    if (child === null || child === undefined) continue;
    el.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return el;
}

export function addClass(el, ...classNames) {
  el?.classList.add(...classNames);
}

export function removeClass(el, ...classNames) {
  el?.classList.remove(...classNames);
}

export function toggleClass(el, className, force) {
  return el?.classList.toggle(className, force);
}

/**
 * 이벤트 위임: root 하나에만 리스너를 걸고, event.target이 selector에 매칭되면 handler(event, matchedEl) 호출.
 */
export function delegate(root, eventType, selector, handler, options) {
  const listener = (event) => {
    const matched = event.target.closest(selector);
    if (matched && root.contains(matched)) handler(event, matched);
  };
  root.addEventListener(eventType, listener, options);
  return () => root.removeEventListener(eventType, listener, options);
}

export function show(el) {
  if (el) el.hidden = false;
}

export function hide(el) {
  if (el) el.hidden = true;
}

export function toggle(el, force) {
  if (!el) return;
  el.hidden = force === undefined ? !el.hidden : !force;
}

let scrollLockCount = 0;
let savedScrollY = 0;

/** body 스크롤 잠금(모달/드로어용). 중첩 호출을 카운트로 관리한다. */
export function lockScroll() {
  if (scrollLockCount === 0) {
    savedScrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.width = "100%";
  }
  scrollLockCount += 1;
}

export function unlockScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, savedScrollY);
  }
}

export function isInViewport(el, offset = 0) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight - offset && rect.bottom > offset && rect.left < window.innerWidth && rect.right > 0;
}

export function renderEmptyState(root, { message = "표시할 데이터가 없습니다.", icon = "🗒️" } = {}) {
  root.textContent = "";
  root.appendChild(
    createElement("div", { class: "state state--empty", role: "status" }, [
      createElement("span", { class: "state__icon", "aria-hidden": "true" }, [icon]),
      createElement("p", { class: "state__message" }, [message]),
    ])
  );
}

export function renderLoadingState(root, { message = "불러오는 중입니다..." } = {}) {
  root.textContent = "";
  root.appendChild(
    createElement("div", { class: "state state--loading", role: "status", "aria-live": "polite" }, [
      createElement("span", { class: "spinner", "aria-hidden": "true" }),
      createElement("p", { class: "state__message" }, [message]),
    ])
  );
}

export function renderErrorState(root, { message = "문제가 발생했습니다.", onRetry = null } = {}) {
  root.textContent = "";
  const children = [
    createElement("span", { class: "state__icon", "aria-hidden": "true" }, ["⚠️"]),
    createElement("p", { class: "state__message" }, [message]),
  ];
  if (onRetry) {
    children.push(createElement("button", { class: "btn btn--sm", type: "button", onclick: onRetry }, ["다시 시도"]));
  }
  root.appendChild(createElement("div", { class: "state state--error", role: "alert" }, children));
}
