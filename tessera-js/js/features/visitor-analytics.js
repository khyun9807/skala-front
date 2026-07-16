/**
 * 순수 함수: 방문자 이벤트 로그를 페이지별 방문수/체류시간, 총 클릭수, 최대 스크롤 깊이로 집계한다.
 */
export function summarizeVisitorEvents(events) {
  const byPage = new Map();
  let totalClicks = 0;
  let maxScrollDepth = 0;

  for (const event of events) {
    if (event.type === "pageview") {
      const entry = byPage.get(event.page) ?? { page: event.page, visits: 0, durationMs: 0 };
      entry.visits += 1;
      byPage.set(event.page, entry);
    } else if (event.type === "duration") {
      const entry = byPage.get(event.page) ?? { page: event.page, visits: 0, durationMs: 0 };
      entry.durationMs += event.durationMs ?? 0;
      byPage.set(event.page, entry);
    } else if (event.type === "click") {
      totalClicks += 1;
    } else if (event.type === "scroll-depth") {
      maxScrollDepth = Math.max(maxScrollDepth, event.depth ?? 0);
    }
  }

  return {
    pages: Array.from(byPage.values()).sort((a, b) => b.visits - a.visits),
    totalClicks,
    maxScrollDepth,
    totalEvents: events.length,
  };
}
