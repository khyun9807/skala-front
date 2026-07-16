/**
 * HTTP 응답 캐시. TTL 만료, stale-while-revalidate, 동일 키 in-flight 요청 병합을 지원한다.
 * key가 같은 요청이 이미 진행 중이면 새 fetch를 또 만들지 않고 같은 Promise를 공유한다.
 */
export function createRequestCache({ defaultTtl = 60_000 } = {}) {
  const store = new Map(); // key -> { value, expiresAt }
  const inFlight = new Map(); // key -> Promise

  function buildKey(method, url, params) {
    return `${method}:${url}:${params ? JSON.stringify(params) : ""}`;
  }

  async function fetchWithCache(key, fetcher, { ttl = defaultTtl, staleWhileRevalidate = 0 } = {}) {
    const now = Date.now();
    const cached = store.get(key);

    if (cached && now < cached.expiresAt) {
      return { data: cached.value, fromCache: true, stale: false };
    }

    if (cached && staleWhileRevalidate > 0 && now < cached.expiresAt + staleWhileRevalidate) {
      if (!inFlight.has(key)) {
        const revalidation = fetcher()
          .then((value) => {
            store.set(key, { value, expiresAt: Date.now() + ttl });
            inFlight.delete(key);
            return value;
          })
          .catch((error) => {
            inFlight.delete(key);
            throw error;
          });
        inFlight.set(key, revalidation);
        revalidation.catch(() => {}); // 백그라운드 갱신 실패는 여기서 조용히 무시(호출자는 이미 stale 값을 받음)
      }
      return { data: cached.value, fromCache: true, stale: true };
    }

    if (inFlight.has(key)) {
      const value = await inFlight.get(key);
      return { data: value, fromCache: false, stale: false, deduped: true };
    }

    const promise = fetcher()
      .then((value) => {
        store.set(key, { value, expiresAt: Date.now() + ttl });
        inFlight.delete(key);
        return value;
      })
      .catch((error) => {
        inFlight.delete(key);
        throw error;
      });
    inFlight.set(key, promise);
    const value = await promise;
    return { data: value, fromCache: false, stale: false };
  }

  return {
    buildKey,
    fetchWithCache,
    invalidate(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
    getLastValue(key) {
      return store.get(key)?.value ?? null;
    },
    has(key) {
      return store.has(key);
    },
  };
}
