import { createSemaphore } from "./rate-limiter.js";

/**
 * 우선순위 기반 요청 큐. 세마포어로 동시 실행 개수를 제한하고,
 * 대기 중인 작업 중 priority가 높은 것부터 실행한다.
 */
export function createRequestQueue({ concurrency = 4 } = {}) {
  const semaphore = createSemaphore(concurrency);
  const pending = [];
  let draining = false;

  async function drain() {
    if (draining) return;
    draining = true;
    while (pending.length > 0) {
      await semaphore.acquire();
      pending.sort((a, b) => b.priority - a.priority);
      const task = pending.shift();
      task.run().finally(() => semaphore.release());
    }
    draining = false;
  }

  function enqueue(taskFn, { priority = 0 } = {}) {
    return new Promise((resolve, reject) => {
      pending.push({
        priority,
        run: async () => {
          try {
            resolve(await taskFn());
          } catch (error) {
            reject(error);
          }
        },
      });
      drain();
    });
  }

  return {
    enqueue,
    get size() {
      return pending.length;
    },
    get active() {
      return semaphore.activeCount;
    },
  };
}
