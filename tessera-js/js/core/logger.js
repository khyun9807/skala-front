import { MAX_LOG_ENTRIES } from "../config/constants.js";

const LEVELS = ["debug", "info", "warn", "error"];
const SENSITIVE_KEYS = ["password", "token", "accessToken", "apiKey", "secret", "hash"];

/**
 * 민감한 키의 값을 마스킹한 얕은 복사본을 반환한다(로그/네트워크 로그 공용).
 */
export function maskSensitive(payload) {
  if (payload === null || typeof payload !== "object") return payload;
  const clone = Array.isArray(payload) ? [...payload] : { ...payload };
  for (const key of Object.keys(clone)) {
    if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
      clone[key] = "***";
    } else if (typeof clone[key] === "object" && clone[key] !== null) {
      clone[key] = maskSensitive(clone[key]);
    }
  }
  return clone;
}

/**
 * 모듈 이름이 붙은 구조화 로거. 개발 모드에서만 debug를 콘솔에 출력하고,
 * 최근 MAX_LOG_ENTRIES개의 로그를 메모리에 보관해 JSON으로 내보낼 수 있다.
 */
class Logger {
  #entries = [];
  #devMode;

  constructor({ devMode = true } = {}) {
    this.#devMode = devMode;
  }

  #record(level, moduleName, message, data) {
    const entry = {
      level,
      moduleName,
      message,
      data: data ? maskSensitive(data) : undefined,
      timestamp: new Date().toISOString(),
    };
    this.#entries.push(entry);
    if (this.#entries.length > MAX_LOG_ENTRIES) this.#entries.shift();

    const consoleFn = console[level] ?? console.log;
    if (level === "debug" && !this.#devMode) return entry;
    consoleFn(`[${entry.timestamp}] [${moduleName}] ${message}`, data ?? "");
    return entry;
  }

  debug(moduleName, message, data) {
    return this.#record("debug", moduleName, message, data);
  }

  info(moduleName, message, data) {
    return this.#record("info", moduleName, message, data);
  }

  warn(moduleName, message, data) {
    return this.#record("warn", moduleName, message, data);
  }

  error(moduleName, message, data) {
    return this.#record("error", moduleName, message, data);
  }

  getEntries() {
    return [...this.#entries];
  }

  clear() {
    this.#entries = [];
  }

  exportJSON() {
    return JSON.stringify(this.#entries, null, 2);
  }

  setDevMode(value) {
    this.#devMode = Boolean(value);
  }
}

export const logger = new Logger({ devMode: true });
export { LEVELS };
