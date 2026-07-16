/**
 * 동시 실행 개수를 제한하는 세마포어. HTTP 클라이언트의 "최대 동시 요청 수 제한"과
 * Worker 풀 등 다른 곳에서도 재사용할 수 있도록 범용으로 만들었다.
 */
export function createSemaphore(maxConcurrent = 4) {
  let active = 0;
  const waiting = [];

  function acquire() {
    if (active < maxConcurrent) {
      active += 1;
      return Promise.resolve();
    }
    return new Promise((resolve) => waiting.push(resolve));
  }

  function release() {
    active = Math.max(0, active - 1);
    const next = waiting.shift();
    if (next) {
      active += 1;
      next();
    }
  }

  return {
    acquire,
    release,
    get activeCount() {
      return active;
    },
    get waitingCount() {
      return waiting.length;
    },
  };
}
