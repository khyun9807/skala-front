import { scoreSearch } from "../features/search-scoring.js";

/**
 * 통합 검색 전용 모듈 Worker. 메인 스레드를 막지 않고 블로그/여행/일정/프로필/댓글을
 * 한꺼번에 스코어링한다. 실제 스코어링 로직은 features/search-scoring.js에만 있고,
 * 여기서는 그 순수 함수를 그대로 불러써서 메인 스레드 폴백과 동일한 결과를 보장한다.
 */
self.onmessage = (event) => {
  const { id, type, payload } = event.data;
  try {
    let result;
    if (type === "search") result = scoreSearch(payload);
    else throw new Error(`알 수 없는 작업 유형: ${type}`);
    self.postMessage({ id, result });
  } catch (error) {
    self.postMessage({ id, error: error.message });
  }
};
