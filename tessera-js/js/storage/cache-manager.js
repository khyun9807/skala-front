import { localStore } from "./local-storage.js";

/**
 * localStorage 위에 얹는 2단(메모리 + localStorage) 캐시 파사드.
 * 외부 API 서비스들이 "마지막 성공 응답"을 저장해뒀다가 오프라인/실패 시 폴백으로 쓰는 용도.
 */
export function createCacheManager(namespace) {
  const memory = new Map();

  function key(k) {
    return `${namespace}:${k}`;
  }

  return {
    get(k, fallback = null) {
      const cacheKey = key(k);
      if (memory.has(cacheKey)) return memory.get(cacheKey);
      const value = localStore.get(cacheKey, fallback);
      if (value !== fallback) memory.set(cacheKey, value);
      return value;
    },

    set(k, value, { ttl = null, persist = true } = {}) {
      const cacheKey = key(k);
      memory.set(cacheKey, value);
      if (persist) localStore.set(cacheKey, value, { ttl });
    },

    remove(k) {
      const cacheKey = key(k);
      memory.delete(cacheKey);
      localStore.remove(cacheKey);
    },

    has(k) {
      return memory.has(key(k)) || localStore.has(key(k));
    },
  };
}
