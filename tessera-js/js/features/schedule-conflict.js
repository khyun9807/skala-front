import { timeRangesOverlap } from "../utils/date.js";

/**
 * 순수 함수: 일정 배열에서 서로 겹치는 쌍을 모두 찾는다.
 * DOM/브라우저 API에 의존하지 않아 메인 스레드와 Web Worker 양쪽에서 그대로 재사용한다.
 */
export function findConflicts(schedules) {
  const conflicts = [];
  for (let i = 0; i < schedules.length; i += 1) {
    for (let j = i + 1; j < schedules.length; j += 1) {
      const a = schedules[i];
      const b = schedules[j];
      if (timeRangesOverlap(a.startAt, a.endAt, b.startAt, b.endAt)) {
        conflicts.push({ a: a.id, b: b.id });
      }
    }
  }
  return conflicts;
}

export function hasConflict(candidate, others) {
  return others.some((other) => other.id !== candidate.id && timeRangesOverlap(candidate.startAt, candidate.endAt, other.startAt, other.endAt));
}
