import { StorageError } from "../core/errors.js";
import { logger } from "../core/logger.js";
import { STORAGE_NAMESPACE, STORAGE_VERSION } from "../config/constants.js";

/**
 * localStorage/sessionStorage 공용 래퍼 팩토리.
 * - namespace: 키 충돌 방지(`${namespace}:v${version}:${key}`)
 * - TTL: 만료된 값은 자동으로 null 취급하고 삭제
 * - JSON 직렬화 + 손상된 데이터 자동 복구(파싱 실패 시 삭제 후 fallback 반환)
 * - 버전이 바뀌면 migrate(oldEnvelope, oldVersion)로 변환하거나 그대로 폐기
 * - quota 초과(QuotaExceededError) 시 StorageError로 감싸서 던짐
 */
export function createWebStorageAdapter(area, { namespace = STORAGE_NAMESPACE, version = STORAGE_VERSION, migrate = null } = {}) {
  const prefix = `${namespace}:v${version}:`;

  function fullKey(key) {
    return `${prefix}${key}`;
  }

  function readEnvelope(key) {
    const raw = area.getItem(fullKey(key));
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      logger.warn("storage", `corrupted entry removed: ${key}`);
      area.removeItem(fullKey(key));
      return null;
    }
  }

  return {
    get(key, fallback = null) {
      // 이전 버전 키가 남아있으면 migrate를 시도(있을 때만)
      const envelope = readEnvelope(key);
      if (!envelope) {
        if (migrate) {
          for (let v = version - 1; v >= 0; v -= 1) {
            const oldRaw = area.getItem(`${namespace}:v${v}:${key}`);
            if (oldRaw != null) {
              try {
                const migrated = migrate(JSON.parse(oldRaw), v);
                if (migrated !== undefined) {
                  this.set(key, migrated);
                  area.removeItem(`${namespace}:v${v}:${key}`);
                  return migrated;
                }
              } catch {
                /* 마이그레이션 실패 시 무시하고 fallback 반환 */
              }
            }
          }
        }
        return fallback;
      }
      if (envelope.expiresAt && Date.now() > envelope.expiresAt) {
        area.removeItem(fullKey(key));
        return fallback;
      }
      return envelope.value;
    },

    set(key, value, { ttl = null } = {}) {
      const envelope = { value, expiresAt: ttl ? Date.now() + ttl : null, storedAt: Date.now() };
      try {
        area.setItem(fullKey(key), JSON.stringify(envelope));
      } catch (error) {
        const isQuota = error instanceof DOMException && (error.code === 22 || error.name === "QuotaExceededError");
        throw new StorageError(isQuota ? "storage quota exceeded" : `failed to persist "${key}"`, { cause: error });
      }
    },

    remove(key) {
      area.removeItem(fullKey(key));
    },

    has(key) {
      return this.get(key, Symbol("missing")) !== Symbol("missing") ? true : area.getItem(fullKey(key)) !== null;
    },

    keys() {
      const result = [];
      for (let i = 0; i < area.length; i += 1) {
        const k = area.key(i);
        if (k && k.startsWith(prefix)) result.push(k.slice(prefix.length));
      }
      return result;
    },

    clear() {
      for (const key of this.keys()) this.remove(key);
    },
  };
}

function isStorageAvailable(area) {
  try {
    const testKey = "__tessera_test__";
    area.setItem(testKey, "1");
    area.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/** 프라이빗 모드 등으로 storage를 못 쓸 때를 위한 메모리 폴백 */
function createMemoryFallback() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, v),
    removeItem: (k) => map.delete(k),
    get length() {
      return map.size;
    },
    key: (i) => Array.from(map.keys())[i] ?? null,
  };
}

const localArea = isStorageAvailable(window.localStorage) ? window.localStorage : createMemoryFallback();

export const localStore = createWebStorageAdapter(localArea, {
  namespace: STORAGE_NAMESPACE,
  version: STORAGE_VERSION,
  migrate: (oldValue) => oldValue, // 현재는 v1뿐이라 그대로 통과. 다음 버전에서 필드 변환 로직을 추가할 지점.
});
