import { initApp, renderToast } from "../app.js";
import { qs, createElement, renderLoadingState, renderErrorState } from "../dom/selector.js";
import { createChart } from "../dom/canvas-charts.js";
import { formatDate } from "../utils/date.js";
import { formatCurrency } from "../utils/number.js";
import * as travelFeature from "../features/travel.js";
import { getCurrentWeatherByCity, getWeatherWarning } from "../services/weather-service.js";
import { convertCurrency, convertExpensesToBase } from "../services/exchange-service.js";
import { getRouteInfo } from "../services/transport-service.js";
import { getFlightStatus, toggleFavoriteFlight, getFavoriteFlights } from "../services/flight-service.js";
import { getFerryStatus } from "../services/ferry-service.js";

initApp({ pageName: "travel-detail" });

const params = new URLSearchParams(window.location.search);
const tripId = params.get("id");
let trip = null;
let chartHandle = null;

function renderHeader() {
  const el = qs("#travel-detail-header");
  const progress = travelFeature.computeProgress(trip);
  el.textContent = "";
  el.appendChild(createElement("h1", {}, [trip.title]));
  el.appendChild(createElement("p", { class: "text-muted" }, [`${formatDate(trip.startDate)} ~ ${formatDate(trip.endDate)} · ${(trip.cities ?? []).join(", ")}`]));

  let phaseText = "여행 완료";
  if (progress.phase === "upcoming") phaseText = `여행까지 D-${progress.remaining.days}`;
  else if (progress.phase === "ongoing") phaseText = `여행 ${progress.elapsed.days}일째 진행 중`;
  el.appendChild(createElement("p", {}, [phaseText]));

  if (progress.phase === "completed") {
    qs("#review-section").hidden = false;
    if (trip.review) qs("#review-input").value = trip.review;
  }
}

function initWeather() {
  const cityInput = qs("#weather-city");
  cityInput.value = trip.cities?.[0] ?? "Seoul";
  async function check() {
    const el = qs("#weather-result");
    renderLoadingState(el);
    try {
      const envelope = await getCurrentWeatherByCity(cityInput.value);
      const warning = getWeatherWarning(envelope.data);
      el.textContent = "";
      el.appendChild(createElement("p", {}, [`${Math.round(envelope.data.temperature)}°C(체감 ${Math.round(envelope.data.apparentTemperature)}°C) · ${envelope.data.condition}`]));
      el.appendChild(createElement("p", { class: "text-muted text-sm" }, [`강수확률 ${envelope.data.precipitationProbability ?? "-"}% · 풍속 ${envelope.data.windSpeedKph}km/h`]));
      el.appendChild(createElement("p", { class: "provider-badge" }, [`provider: ${envelope.provider}`]));
      if (warning) el.appendChild(createElement("p", { class: "badge badge--warning" }, [warning]));
    } catch (error) {
      renderErrorState(el, { message: "날씨 정보를 가져오지 못했습니다.", onRetry: check });
    }
  }
  qs("#weather-check-btn").addEventListener("click", check);
  check();
}

function initExchange() {
  qs("#exchange-currency-label").textContent = `${trip.baseCurrency ?? "KRW"} 기준`;
  async function check() {
    const el = qs("#exchange-result");
    renderLoadingState(el);
    try {
      const amount = Number(qs("#exchange-amount").value) || 0;
      const firstForeign = trip.expenses?.find((expense) => expense.currency !== (trip.baseCurrency ?? "KRW"))?.currency ?? "JPY";
      const envelope = await convertCurrency(amount, firstForeign, trip.baseCurrency ?? "KRW");
      el.textContent = "";
      el.appendChild(createElement("p", {}, [`${amount} ${firstForeign} = ${formatCurrency(envelope.converted, envelope.to)}`]));
      el.appendChild(createElement("p", { class: "provider-badge" }, [`provider: ${envelope.provider} · ${envelope.data.date}`]));
    } catch (error) {
      renderErrorState(el, { message: "환율 정보를 가져오지 못했습니다.", onRetry: check });
    }
  }
  qs("#exchange-check-btn").addEventListener("click", check);
  check();
}

function initTransport() {
  qs("#transport-origin").value = trip.cities?.[0] ?? "";
  qs("#transport-destination").value = trip.cities?.[1] ?? trip.cities?.[0] ?? "";
  qs("#transport-check-btn").addEventListener("click", async () => {
    const el = qs("#transport-result");
    renderLoadingState(el);
    const envelope = await getRouteInfo(qs("#transport-origin").value, qs("#transport-destination").value);
    el.textContent = "";
    el.appendChild(createElement("p", {}, [`자동차 ${envelope.data.drivingMinutes}분 · 대중교통 ${envelope.data.transitMinutes}분 · 도보 ${envelope.data.walkingMinutes}분`]));
    el.appendChild(createElement("p", {}, [`혼잡도: ${envelope.data.congestionLevel}`]));
    el.appendChild(createElement("p", { class: "provider-badge" }, [`provider: ${envelope.provider}`]));
  });
}

function initFlight() {
  qs("#flight-check-btn").addEventListener("click", async () => {
    const flightNumber = qs("#flight-number").value.trim();
    if (!flightNumber) return;
    const el = qs("#flight-result");
    renderLoadingState(el);
    const envelope = await getFlightStatus(flightNumber, trip.startDate);
    el.textContent = "";
    el.appendChild(createElement("p", {}, [`${envelope.data.departureAirport} → ${envelope.data.arrivalAirport} · ${envelope.data.status}`]));
    el.appendChild(createElement("p", { class: "text-sm" }, [`출발 ${envelope.data.departureTime} / 도착 ${envelope.data.arrivalTime} / ${envelope.data.terminal}`]));
    const isFav = getFavoriteFlights().includes(flightNumber);
    const favBtn = createElement("button", { class: "btn btn--sm", type: "button" }, [isFav ? "★ 즐겨찾기 해제" : "☆ 즐겨찾기"]);
    favBtn.addEventListener("click", () => {
      toggleFavoriteFlight(flightNumber);
      favBtn.textContent = getFavoriteFlights().includes(flightNumber) ? "★ 즐겨찾기 해제" : "☆ 즐겨찾기";
    });
    el.appendChild(favBtn);
    el.appendChild(createElement("p", { class: "provider-badge" }, [`provider: ${envelope.provider}`]));
  });
}

function initFerry() {
  qs("#ferry-check-btn").addEventListener("click", async () => {
    const el = qs("#ferry-result");
    renderLoadingState(el);
    const envelope = await getFerryStatus(qs("#ferry-origin").value, qs("#ferry-destination").value, trip.startDate);
    el.textContent = "";
    el.appendChild(createElement("p", {}, [`${envelope.data.status} · 요금 ${envelope.data.fare.toLocaleString()}원`]));
    el.appendChild(
      createElement("p", { class: "text-sm" }, [`출항 ${envelope.data.departureTime} / 도착 ${envelope.data.arrivalTime} · 차량 선적 ${envelope.data.vehicleLoadingAvailable ? "가능" : "불가"}`])
    );
    el.appendChild(createElement("p", { class: "provider-badge" }, [`provider: ${envelope.provider}`]));
  });
}

async function renderBudget() {
  const summary = travelFeature.computeBudgetSummary(trip, trip.budgetLimit);
  const canvas = qs("#budget-chart");
  const labels = Object.keys(summary.categoryTotals);
  const values = Object.values(summary.categoryTotals);
  if (chartHandle) chartHandle.update({ labels, values });
  else chartHandle = createChart(canvas, { type: "donut", labels, values });

  const el = qs("#budget-summary");
  el.textContent = "";
  el.appendChild(createElement("p", {}, [`합계: ${summary.total.toLocaleString()} ${trip.baseCurrency ?? "KRW"}`]));
  if (summary.overBudget) el.appendChild(createElement("p", { class: "badge badge--danger" }, ["예산 초과!"]));
  else if (summary.remaining != null) el.appendChild(createElement("p", { class: "text-muted" }, [`남은 예산: ${summary.remaining.toLocaleString()}`]));
}

function initExpenseForm() {
  qs("#expense-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    await travelFeature.addExpense(tripId, {
      category: formData.get("category"),
      amount: Number(formData.get("amount")),
      currency: formData.get("currency"),
    });
    trip = await travelFeature.getTravelById(tripId);
    const convertedExpenses = await convertExpensesToBase(trip.expenses, trip.baseCurrency ?? "KRW");
    trip = await travelFeature.updateTravel(tripId, { expenses: convertedExpenses });
    event.target.reset();
    await renderBudget();
    renderToast({ message: "지출을 추가했습니다.", type: "success" });
  });
  qs("#expense-export-csv").addEventListener("click", () => travelFeature.exportExpensesCSV(trip));
}

function renderChecklist() {
  const el = qs("#checklist-list");
  el.textContent = "";
  (trip.checklist ?? []).forEach((item) => {
    const checkbox = createElement("input", { type: "checkbox" });
    checkbox.checked = item.done;
    checkbox.addEventListener("change", async () => {
      trip = await travelFeature.toggleChecklistItem(tripId, item.id);
      renderChecklist();
    });
    el.appendChild(
      createElement("li", { class: "checklist-item", "data-done": String(item.done) }, [checkbox, createElement("span", { class: "checklist-item__label" }, [item.label])])
    );
  });
}

function initChecklistForm() {
  qs("#checklist-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = qs("#checklist-input");
    if (!input.value.trim()) return;
    trip = await travelFeature.addChecklistItem(tripId, input.value.trim());
    input.value = "";
    renderChecklist();
  });
}

function initSummaryShare() {
  const summary = travelFeature.generateSummary(trip);
  qs("#travel-summary").textContent = `${summary.title} · ${summary.durationDays}일 · 방문 도시 ${summary.cityCount}곳 · 상태: ${summary.phase}`;
  qs("#share-text-btn").addEventListener("click", () => {
    qs("#share-text-output").value = travelFeature.generateShareText(trip);
  });
  qs("#backup-json-btn").addEventListener("click", () => travelFeature.exportTravelJSON(trip));
}

function initReview() {
  qs("#review-save-btn").addEventListener("click", async () => {
    trip = await travelFeature.updateTravel(tripId, { review: qs("#review-input").value, status: "completed" });
    renderToast({ message: "후기를 저장했습니다.", type: "success" });
  });
}

/** 시드 데이터의 지출 항목 중 amountBase가 없는(=아직 환산 안 된) 것이 있으면 한 번 환산해 채운다 */
async function ensureExpensesConverted() {
  const needsConversion = (trip.expenses ?? []).some((expense) => expense.amountBase === undefined);
  if (!needsConversion) return;
  const convertedExpenses = await convertExpensesToBase(trip.expenses, trip.baseCurrency ?? "KRW");
  trip = await travelFeature.updateTravel(tripId, { expenses: convertedExpenses });
}

async function init() {
  trip = await travelFeature.getTravelById(tripId);
  if (!trip) {
    renderToast({ message: "여행 정보를 찾을 수 없습니다.", type: "error" });
    return;
  }
  await ensureExpensesConverted();
  renderHeader();
  initWeather();
  initExchange();
  initTransport();
  initFlight();
  initFerry();
  await renderBudget();
  initExpenseForm();
  renderChecklist();
  initChecklistForm();
  initSummaryShare();
  initReview();
}

init();
