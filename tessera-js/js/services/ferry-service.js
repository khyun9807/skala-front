import { hashString } from "../utils/string.js";
import { createCacheManager } from "../storage/cache-manager.js";
import { resolveWithFallback } from "./provider-chain.js";

/** 선박/페리 정보 Adapter. Mock Provider가 기본이며 실제 API는 fetchRemoteFerry에 연결한다. */
const cache = createCacheManager("ferry-cache");

async function fetchRemoteFerry(/* originPort, destinationPort, date */) {
  throw new Error("실제 페리 API가 설정되지 않았습니다. ferry-service.js의 fetchRemoteFerry를 구현하세요.");
}

function mockFerry(originPort, destinationPort, date) {
  const seed = hashString(`${originPort}->${destinationPort}:${date}`);
  const departureHour = 7 + (seed % 10);
  const durationHours = 2 + (seed % 6);
  const pad = (n) => String(n).padStart(2, "0");
  return {
    originPort,
    destinationPort,
    date,
    departureTime: `${date}T${pad(departureHour)}:00:00`,
    arrivalTime: `${date}T${pad((departureHour + durationHours) % 24)}:00:00`,
    status: seed % 7 === 0 ? "결항" : "정상 운항",
    fare: 30_000 + (seed % 10) * 5_000,
    vehicleLoadingAvailable: seed % 2 === 0,
  };
}

export async function getFerryStatus(originPort, destinationPort, date) {
  const cacheKey = `${originPort}->${destinationPort}:${date}`;
  return resolveWithFallback("ferry", [
    { name: "remote", run: () => fetchRemoteFerry(originPort, destinationPort, date) },
    { name: "cache", run: async () => cache.get(cacheKey) },
    {
      name: "mock",
      run: async () => {
        const data = mockFerry(originPort, destinationPort, date);
        cache.set(cacheKey, data, { ttl: 30 * 60_000 });
        return data;
      },
    },
  ]);
}
