import { hashString } from "../utils/string.js";
import { createCacheManager } from "../storage/cache-manager.js";
import { resolveWithFallback } from "./provider-chain.js";
import { toggleFavorite, getFavorites } from "../features/favorites.js";

/** 항공편 정보 Adapter. 결제/예약은 구현하지 않으며 조회와 일정 연동까지만 지원한다. */
const cache = createCacheManager("flight-cache");

async function fetchRemoteFlight(/* flightNumber, date */) {
  throw new Error("실제 항공 API가 설정되지 않았습니다. flight-service.js의 fetchRemoteFlight를 구현하세요.");
}

function mockFlight(flightNumber, date) {
  const seed = hashString(`${flightNumber}:${date}`);
  const delayMinutes = seed % 5 === 0 ? 20 + (seed % 40) : 0;
  const airports = ["ICN", "NRT", "CDG", "LAX", "SIN"];
  const departureAirport = airports[seed % airports.length];
  const arrivalAirport = airports[(seed + 1) % airports.length];
  const baseHour = 6 + (seed % 14);
  const pad = (n) => String(n).padStart(2, "0");
  return {
    flightNumber,
    date,
    departureAirport,
    arrivalAirport,
    departureTime: `${date}T${pad(baseHour)}:00:00`,
    arrivalTime: `${date}T${pad((baseHour + 9) % 24)}:${pad(seed % 60)}:00`,
    delayMinutes,
    status: delayMinutes > 0 ? "지연" : "정상",
    terminal: `T${1 + (seed % 2)}`,
  };
}

export async function getFlightStatus(flightNumber, date) {
  const cacheKey = `${flightNumber}:${date}`;
  return resolveWithFallback("flight", [
    { name: "remote", run: () => fetchRemoteFlight(flightNumber, date) },
    { name: "cache", run: async () => cache.get(cacheKey) },
    {
      name: "mock",
      run: async () => {
        const data = mockFlight(flightNumber, date);
        cache.set(cacheKey, data, { ttl: 15 * 60_000 });
        return data;
      },
    },
  ]);
}

export function toggleFavoriteFlight(flightNumber) {
  return toggleFavorite("flight", flightNumber);
}

export function getFavoriteFlights() {
  return getFavorites("flight");
}
