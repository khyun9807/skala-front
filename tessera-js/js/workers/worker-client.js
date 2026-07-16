import { generateId } from "../utils/security.js";

/**
 * Web Worker 요청/응답을 요청 ID로 매칭해주는 클라이언트.
 * Worker를 지원하지 않는 환경에서는 fallback(메인 스레드 함수)으로 대체한다.
 */
export function createWorkerClient(workerUrl, { fallback } = {}) {
  const supportsWorker = typeof Worker !== "undefined";
  let worker = null;
  const pending = new Map();

  if (supportsWorker) {
    worker = new Worker(workerUrl, { type: "module" });
    worker.onmessage = (event) => {
      const { id, result, error } = event.data;
      const entry = pending.get(id);
      if (!entry) return;
      clearTimeout(entry.timeoutId);
      pending.delete(id);
      if (error) entry.reject(new Error(error));
      else entry.resolve(result);
    };
    worker.onerror = (event) => {
      for (const entry of pending.values()) {
        clearTimeout(entry.timeoutId);
        entry.reject(new Error(event.message ?? "Worker error"));
      }
      pending.clear();
    };
  }

  async function run(type, payload, { timeout = 8000 } = {}) {
    if (!supportsWorker) {
      if (!fallback) throw new Error("이 브라우저는 Web Worker를 지원하지 않고 fallback도 등록되지 않았습니다.");
      return fallback(type, payload);
    }
    const id = generateId("task");
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`Worker 작업 "${type}"이(가) ${timeout}ms 안에 끝나지 않았습니다.`));
      }, timeout);
      pending.set(id, { resolve, reject, timeoutId });
      worker.postMessage({ id, type, payload });
    });
  }

  function terminate() {
    worker?.terminate();
    for (const entry of pending.values()) clearTimeout(entry.timeoutId);
    pending.clear();
  }

  return {
    run,
    terminate,
    get isUsingWorker() {
      return supportsWorker;
    },
  };
}
