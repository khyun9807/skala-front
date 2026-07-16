import { hashString } from "../utils/string.js";
import { createCacheManager } from "../storage/cache-manager.js";
import { resolveWithFallback } from "./provider-chain.js";

/**
 * 교통 정보 Adapter. 실제 대중교통/내비게이션 API는 국가/서비스마다 인증키와 CORS 제약이 달라
 * 기본으로는 호출하지 않는다. 실제 API를 연결하려면 fetchRemoteRoute만 구현하면 되고,
 * Mock Provider가 항상 마지막 안전망으로 남아있어 API Key가 없어도 데모가 동작한다.
 */
const cache = createCacheManager("transport-cache");

async function fetchRemoteRoute(/* origin, destination, mode */) {
  throw new Error("실제 교통 API가 설정되지 않았습니다. transport-service.js의 fetchRemoteRoute를 구현하세요.");
}

function mockRoute(origin, destination) {
  const seed = hashString(`${origin}->${destination}`);
  const drivingMinutes = 20 + (seed % 100);
  const transitMinutes = Math.round(drivingMinutes * 1.4);
  const walkingMinutes = Math.round(drivingMinutes * 4.5);
  const congestionLevels = ["원활", "서행", "혼잡"];
  return {
    origin,
    destination,
    drivingMinutes,
    transitMinutes,
    walkingMinutes,
    congestionLevel: congestionLevels[seed % congestionLevels.length],
  };
}

export async function getRouteInfo(origin, destination, { mode = "transit" } = {}) {
  const cacheKey = `${origin}->${destination}:${mode}`;
  return resolveWithFallback("transport", [
    { name: "remote", run: () => fetchRemoteRoute(origin, destination, mode) },
    { name: "cache", run: async () => cache.get(cacheKey) },
    {
      name: "mock",
      run: async () => {
        const data = mockRoute(origin, destination);
        cache.set(cacheKey, data, { ttl: 30 * 60_000 });
        return data;
      },
    },
  ]);
}
