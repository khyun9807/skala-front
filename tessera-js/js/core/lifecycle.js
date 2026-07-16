/**
 * 페이지(또는 컴포넌트) 단위의 정리(cleanup) 레지스트리.
 * setTimeout/setInterval/addEventListener/Worker 등 "해제가 필요한" 리소스를
 * 등록해두면 destroy() 한 번으로 전부 해제할 수 있다. beforeunload에서도 자동 호출된다.
 */
export function createLifecycle(scopeName = "page") {
  const timeouts = new Set();
  const intervals = new Set();
  const rafs = new Set();
  const listeners = []; // { target, type, handler, options }
  const disposers = []; // 임의의 정리 함수(워커 종료, observer.disconnect 등)
  let destroyed = false;

  function guard() {
    if (destroyed) throw new Error(`[lifecycle:${scopeName}] already destroyed`);
  }

  const api = {
    setTimeout(fn, delay, ...args) {
      guard();
      const id = window.setTimeout((...a) => {
        timeouts.delete(id);
        fn(...a);
      }, delay, ...args);
      timeouts.add(id);
      return id;
    },
    clearTimeout(id) {
      window.clearTimeout(id);
      timeouts.delete(id);
    },
    setInterval(fn, delay, ...args) {
      guard();
      const id = window.setInterval(fn, delay, ...args);
      intervals.add(id);
      return id;
    },
    clearInterval(id) {
      window.clearInterval(id);
      intervals.delete(id);
    },
    requestAnimationFrame(fn) {
      guard();
      const id = window.requestAnimationFrame((t) => {
        rafs.delete(id);
        fn(t);
      });
      rafs.add(id);
      return id;
    },
    cancelAnimationFrame(id) {
      window.cancelAnimationFrame(id);
      rafs.delete(id);
    },
    addEventListener(target, type, handler, options) {
      guard();
      target.addEventListener(type, handler, options);
      listeners.push({ target, type, handler, options });
    },
    onCleanup(fn) {
      guard();
      disposers.push(fn);
      return fn;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      for (const id of timeouts) window.clearTimeout(id);
      for (const id of intervals) window.clearInterval(id);
      for (const id of rafs) window.cancelAnimationFrame(id);
      for (const { target, type, handler, options } of listeners) {
        target.removeEventListener(type, handler, options);
      }
      for (const dispose of disposers.splice(0)) {
        try {
          dispose();
        } catch (error) {
          console.error(`[lifecycle:${scopeName}] cleanup failed`, error);
        }
      }
    },
    isDestroyed() {
      return destroyed;
    },
  };

  window.addEventListener("beforeunload", api.destroy, { once: true });
  return api;
}
