import { apiClient } from "../network/api-client.js";
import { createCacheManager } from "../storage/cache-manager.js";
import { resolveWithFallback } from "./provider-chain.js";
import { apiConfig } from "../config/api-config.example.js";

/**
 * 날씨 서비스. 기본 Remote Provider는 API Key가 필요 없는 Open-Meteo(HTTPS, CORS 허용, 무료 무제한에
 * 가까운 사용량 제한)다. Key가 필요한 일반적인 날씨 API(OpenWeatherMap 등)로 바꾸고 싶다면
 * apiConfig.weather.provider/apiKey를 교체하고 fetchOpenMeteoCurrent 자리에 새 fetch 함수를 추가하면 된다.
 */
const cache = createCacheManager("weather-cache");

const WEATHER_CODE_MAP = {
  0: "맑음",
  1: "대체로 맑음",
  2: "부분적으로 흐림",
  3: "흐림",
  45: "안개",
  48: "짙은 안개",
  51: "약한 이슬비",
  53: "이슬비",
  55: "강한 이슬비",
  61: "약한 비",
  63: "비",
  65: "강한 비",
  71: "약한 눈",
  73: "눈",
  75: "강한 눈",
  80: "약한 소나기",
  81: "소나기",
  82: "강한 소나기",
  95: "뇌우",
};

function describeWeatherCode(code) {
  return WEATHER_CODE_MAP[code] ?? "알 수 없음";
}

function normalizeCurrentWeather(raw) {
  return {
    temperature: raw.current_weather.temperature,
    apparentTemperature: raw.hourly?.apparent_temperature?.[0] ?? raw.current_weather.temperature,
    condition: describeWeatherCode(raw.current_weather.weathercode),
    windSpeedKph: raw.current_weather.windspeed,
    precipitationProbability: raw.hourly?.precipitation_probability?.[0] ?? null,
    sunrise: raw.daily?.sunrise?.[0] ?? null,
    sunset: raw.daily?.sunset?.[0] ?? null,
  };
}

async function fetchOpenMeteoCurrent({ latitude, longitude }) {
  const url = `${apiConfig.weather.baseUrl}/forecast`;
  const { data } = await apiClient.get(url, {
    query: {
      latitude,
      longitude,
      current_weather: true,
      hourly: "apparent_temperature,precipitation_probability",
      daily: "sunrise,sunset",
      timezone: "auto",
    },
    timeout: 6000,
  });
  return normalizeCurrentWeather(data);
}

export async function geocodeCity(cityName) {
  const url = `${apiConfig.weather.geocodingUrl}/search`;
  const { data } = await apiClient.get(url, { query: { name: cityName, count: 1, language: "ko", format: "json" } });
  const first = data.results?.[0];
  if (!first) throw new Error(`"${cityName}" 도시를 찾을 수 없습니다.`);
  return { latitude: first.latitude, longitude: first.longitude, name: first.name, country: first.country };
}

function mockWeather() {
  return { temperature: 22, apparentTemperature: 21, condition: "맑음(Mock)", windSpeedKph: 8, precipitationProbability: 10, sunrise: null, sunset: null };
}

export async function getCurrentWeatherByCoords(latitude, longitude) {
  const cacheKey = `coords:${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  return resolveWithFallback("weather", [
    {
      name: "open-meteo",
      run: async () => {
        const data = await fetchOpenMeteoCurrent({ latitude, longitude });
        cache.set(cacheKey, data, { ttl: 30 * 60_000 });
        return data;
      },
    },
    { name: "cache", run: async () => cache.get(cacheKey) },
    { name: "mock", run: async () => mockWeather() },
  ]);
}

export async function getCurrentWeatherByCity(cityName) {
  const cacheKey = `city:${cityName}`;
  return resolveWithFallback("weather", [
    {
      name: "open-meteo",
      run: async () => {
        const location = await geocodeCity(cityName);
        const data = await fetchOpenMeteoCurrent(location);
        const withLocation = { ...data, location };
        cache.set(cacheKey, withLocation, { ttl: 30 * 60_000 });
        return withLocation;
      },
    },
    { name: "cache", run: async () => cache.get(cacheKey) },
    { name: "mock", run: async () => mockWeather() },
  ]);
}

export async function getForecast(latitude, longitude, days = 5) {
  const cacheKey = `forecast:${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  return resolveWithFallback("weather-forecast", [
    {
      name: "open-meteo",
      run: async () => {
        const url = `${apiConfig.weather.baseUrl}/forecast`;
        const { data } = await apiClient.get(url, {
          query: {
            latitude,
            longitude,
            daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode,sunrise,sunset",
            timezone: "auto",
            forecast_days: days,
          },
        });
        const forecast = data.daily.time.map((date, i) => ({
          date,
          tempMax: data.daily.temperature_2m_max[i],
          tempMin: data.daily.temperature_2m_min[i],
          precipitationProbability: data.daily.precipitation_probability_max[i],
          condition: describeWeatherCode(data.daily.weathercode[i]),
          sunrise: data.daily.sunrise[i],
          sunset: data.daily.sunset[i],
        }));
        cache.set(cacheKey, forecast, { ttl: 60 * 60_000 });
        return forecast;
      },
    },
    { name: "cache", run: async () => cache.get(cacheKey) },
    { name: "mock", run: async () => [{ date: new Date().toISOString().slice(0, 10), tempMax: 24, tempMin: 16, precipitationProbability: 20, condition: "맑음(Mock)" }] },
  ]);
}

export function getWeatherForDate(forecastDays, targetDateIso) {
  const targetDay = targetDateIso.slice(0, 10);
  return forecastDays.find((day) => day.date === targetDay) ?? null;
}

export function getWeatherWarning(weatherData) {
  if (weatherData.precipitationProbability != null && weatherData.precipitationProbability >= 60) {
    return `강수 확률 ${weatherData.precipitationProbability}% — 우산을 챙기세요.`;
  }
  if (weatherData.windSpeedKph >= 40) return `풍속 ${weatherData.windSpeedKph}km/h — 강풍에 주의하세요.`;
  return null;
}

/** 반드시 사용자 버튼 클릭 핸들러 안에서만 호출한다(권한 동의 없이 자동 호출 금지) */
export function getCurrentPositionOnce() {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("이 브라우저는 위치 정보를 지원하지 않습니다."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      (error) => reject(new Error(`위치 정보를 가져오지 못했습니다: ${error.message}`)),
      { timeout: 8000 }
    );
  });
}
