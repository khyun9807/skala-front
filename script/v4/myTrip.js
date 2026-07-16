/**
 * [v4] myTrip.v4.html 전용 배선. 사진첩/오디오/비디오/캐러셀은 그대로 두고,
 * 사진첩의 3개 여행지(홋카이도/세부/리장)와 정확히 일치하는 tessera-js/data/travel-posts.json
 * 시드를 그대로 재사용해 "여행 계획 관리" 카드를 만든다.
 */
import "./toast.js";
import { showToast } from "../../tessera-js/js/features/notifications.js";
import { apiClient } from "../../tessera-js/js/network/api-client.js";
import * as travelFeature from "../../tessera-js/js/features/travel.js";
import { createChart } from "../../tessera-js/js/dom/canvas-charts.js";
import { getCurrentWeatherByCity, getWeatherWarning } from "../../tessera-js/js/services/weather-service.js";
import { convertCurrency } from "../../tessera-js/js/services/exchange-service.js";
import { formatDate } from "../../tessera-js/js/utils/date.js";

async function fetchJSON(path) {
  const { data } = await apiClient.get(path, { cache: { enabled: true, ttl: 5 * 60_000 } });
  return data;
}

function phaseLabel(progress) {
  if (progress.phase === "upcoming") return `여행까지 D-${progress.remaining.days}`;
  if (progress.phase === "ongoing") return `여행 ${progress.elapsed.days}일째 진행 중`;
  return "여행 완료";
}

function renderCard(trip, container) {
  const template = document.getElementById("v4-trip-card-template");
  const clone = template.content.cloneNode(true);
  const article = clone.querySelector("article");

  article.querySelector(".v4-trip-title").textContent = trip.title;
  article.querySelector(".v4-trip-meta").textContent = `${formatDate(trip.startDate)} ~ ${formatDate(trip.endDate)} · ${(trip.cities ?? []).join(", ")}`;

  const progress = travelFeature.computeProgress(trip);
  article.querySelector(".v4-trip-progress").textContent = phaseLabel(progress);

  const summary = travelFeature.computeBudgetSummary(trip, trip.budgetLimit);
  const canvas = article.querySelector(".v4-trip-chart");

  const checklistEl = article.querySelector(".v4-trip-checklist");
  (trip.checklist ?? []).forEach((item) => {
    const li = document.createElement("li");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.done;
    checkbox.addEventListener("change", () => {
      travelFeature.toggleChecklistItem(trip.id, item.id);
    });
    const label = document.createElement("label");
    label.className = "aur-checkbox";
    label.append(checkbox, document.createTextNode(` ${item.label}`));
    li.appendChild(label);
    checklistEl.appendChild(li);
  });

  const weatherBtn = article.querySelector(".v4-trip-weather-btn");
  const weatherResult = article.querySelector(".v4-trip-weather-result");
  weatherBtn.addEventListener("click", async () => {
    weatherBtn.disabled = true;
    weatherResult.textContent = "불러오는 중...";
    try {
      const city = trip.cities?.[0] ?? "Seoul";
      const [weatherEnvelope, exchangeEnvelope] = await Promise.all([getCurrentWeatherByCity(city), convertCurrency(1, "USD", trip.baseCurrency ?? "KRW")]);
      const warning = getWeatherWarning(weatherEnvelope.data);

      weatherResult.textContent = "";
      const weatherLine = document.createElement("p");
      weatherLine.textContent = `${city}: ${Math.round(weatherEnvelope.data.temperature)}°C · ${weatherEnvelope.data.condition} (provider: ${weatherEnvelope.provider})`;
      const exchangeLine = document.createElement("p");
      exchangeLine.textContent = `1 USD = ${Math.round(exchangeEnvelope.rate).toLocaleString()} ${trip.baseCurrency ?? "KRW"} (provider: ${exchangeEnvelope.provider})`;
      weatherResult.append(weatherLine, exchangeLine);
      if (warning) {
        const warningLine = document.createElement("p");
        warningLine.className = "aur-badge aur-badge--warning";
        warningLine.textContent = warning;
        weatherResult.appendChild(warningLine);
      }
    } catch (error) {
      weatherResult.textContent = "정보를 가져오지 못했습니다.";
    } finally {
      weatherBtn.disabled = false;
    }
  });

  const shareBtn = article.querySelector(".v4-trip-share-btn");
  const shareOutput = article.querySelector(".v4-trip-share-output");
  shareBtn.addEventListener("click", () => {
    shareOutput.value = travelFeature.generateShareText(trip);
    shareOutput.hidden = false;
  });

  article.querySelector(".v4-trip-backup-btn").addEventListener("click", () => {
    travelFeature.exportTravelJSON(trip);
    showToast(`"${trip.title}" 여행 데이터를 JSON으로 내보냈습니다.`, { type: "success" });
  });

  // <template> 클론은 DOM에 붙기 전까지 레이아웃이 없어 canvas의 getBoundingClientRect()가
  // 전부 0을 반환한다(도넛 반지름이 음수가 되어 그리기 실패) — 반드시 append 이후에 그린다.
  container.appendChild(clone);
  createChart(canvas, { type: "donut", labels: Object.keys(summary.categoryTotals), values: Object.values(summary.categoryTotals) });
}

async function init() {
  await travelFeature.seedTravelsIfEmpty(() => fetchJSON("../tessera-js/data/travel-posts.json"));
  const trips = await travelFeature.getAllTravels();
  const container = document.getElementById("v4-trip-cards");
  container.textContent = "";
  trips
    .slice()
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .forEach((trip) => renderCard(trip, container));
}

init();
