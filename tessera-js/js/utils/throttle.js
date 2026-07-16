/**
 * interval(ms)마다 최대 한 번만 실행되는 throttle. 스크롤/리사이즈처럼 빈번히
 * 발생하는 이벤트의 처리 빈도를 제한할 때 쓴다. trailing 호출로 마지막 값도 반영한다.
 */
export function throttle(fn, interval = 200) {
  let lastCall = 0;
  let trailingTimer = null;
  let lastArgs = null;

  function throttled(...args) {
    lastArgs = args;
    const now = Date.now();
    const remaining = interval - (now - lastCall);
    if (remaining <= 0) {
      lastCall = now;
      fn(...args);
    } else if (!trailingTimer) {
      trailingTimer = setTimeout(() => {
        lastCall = Date.now();
        trailingTimer = null;
        fn(...lastArgs);
      }, remaining);
    }
  }

  throttled.cancel = () => {
    clearTimeout(trailingTimer);
    trailingTimer = null;
  };

  return throttled;
}
