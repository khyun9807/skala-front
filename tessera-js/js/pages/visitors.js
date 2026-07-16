import { initApp } from "../app.js";
import { qs, createElement, renderEmptyState } from "../dom/selector.js";
import { createChart } from "../dom/canvas-charts.js";
import { trackMaxScrollDepth } from "../events/scroll.js";
import { relativeTime, formatDateTime } from "../utils/date.js";
import * as visitorFeature from "../features/visitor.js";

const { lifecycle } = initApp({ pageName: "visitors" });

let clickCount = 0;
let maxScrollDepth = 0;

function renderSessionInfo() {
  const stats = visitorFeature.getStats();
  const env = visitorFeature.getEnvironmentInfo();
  qs("#visitor-session-info").textContent = `테마: ${env.theme} · 화면: ${env.screenSize} · 언어: ${env.language} · referrer: ${env.referrer}`;
  qs("#visitor-visit-count").textContent = `${stats.visitCount}회 방문 · 첫 방문: ${stats.firstVisitAt ? formatDateTime(stats.firstVisitAt) : "-"} · 마지막: ${
    stats.lastVisitAt ? relativeTime(stats.lastVisitAt) : "-"
  }`;
}

function renderClickScroll() {
  qs("#visitor-click-scroll").textContent = `클릭 ${clickCount}회 · 최대 스크롤 깊이 ${Math.round(maxScrollDepth * 100)}%`;
}

async function renderChart() {
  const summary = await visitorFeature.getSummary();
  const canvas = qs("#visitor-pages-chart");
  createChart(canvas, { type: "bar", labels: summary.pages.map((page) => page.page), values: summary.pages.map((page) => page.visits) });
}

async function renderEventLog() {
  const el = qs("#visitor-event-log");
  const events = await visitorFeature.getRecentEvents(30);
  el.textContent = "";
  if (!events.length) {
    renderEmptyState(el, { message: "이벤트 기록이 없습니다." });
    return;
  }
  events.forEach((event) => el.appendChild(createElement("li", {}, [`${formatDateTime(new Date(event.timestamp))} · ${event.type} ${event.page ?? ""}`])));
}

function initConsent() {
  const toggle = qs("#visitor-consent-toggle");
  toggle.checked = visitorFeature.getConsent();
  toggle.addEventListener("change", () => visitorFeature.setConsent(toggle.checked));
}

function initActions() {
  qs("#visitor-export-btn").addEventListener("click", () => visitorFeature.exportVisitorData());
  qs("#visitor-clear-btn").addEventListener("click", async () => {
    if (!window.confirm("방문 기록을 모두 초기화할까요?")) return;
    await visitorFeature.clearVisitorData();
    renderSessionInfo();
    await renderChart();
    await renderEventLog();
  });
}

function renderServerRequired() {
  const el = qs("#visitor-server-required");
  visitorFeature.getServerRequiredFeatures().forEach((label) => el.appendChild(createElement("li", { class: "text-muted" }, [label])));
  const mock = visitorFeature.getMockAggregateStats();
  qs("#visitor-mock-stats").textContent = `(Mock 예시, provider: ${mock.provider}) 전체 사용자 ${mock.totalUsers}명 · 전체 조회수 ${mock.totalPageViews} · KR ${mock.countries.KR} / US ${mock.countries.US} / JP ${mock.countries.JP}`;
}

function initLiveCounters() {
  lifecycle.addEventListener(document, "click", () => {
    clickCount += 1;
    renderClickScroll();
  });
  lifecycle.onCleanup(
    trackMaxScrollDepth((depth) => {
      maxScrollDepth = depth;
      renderClickScroll();
    })
  );
}

async function init() {
  renderSessionInfo();
  renderClickScroll();
  initLiveCounters();
  await renderChart();
  await renderEventLog();
  initConsent();
  initActions();
  renderServerRequired();
}

init();
