/*
 * [JavaScript 심화 - 과제] 실시간 날씨 · 모듈 분리 (데이터 담당)
 *
 * weather.js를 데이터(weatherAPI.js) / 화면(realtimeInfo.js)으로 분리한 것 중
 * "데이터 담당" 모듈. Open-Meteo 무료 API를 fetch + async/await로 호출한다.
 *  - export async function 으로 함수를 내보내 realtimeInfo.js에서 import 한다.
 *  - 외부 API: https://api.open-meteo.com/v1/forecast
 */

// 사이드바 <select>에서 고를 도시 목록 (이름 + 위도/경도)
export const CITIES = [
  { key: "seoul", name: "서울", lat: 37.5665, lon: 126.9780 },
  { key: "gwangju", name: "광주", lat: 35.1595, lon: 126.8526 },
  { key: "busan", name: "부산", lat: 35.1796, lon: 129.0756 },
  { key: "jeju", name: "제주", lat: 33.4996, lon: 126.5312 },
  { key: "tokyo", name: "도쿄", lat: 35.6762, lon: 139.6503 }
];

// key로 도시 정보를 찾는다.
export function findCity(key) {
  return CITIES.find(function (city) {
    return city.key === key;
  });
}

/*
 * 위도/경도로 현재 기온·습도를 비동기로 가져온다.
 * 반환값: { temperature, humidity, unitTemp, unitHumidity }
 */
export async function fetchWeather(lat, lon) {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=" + lat +
    "&longitude=" + lon +
    "&current=temperature_2m,relative_humidity_2m";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("날씨 API 응답 오류: " + response.status);
  }

  const data = await response.json();
  const current = data.current || {};
  const units = data.current_units || {};

  return {
    temperature: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    unitTemp: units.temperature_2m || "°C",
    unitHumidity: units.relative_humidity_2m || "%"
  };
}
