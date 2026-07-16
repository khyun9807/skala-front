import { NetworkError, TimeoutError, ApiError } from "../core/errors.js";
import { logger, maskSensitive } from "../core/logger.js";
import { eventBus } from "../core/event-bus.js";
import { withRetry } from "./retry-policy.js";
import { createRequestQueue } from "./request-queue.js";
import { createRequestCache } from "./request-cache.js";
import { HTTP_DEFAULTS, EVENTS } from "../config/constants.js";

function buildUrl(baseURL, path, query) {
  const url = new URL(path, baseURL || window.location.href);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function statusToError(status, message, url) {
  if (status === 408) return new TimeoutError(message);
  if (status >= 500 || status === 0) return new NetworkError(message, { status, url });
  return new ApiError(message, { status });
}

function shouldRetryError(error) {
  if (error instanceof TimeoutError) return true;
  if (error instanceof NetworkError) return true;
  if (error instanceof ApiError) return error.code === "API_ERROR" && [429, 502, 503, 504].includes(error.status);
  return false;
}

/**
 * Fetch API를 감싼 재사용 가능한 HTTP Client.
 * interceptor, timeout/취소, 재시도, 캐시, 동시성 제한, 오프라인 대응을 모두 포함한다.
 */
export function createHttpClient({
  baseURL = "",
  timeout = HTTP_DEFAULTS.TIMEOUT_MS,
  retry = HTTP_DEFAULTS.RETRY_COUNT,
  headers = {},
  maxConcurrent = HTTP_DEFAULTS.MAX_CONCURRENT,
} = {}) {
  const requestInterceptors = [];
  const responseInterceptors = [];
  const queue = createRequestQueue({ concurrency: maxConcurrent });
  const cache = createRequestCache({ defaultTtl: HTTP_DEFAULTS.CACHE_TTL_MS });
  let authTokenProvider = null;

  function useRequestInterceptor(fn) {
    requestInterceptors.push(fn);
    return () => {
      const idx = requestInterceptors.indexOf(fn);
      if (idx !== -1) requestInterceptors.splice(idx, 1);
    };
  }

  function useResponseInterceptor(fn) {
    responseInterceptors.push(fn);
    return () => {
      const idx = responseInterceptors.indexOf(fn);
      if (idx !== -1) responseInterceptors.splice(idx, 1);
    };
  }

  function setAuthTokenProvider(fn) {
    authTokenProvider = fn;
  }

  async function performFetch(config) {
    const controller = new AbortController();
    const externalSignal = config.signal;
    if (externalSignal) {
      if (externalSignal.aborted) controller.abort();
      else externalSignal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    const timeoutMs = config.timeout ?? timeout;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const url = buildUrl(baseURL, config.path, config.query);
    const finalHeaders = { ...headers, ...config.headers };
    if (authTokenProvider) {
      const token = authTokenProvider();
      if (token) finalHeaders.Authorization = `Bearer ${token}`;
    }

    let body;
    if (config.json !== undefined) {
      finalHeaders["Content-Type"] = "application/json";
      body = JSON.stringify(config.json);
    } else if (config.form !== undefined) {
      body = config.form; // FormData: 브라우저가 Content-Type(boundary 포함)을 자동 설정
    } else if (config.body !== undefined) {
      body = config.body;
    }

    logger.debug("http", `${config.method} ${url}`, maskSensitive({ query: config.query, json: config.json }));
    eventBus.emit(EVENTS.HTTP_LOADING_START, { url, method: config.method });

    try {
      let response;
      try {
        response = await fetch(url, {
          method: config.method,
          headers: finalHeaders,
          body,
          signal: controller.signal,
          credentials: config.credentials ?? "same-origin",
        });
      } catch (error) {
        if (controller.signal.aborted && !externalSignal?.aborted) {
          throw new TimeoutError(`요청이 ${timeoutMs}ms 안에 끝나지 않았습니다: ${url}`);
        }
        if (controller.signal.aborted) {
          const abortError = new Error("요청이 취소되었습니다.");
          abortError.name = "AbortError";
          throw abortError;
        }
        throw new NetworkError(`네트워크 요청 실패: ${url}`, { cause: error, url });
      }

      if (!response.ok) {
        throw statusToError(response.status, `HTTP ${response.status} ${response.statusText} (${url})`, url);
      }

      const responseType = config.responseType ?? guessResponseType(response);
      let data;
      if (responseType === "blob") data = await response.blob();
      else if (responseType === "text") data = await response.text();
      else if (responseType === "none") data = null;
      else {
        const text = await response.text();
        data = text ? JSON.parse(text) : null;
      }

      let result = { data, status: response.status, headers: response.headers };
      for (const interceptor of responseInterceptors) {
        result = (await interceptor(result, config)) ?? result;
      }
      return result;
    } finally {
      clearTimeout(timeoutId);
      eventBus.emit(EVENTS.HTTP_LOADING_END, { url, method: config.method });
    }
  }

  function guessResponseType(response) {
    const type = response.headers.get("content-type") ?? "";
    if (type.includes("application/json")) return "json";
    if (type.includes("text/")) return "text";
    return "json";
  }

  async function request(path, options = {}) {
    let config = { method: "GET", path, ...options };
    for (const interceptor of requestInterceptors) {
      config = (await interceptor(config)) ?? config;
    }

    const isGet = config.method === "GET";
    const cacheKey = cache.buildKey(config.method, config.path, config.query);
    const cacheOptions = config.cache;

    const runOnce = async () => {
      if (!navigator.onLine) {
        const lastValue = isGet ? cache.getLastValue(cacheKey) : null;
        if (lastValue) {
          logger.warn("http", `offline — serving last cached value for ${config.path}`);
          return lastValue;
        }
        throw new NetworkError("오프라인 상태입니다.", { url: config.path });
      }
      const result = await withRetry(() => performFetch(config), {
        retries: config.retry ?? retry,
        shouldRetry: shouldRetryError,
        onRetry: (error, attempt, delayMs) => logger.warn("http", `retry #${attempt + 1} for ${config.path} in ${delayMs}ms`, { message: error.message }),
      });
      return result;
    };

    const task = () =>
      queue.enqueue(async () => {
        if (isGet && cacheOptions?.enabled) {
          const { data } = await cache.fetchWithCache(cacheKey, runOnce, {
            ttl: cacheOptions.ttl ?? HTTP_DEFAULTS.CACHE_TTL_MS,
            staleWhileRevalidate: cacheOptions.staleWhileRevalidate ?? 0,
          });
          return data;
        }
        if (isGet) {
          // 캐시를 켜지 않아도 동일 GET 요청은 병합한다(ttl=0 → 완료 즉시 만료, in-flight 동안만 공유)
          const { data } = await cache.fetchWithCache(cacheKey, runOnce, { ttl: 0 });
          return data;
        }
        return runOnce();
      }, { priority: config.priority ?? 0 });

    try {
      return await task();
    } catch (error) {
      if (error.name === "AbortError") throw error;
      logger.error("http", `request failed: ${config.method} ${config.path}`, { message: error.message });
      throw error;
    }
  }

  return {
    request,
    get(path, options) {
      return request(path, { ...options, method: "GET" });
    },
    post(path, json, options) {
      return request(path, { ...options, method: "POST", json });
    },
    put(path, json, options) {
      return request(path, { ...options, method: "PUT", json });
    },
    patch(path, json, options) {
      return request(path, { ...options, method: "PATCH", json });
    },
    delete(path, options) {
      return request(path, { ...options, method: "DELETE" });
    },
    useRequestInterceptor,
    useResponseInterceptor,
    setAuthTokenProvider,
    invalidateCache(method, path, query) {
      cache.invalidate(cache.buildKey(method, path, query));
    },
    clearCache() {
      cache.clear();
    },
    get queueSize() {
      return queue.size;
    },
  };
}

/** 앱 전역에서 공유하는 기본 클라이언트(외부 API 서비스들이 baseURL을 바꿔 각자 인스턴스를 만들기도 한다) */
export const httpClient = createHttpClient({});
