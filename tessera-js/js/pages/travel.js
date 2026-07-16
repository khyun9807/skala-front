import { initApp, renderToast } from "../app.js";
import { qs, createElement, renderEmptyState } from "../dom/selector.js";
import { apiClient } from "../network/api-client.js";
import { formatDate, remainingTime } from "../utils/date.js";
import * as travelFeature from "../features/travel.js";

initApp({ pageName: "travel" });

async function fetchJSON(path) {
  const { data } = await apiClient.get(path, { cache: { enabled: true, ttl: 5 * 60_000 } });
  return data;
}

let allTravels = [];

function renderTravelCard(trip) {
  const progress = travelFeature.computeProgress(trip);
  const summary = travelFeature.computeBudgetSummary(trip, trip.budgetLimit);
  const statusLabel = { upcoming: `D-${progress.remaining?.days ?? 0}`, ongoing: "여행 중", completed: "완료" }[progress.phase];

  const deleteBtn = createElement("button", { class: "btn btn--sm btn--danger", type: "button" }, ["삭제"]);
  deleteBtn.addEventListener("click", async () => {
    if (!window.confirm(`"${trip.title}" 여행을 삭제할까요?`)) return;
    await travelFeature.deleteTravel(trip.id);
    renderToast({ message: "삭제되었습니다.", type: "info" });
    await refresh();
  });

  return createElement("article", { class: "card" }, [
    createElement("div", { class: "travel-card__cover", style: trip.cover ? `background-image:url(${trip.cover}); background-size:cover;` : "" }),
    createElement("h3", {}, [createElement("a", { href: `travel-detail.html?id=${trip.id}` }, [trip.title])]),
    createElement("p", { class: "text-sm text-muted" }, [`${formatDate(trip.startDate)} ~ ${formatDate(trip.endDate)} · ${(trip.cities ?? []).join(", ")}`]),
    createElement("div", { class: "row" }, [
      createElement("span", { class: "badge badge--success" }, [statusLabel]),
      summary.overBudget ? createElement("span", { class: "badge badge--danger" }, ["예산 초과"]) : null,
    ]),
    createElement("p", { class: "text-sm" }, [`예상 지출 합계(기준통화): ${summary.total.toLocaleString()} ${trip.baseCurrency ?? "KRW"}`]),
    deleteBtn,
  ]);
}

function renderList() {
  const el = qs("#travel-list");
  el.textContent = "";
  if (!allTravels.length) {
    renderEmptyState(el, { message: "등록된 여행이 없습니다." });
    return;
  }
  allTravels
    .slice()
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .forEach((trip) => el.appendChild(renderTravelCard(trip)));
}

async function refresh() {
  allTravels = await travelFeature.getAllTravels();
  renderList();
}

function initForm() {
  qs("#travel-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const cities = String(formData.get("cities") ?? "")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    await travelFeature.createTravel({
      title: formData.get("title"),
      cities,
      baseCurrency: formData.get("baseCurrency"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      budgetLimit: formData.get("budgetLimit") ? Number(formData.get("budgetLimit")) : null,
      durationDays: Math.round((new Date(formData.get("endDate")) - new Date(formData.get("startDate"))) / 86_400_000),
    });
    event.target.reset();
    renderToast({ message: "여행을 추가했습니다.", type: "success" });
    await refresh();
  });
}

function initRecommend() {
  qs("#recommend-btn").addEventListener("click", () => {
    const budget = Number(qs("#recommend-budget").value) || undefined;
    const durationDays = Number(qs("#recommend-duration").value) || undefined;
    const ranked = travelFeature.recommendTravels(allTravels, { budget, durationDays, month: new Date().getMonth() + 1 });
    const el = qs("#recommend-list");
    el.textContent = "";
    if (!ranked.length) {
      renderEmptyState(el, { message: "추천할 여행이 없습니다." });
      return;
    }
    ranked.slice(0, 3).forEach((entry) => {
      const trip = allTravels.find((t) => t.id === entry.tripId);
      if (!trip) return;
      el.appendChild(
        createElement("li", {}, [
          createElement("a", { href: `travel-detail.html?id=${trip.id}` }, [trip.title]),
          createElement("span", { class: "text-muted" }, [` · 점수 ${entry.score} · ${entry.reasons.join(", ") || "기본 추천"}`]),
        ])
      );
    });
  });
}

async function init() {
  await travelFeature.seedTravelsIfEmpty(() => fetchJSON("../data/travel-posts.json"));
  await refresh();
  initForm();
  initRecommend();
}

init();
