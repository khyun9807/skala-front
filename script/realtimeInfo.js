/*
 * [JavaScript 심화 - 과제] 실시간 날씨 · 모듈 분리 (화면 담당)
 *
 * weatherAPI.js에서 데이터 함수를 import 하여 DOM/이벤트를 처리하는 "화면 담당" 모듈.
 * index.v3.html 에서 <script type="module" src="../script/realtimeInfo.js"></script> 로 로드된다.
 *
 * 동작 흐름 (과제 3단계를 한 파일에 통합):
 *  1) DOM/이벤트  : <select id="city-select"> change 시 도시 이름 + 위도/경도를 innerHTML로 표시
 *  2) 비동기 호출 : "실시간 날씨 로딩 중... ⏳" 표시 → fetch/async-await 로 온도·습도 표시
 *  3) 모듈 분리  : 데이터 요청은 weatherAPI.js(import)가 담당
 */

import { CITIES, findCity, fetchWeather } from "./weatherAPI.js";

const selectEl = document.getElementById("city-select");
const boxEl = document.getElementById("weather-box");

// select가 없는 페이지에서 이 모듈이 로드돼도 안전하게 무시한다.
if (selectEl && boxEl) {
  // 1) 도시 목록으로 <option> 채우기
  CITIES.forEach(function (city) {
    const option = document.createElement("option");
    option.value = city.key;
    option.textContent = city.name;
    selectEl.appendChild(option);
  });

  // 2) 도시가 바뀔 때마다 실행
  selectEl.addEventListener("change", updateWeather);

  // 첫 화면 안내
  boxEl.innerHTML = '<p class="aur-text-muted">도시를 선택하면 실시간 날씨를 보여드려요. 🌤️</p>';
}

async function updateWeather(event) {
  const city = findCity(event.target.value);
  if (!city) {
    boxEl.innerHTML = '<p class="aur-text-muted">도시를 선택해 주세요.</p>';
    return;
  }

  // (DOM 조작) 먼저 도시 이름 + 위도/경도 좌표부터 즉시 표시
  const coordsHtml =
    "<p><strong>📍 " + city.name + "</strong></p>" +
    '<p class="aur-text-muted">위도 ' + city.lat + " / 경도 " + city.lon + "</p>";

  // (비동기) 로딩 메시지 표시
  boxEl.innerHTML = coordsHtml + "<p>실시간 날씨 로딩 중... ⏳</p>";

  try {
    const weather = await fetchWeather(city.lat, city.lon);
    boxEl.innerHTML =
      coordsHtml +
      '<p class="aur-mt-2">🌡️ 기온: <strong>' + weather.temperature + weather.unitTemp + "</strong></p>" +
      "<p>💧 습도: <strong>" + weather.humidity + weather.unitHumidity + "</strong></p>";
  } catch (error) {
    boxEl.innerHTML =
      coordsHtml +
      '<p class="aur-text-danger">날씨 정보를 불러오지 못했어요. 😢 잠시 후 다시 시도해 주세요.</p>';
    console.error(error);
  }
}
