/**
 * 마지막 호출 후 delay(ms)가 지나야 실행되는 debounce. 검색 입력처럼
 * "타이핑이 멈추면 한 번만" 실행하고 싶을 때 사용한다. cancel/flush를 지원한다.
 */
export function debounce(fn, delay = 300) {
  let timerId = null;
  let lastArgs = null;

  function debounced(...args) {
    lastArgs = args;
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      timerId = null;
      fn(...lastArgs);
    }, delay);
  }

  debounced.cancel = () => {
    clearTimeout(timerId);
    timerId = null;
  };

  debounced.flush = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
      fn(...lastArgs);
    }
  };

  return debounced;
}
