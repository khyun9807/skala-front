import { indexedDb } from "../storage/indexed-db.js";
import { localStore } from "../storage/local-storage.js";
import { eventBus } from "../core/event-bus.js";
import { summarizeVisitorEvents } from "./visitor-analytics.js";
import { downloadJSON } from "../files/file-exporter.js";
import { OBJECT_STORES, EVENTS } from "../config/constants.js";

const STORE = OBJECT_STORES.VISITOR_EVENTS;
const STATS_KEY = "visitor-stats";
const CONSENT_KEY = "visitor-consent";

export function getConsent() {
  return localStore.get(CONSENT_KEY, false);
}

export function setConsent(value) {
  localStore.set(CONSENT_KEY, value);
}

export function getStats() {
  return localStore.get(STATS_KEY, { visitCount: 0, firstVisitAt: null, lastVisitAt: null, pagesViewed: [] });
}

export function recordVisitStart(pageName) {
  const stats = getStats();
  const isFirstVisit = stats.visitCount === 0;
  const updated = {
    ...stats,
    visitCount: stats.visitCount + 1,
    firstVisitAt: stats.firstVisitAt ?? new Date().toISOString(),
    lastVisitAt: new Date().toISOString(),
    pagesViewed: [...new Set([...stats.pagesViewed, pageName])],
  };
  localStore.set(STATS_KEY, updated);
  logEvent({ type: "pageview", page: pageName });
  return { ...updated, isFirstVisit };
}

/** fingerprinting을 피하기 위해 화면 크기/언어/테마/referrer 등 최소한의 정보만 읽는다 */
export function getEnvironmentInfo() {
  return {
    theme: document.documentElement.dataset.theme ?? "system",
    screenSize: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language,
    referrer: document.referrer || "(직접 방문)",
  };
}

export async function logEvent(event) {
  if (!getConsent() && event.type !== "pageview") return; // 동의 전에는 상세 이벤트(클릭/스크롤 등)를 기록하지 않는다
  const entry = { ...event, timestamp: Date.now() };
  await indexedDb.put(STORE, entry);
  eventBus.emit(EVENTS.VISITOR_TICK, entry);
}

/** 페이지 체류 시간을 beforeunload/visibilitychange 시점에 기록한다 */
export function trackPageDuration(pageName, lifecycle) {
  const startedAt = performance.now();
  function flush() {
    logEvent({ type: "duration", page: pageName, durationMs: performance.now() - startedAt });
  }
  lifecycle.addEventListener(window, "beforeunload", flush);
  lifecycle.addEventListener(document, "visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  lifecycle.onCleanup(flush);
  return flush;
}

export async function getRecentEvents(limit = 50) {
  const all = await indexedDb.getAll(STORE);
  return all.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

export async function getSummary() {
  const events = await indexedDb.getAll(STORE);
  return summarizeVisitorEvents(events);
}

export async function exportVisitorData() {
  const events = await indexedDb.getAll(STORE);
  downloadJSON({ stats: getStats(), events }, "visitor-data");
}

export async function clearVisitorData() {
  await indexedDb.clear(STORE);
  localStore.remove(STATS_KEY);
}

/** 브라우저만으로는 정확히 집계할 수 없는 항목들(README/방문자 페이지에 안내 문구로 노출) */
export function getServerRequiredFeatures() {
  return ["전체 사용자 수", "전체 페이지 조회 수", "여러 사용자 간 실시간 방문자 수", "국가별 방문자 수", "중복 제거한 순 방문자 수", "서버 로그 기반 통계"];
}

/** 실제 서버 API로 교체 가능한 Adapter 구조 — 지금은 Mock 데이터만 반환 */
export function getMockAggregateStats() {
  return { provider: "mock", totalUsers: 128, totalPageViews: 954, countries: { KR: 88, US: 20, JP: 20 } };
}
