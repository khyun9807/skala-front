/**
 * Intersection/Mutation/Resize Observer 공용 래퍼. 브라우저가 지원하지 않으면
 * 즉시 실행/폴링 기반 fallback으로 대체해 기능이 완전히 죽지 않게 한다.
 */
export function observeIntersection(targets, callback, options = {}) {
  const list = Array.isArray(targets) ? targets : [targets];
  if (!("IntersectionObserver" in window)) {
    list.forEach((target) => callback([{ target, isIntersecting: true }]));
    return { disconnect() {}, unobserve() {} };
  }
  const observer = new IntersectionObserver(callback, options);
  list.forEach((target) => observer.observe(target));
  return observer;
}

export function observeMutation(target, callback, options = { childList: true, subtree: true }) {
  if (!("MutationObserver" in window)) return { disconnect() {} };
  const observer = new MutationObserver(callback);
  observer.observe(target, options);
  return observer;
}

export function observeResize(target, callback) {
  if (!("ResizeObserver" in window)) {
    const handler = () => callback([{ target, contentRect: target.getBoundingClientRect() }]);
    window.addEventListener("resize", handler);
    handler();
    return {
      disconnect() {
        window.removeEventListener("resize", handler);
      },
    };
  }
  const observer = new ResizeObserver(callback);
  observer.observe(target);
  return observer;
}
