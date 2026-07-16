import { throttle } from "../utils/throttle.js";

export function onScroll(handler, { target = window, interval = 100 } = {}) {
  const throttled = throttle(handler, interval);
  target.addEventListener("scroll", throttled, { passive: true });
  return () => target.removeEventListener("scroll", throttled);
}

export function getScrollDepthRatio() {
  const scrollTop = window.scrollY;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  return scrollable > 0 ? Math.min(1, scrollTop / scrollable) : 0;
}

/** 방문 중 도달한 최대 스크롤 깊이를 추적(방문자 분석용) */
export function trackMaxScrollDepth(onUpdate) {
  let maxDepth = 0;
  return onScroll(() => {
    const depth = getScrollDepthRatio();
    if (depth > maxDepth) {
      maxDepth = depth;
      onUpdate(maxDepth);
    }
  });
}

/** articleEl의 스크롤 진행률(0~1)을 계산(블로그 상세 읽기 진행률) */
export function trackReadingProgress(articleEl, onUpdate) {
  return onScroll(
    () => {
      const rect = articleEl.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 0));
      onUpdate(total > 0 ? scrolled / total : 1);
    },
    { interval: 50 }
  );
}
