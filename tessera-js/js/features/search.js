import { createWorkerClient } from "../workers/worker-client.js";
import { scoreSearch } from "./search-scoring.js";
import { localStore } from "../storage/local-storage.js";
import { debounce } from "../utils/debounce.js";
import { MAX_SEARCH_HISTORY } from "../config/constants.js";

const RECENT_KEY = "search-recent";

/** Worker를 지원하지 않으면 동일한 순수 함수(scoreSearch)를 메인 스레드에서 그대로 실행한다 */
const workerClient = createWorkerClient(new URL("../workers/search-worker.js", import.meta.url), {
  fallback: (type, payload) => {
    if (type === "search") return scoreSearch(payload);
    throw new Error(`지원하지 않는 폴백 작업: ${type}`);
  },
});

export async function search(query, items, fields) {
  return workerClient.run("search", { query, items, fields }, { timeout: 4000 });
}

export function createDebouncedSearch(handler, delay = 250) {
  return debounce(handler, delay);
}

export function recordSearchTerm(term) {
  if (!term?.trim()) return;
  const recent = localStore.get(RECENT_KEY, []);
  localStore.set(RECENT_KEY, [term, ...recent.filter((existing) => existing !== term)].slice(0, MAX_SEARCH_HISTORY));
}

export function getRecentSearches() {
  return localStore.get(RECENT_KEY, []);
}

export function clearSearchHistory() {
  localStore.remove(RECENT_KEY);
}

export function getPopularSearchesMock() {
  return ["여행 예산", "제주도", "포트폴리오", "일정 충돌", "블로그 초안"];
}

export function terminateSearchWorker() {
  workerClient.terminate();
}
