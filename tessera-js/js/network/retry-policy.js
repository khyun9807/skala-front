/**
 * exponential backoff + random jitter로 재시도 지연 시간을 계산하고,
 * withRetry로 임의의 async 함수에 재시도를 씌운다. retries는 항상 유한하다(무한 루프 방지).
 */
export function computeBackoffDelay(attempt, { baseDelay = 300, maxDelay = 4000 } = {}) {
  const exponential = Math.min(maxDelay, baseDelay * 2 ** attempt);
  return Math.round(Math.random() * exponential);
}

export async function withRetry(fn, { retries = 2, baseDelay = 300, maxDelay = 4000, shouldRetry = () => true, onRetry = () => {} } = {}) {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn(attempt);
    } catch (error) {
      if (attempt >= retries || !shouldRetry(error, attempt)) throw error;
      const delay = computeBackoffDelay(attempt, { baseDelay, maxDelay });
      onRetry(error, attempt, delay);
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt += 1;
    }
  }
}
