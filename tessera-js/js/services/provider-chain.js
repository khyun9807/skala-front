import { logger } from "../core/logger.js";
import { ApiError } from "../core/errors.js";

/**
 * 외부 API 실패 대비 공통 체인: Remote → Cached → Local JSON → Mock 순서로 시도한다.
 * providers: [{ name, run: async () => data }] — 앞에서부터 순서대로 시도하고, 실패하면 다음으로 넘어간다.
 * 반환값은 { provider, fetchedAt, data } 표준 봉투이며, 어떤 provider가 실제로 응답했는지 항상 알 수 있다.
 */
export async function resolveWithFallback(providerName, providers) {
  const errors = [];
  for (const provider of providers) {
    try {
      const data = await provider.run();
      if (data === null || data === undefined) continue;
      return { provider: provider.name, fetchedAt: new Date().toISOString(), data };
    } catch (error) {
      logger.warn("provider-chain", `${providerName}: "${provider.name}" provider failed`, { message: error.message });
      errors.push(error);
    }
  }
  throw new ApiError(`${providerName}의 모든 provider가 실패했습니다.`, { provider: providerName, cause: errors[0] });
}
