const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** 모달/드로어 안에서 Tab 포커스가 밖으로 빠져나가지 않게 가둔다. 해제 함수를 반환. */
export function trapFocus(container) {
  function getFocusable() {
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
  }

  function handleKeydown(event) {
    if (event.key !== "Tab") return;
    const items = getFocusable();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  container.addEventListener("keydown", handleKeydown);
  getFocusable()[0]?.focus();
  return () => container.removeEventListener("keydown", handleKeydown);
}

let liveRegion = null;

/** 스크린리더에게 상태 변화를 알린다(저장 완료, 검색 결과 없음 등) */
export function announce(message, { politeness = "polite" } = {}) {
  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.className = "sr-only";
    document.body.appendChild(liveRegion);
  }
  liveRegion.setAttribute("aria-live", politeness);
  liveRegion.textContent = "";
  requestAnimationFrame(() => {
    liveRegion.textContent = message;
  });
}

export function setAria(el, attrs) {
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined) el.removeAttribute(`aria-${key}`);
    else el.setAttribute(`aria-${key}`, String(value));
  }
}
