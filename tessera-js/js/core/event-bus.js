import { logger } from "./logger.js";

const MAX_HISTORY = 200;

/**
 * 컴포넌트 간 결합도를 낮추는 이벤트 버스.
 * - namespace 이벤트: "auth:login" 형태 자유롭게 사용
 * - wildcard 이벤트: "blog:*" 로 구독하면 "blog:"로 시작하는 모든 이벤트를 함께 받는다
 * - 리스너 우선순위: priority가 클수록 먼저 실행
 * - 에러 격리: 한 리스너에서 던진 예외가 다른 리스너 실행을 막지 않는다
 */
class EventBus {
  #listeners = new Map(); // event -> [{ handler, priority, once }]
  #history = [];
  #debug = false;

  #getBucket(event) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, []);
    return this.#listeners.get(event);
  }

  on(event, handler, { priority = 0 } = {}) {
    const bucket = this.#getBucket(event);
    const entry = { handler, priority, once: false };
    bucket.push(entry);
    bucket.sort((a, b) => b.priority - a.priority);
    return () => this.off(event, handler);
  }

  once(event, handler, options = {}) {
    const wrapped = (...args) => {
      this.off(event, wrapped);
      handler(...args);
    };
    return this.on(event, wrapped, options);
  }

  off(event, handler) {
    const bucket = this.#listeners.get(event);
    if (!bucket) return;
    const idx = bucket.findIndex((entry) => entry.handler === handler);
    if (idx !== -1) bucket.splice(idx, 1);
  }

  emit(event, payload) {
    this.#history.push({ event, payload, timestamp: Date.now() });
    if (this.#history.length > MAX_HISTORY) this.#history.shift();
    if (this.#debug) logger.debug("event-bus", `emit ${event}`, payload);

    const direct = this.#listeners.get(event) ?? [];
    const wildcardMatches = [];
    for (const [key, bucket] of this.#listeners.entries()) {
      if (key.endsWith(":*") && event.startsWith(key.slice(0, -1))) {
        wildcardMatches.push(...bucket);
      }
    }

    const all = [...direct, ...wildcardMatches].sort((a, b) => b.priority - a.priority);
    for (const { handler } of all) {
      try {
        handler(payload, event);
      } catch (error) {
        logger.error("event-bus", `listener for "${event}" threw`, { message: error.message });
      }
    }
  }

  setDebug(value) {
    this.#debug = Boolean(value);
  }

  getHistory() {
    return [...this.#history];
  }

  clearHistory() {
    this.#history = [];
  }

  /** 테스트/페이지 전환 시 특정 이벤트의 모든 리스너를 제거 */
  removeAllListeners(event) {
    if (event) this.#listeners.delete(event);
    else this.#listeners.clear();
  }
}

export function createEventBus() {
  return new EventBus();
}

/** 앱 전역에서 공유하는 단일 이벤트 버스 인스턴스(싱글턴은 이 모듈에만 제한적으로 적용) */
export const eventBus = new EventBus();
