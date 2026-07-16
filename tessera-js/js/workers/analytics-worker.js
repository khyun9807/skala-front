import { findConflicts } from "../features/schedule-conflict.js";
import { rankRecommendations } from "../features/travel-scoring.js";
import { summarizeVisitorEvents } from "../features/visitor-analytics.js";
import { parseCSV } from "../files/csv.js";

/**
 * 무거운 집계/계산 전용 Worker. 방문자 이벤트 집계, 대량 일정 충돌 검사, 여행 추천 점수,
 * CSV 파싱처럼 항목 수가 많아질 수 있는 작업을 메인 스레드 밖에서 처리한다.
 */
self.onmessage = (event) => {
  const { id, type, payload } = event.data;
  try {
    let result;
    switch (type) {
      case "check-conflicts":
        result = findConflicts(payload.schedules);
        break;
      case "recommend":
        result = rankRecommendations(payload.candidates, payload.preferences);
        break;
      case "summarize-visitors":
        result = summarizeVisitorEvents(payload.events);
        break;
      case "parse-csv":
        result = parseCSV(payload.text);
        break;
      default:
        throw new Error(`알 수 없는 작업 유형: ${type}`);
    }
    self.postMessage({ id, result });
  } catch (error) {
    self.postMessage({ id, error: error.message });
  }
};
