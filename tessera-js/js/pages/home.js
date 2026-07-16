import { initApp, renderToast } from "../app.js";
import { qs, createElement, renderEmptyState, renderLoadingState, renderErrorState } from "../dom/selector.js";
import { apiClient } from "../network/api-client.js";
import { loadProfile } from "../features/profile.js";
import * as blog from "../features/blog.js";
import * as schedule from "../features/schedule.js";
import * as travel from "../features/travel.js";
import * as visitorFeature from "../features/visitor.js";
import { getCurrentWeatherByCity, getCurrentWeatherByCoords, getCurrentPositionOnce } from "../services/weather-service.js";
import { convertCurrency } from "../services/exchange-service.js";
import { search, recordSearchTerm } from "../features/search.js";
import { requestNotificationPermission, isNotificationSupported } from "../features/notifications.js";
import { relativeTime, formatDate } from "../utils/date.js";
import { formatCurrency } from "../utils/number.js";

const { lifecycle } = initApp({ pageName: "home", basePath: "" });

async function fetchJSON(path) {
  const { data } = await apiClient.get(path, { cache: { enabled: true, ttl: 5 * 60_000 } });
  return data;
}

async function renderProfileSummary() {
  const el = qs("#home-profile-summary");
  renderLoadingState(el);
  try {
    const profile = await loadProfile("data/profile.json");
    el.textContent = "";
    el.appendChild(createElement("p", {}, [profile.tagline]));
    el.appendChild(createElement("p", { class: "text-muted" }, [profile.skills.slice(0, 5).join(" · ")]));
  } catch (error) {
    renderErrorState(el, { message: "프로필을 불러오지 못했습니다.", onRetry: renderProfileSummary });
  }
}

async function renderRecentPosts() {
  const el = qs("#home-recent-posts");
  renderLoadingState(el);
  await blog.seedPostsIfEmpty(() => fetchJSON("data/blog-posts.json"));
  const posts = blog
    .sortPosts(await blog.getAllPosts(), "latest")
    .filter((post) => post.status === "published")
    .slice(0, 3);
  el.textContent = "";
  if (!posts.length) {
    renderEmptyState(el);
    return;
  }
  posts.forEach((post) => {
    el.appendChild(
      createElement("li", {}, [
        createElement("a", { href: `pages/blog-detail.html?id=${post.id}` }, [post.title]),
        createElement("span", { class: "text-muted" }, [` · ${relativeTime(post.publishedAt)}`]),
      ])
    );
  });
}

async function renderNextClass() {
  const el = qs("#home-next-class");
  await schedule.seedSchedulesIfEmpty(() => fetchJSON("data/schedules.json"));
  const all = await schedule.getAllSchedules();
  const classSchedules = schedule.filterByKind(all, "class");
  const now = new Date();
  const twoWeeksOut = new Date(now.getTime() + 14 * 86_400_000);
  const occurrences = schedule.expandAllOccurrences(classSchedules, now, twoWeeksOut);
  const upcoming = schedule.getUpcoming(occurrences, 1)[0];
  el.textContent = "";
  if (!upcoming) {
    el.appendChild(createElement("p", { class: "text-muted" }, ["예정된 수업이 없습니다."]));
    return;
  }
  el.appendChild(createElement("p", {}, [upcoming.title]));
  el.appendChild(createElement("p", { class: "text-muted" }, [`${formatDate(upcoming.startAt)} · ${relativeTime(upcoming.startAt)}`]));
}

async function renderNextTravel() {
  const el = qs("#home-next-travel");
  await travel.seedTravelsIfEmpty(() => fetchJSON("data/travel-posts.json"));
  const all = await travel.getAllTravels();
  const upcoming = all
    .filter((trip) => new Date(trip.startDate).getTime() > Date.now())
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];
  el.textContent = "";
  if (!upcoming) {
    el.appendChild(createElement("p", { class: "text-muted" }, ["예정된 여행이 없습니다."]));
    return;
  }
  el.appendChild(createElement("a", { href: `pages/travel-detail.html?id=${upcoming.id}` }, [upcoming.title]));
  const days = Math.ceil((new Date(upcoming.startDate).getTime() - Date.now()) / 86_400_000);
  el.appendChild(createElement("p", { class: "text-muted" }, [`D-${days}`]));
}

function renderVisitorSummary() {
  const el = qs("#home-visitor-summary");
  const stats = visitorFeature.getStats();
  el.textContent = "";
  el.appendChild(createElement("p", {}, [`방문 횟수: ${stats.visitCount}회`]));
  el.appendChild(createElement("p", { class: "text-muted" }, [stats.lastVisitAt ? `마지막 방문: ${relativeTime(stats.lastVisitAt)}` : "첫 방문입니다"]));
}

function renderWeatherResult(el, envelope, suffix = "") {
  el.textContent = "";
  el.appendChild(createElement("p", {}, [`${Math.round(envelope.data.temperature)}°C · ${envelope.data.condition}`]));
  el.appendChild(createElement("p", { class: "provider-badge" }, [`provider: ${envelope.provider}${suffix}`]));
}

async function renderWeather() {
  const el = qs("#home-weather");
  renderLoadingState(el);
  try {
    const envelope = await getCurrentWeatherByCity("Seoul");
    renderWeatherResult(el, envelope);
  } catch (error) {
    renderErrorState(el, { message: "날씨 정보를 가져오지 못했습니다.", onRetry: renderWeather });
  }
}

async function renderExchange() {
  const el = qs("#home-exchange");
  renderLoadingState(el);
  try {
    const envelope = await convertCurrency(1, "USD", "KRW");
    el.textContent = "";
    el.appendChild(createElement("p", {}, [`1 USD = ${formatCurrency(envelope.rate, "KRW")}`]));
    el.appendChild(createElement("p", { class: "provider-badge" }, [`provider: ${envelope.provider} · ${envelope.data.date}`]));
  } catch (error) {
    renderErrorState(el, { message: "환율 정보를 가져오지 못했습니다.", onRetry: renderExchange });
  }
}

function renderRecentActivity() {
  const el = qs("#home-recent-activity");
  const recentPosts = blog.getRecentlyViewed();
  el.textContent = "";
  if (!recentPosts.length) {
    renderEmptyState(el, { message: "아직 활동 기록이 없습니다." });
    return;
  }
  recentPosts.slice(0, 5).forEach((id) => el.appendChild(createElement("li", {}, [`최근 조회한 글: ${id}`])));
}

async function initSearch() {
  const form = qs("#home-search-form");
  const resultsEl = qs("#home-search-results");
  const [posts, travels, schedules] = await Promise.all([blog.getAllPosts(), travel.getAllTravels(), schedule.getAllSchedules()]);
  const items = [
    ...posts.map((post) => ({ ...post, _kind: "blog", _label: post.title, _href: `pages/blog-detail.html?id=${post.id}` })),
    ...travels.map((trip) => ({ ...trip, _kind: "travel", _label: trip.title, _href: `pages/travel-detail.html?id=${trip.id}` })),
    ...schedules.map((item) => ({ ...item, _kind: "schedule", _label: item.title, _href: "pages/schedule.html" })),
  ];

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const query = qs("[data-search-input]").value;
    recordSearchTerm(query);
    const results = await search(query, items, ["title", "_label", "content", "description"]);
    resultsEl.textContent = "";
    if (!results.length) {
      renderEmptyState(resultsEl, { message: "검색 결과가 없습니다." });
      return;
    }
    results.slice(0, 8).forEach((item) => {
      resultsEl.appendChild(createElement("li", {}, [createElement("a", { href: item._href }, [`[${item._kind}] ${item._label}`])]));
    });
  });
}

function initNotifications() {
  const statusEl = qs("#home-notification-status");
  statusEl.textContent = isNotificationSupported() ? Notification.permission : "미지원";
  qs("#home-notification-enable").addEventListener("click", async () => {
    const result = await requestNotificationPermission();
    statusEl.textContent = result;
    renderToast({ message: `알림 권한: ${result}`, type: result === "granted" ? "success" : "info" });
  });
}

function initNetworkStatus() {
  const el = qs("#home-network-status");
  function update() {
    el.textContent = navigator.onLine ? "온라인" : "오프라인";
    el.className = `badge ${navigator.onLine ? "badge--success" : "badge--danger"}`;
  }
  update();
  window.addEventListener("online", update);
  window.addEventListener("offline", update);
  lifecycle.onCleanup(() => {
    window.removeEventListener("online", update);
    window.removeEventListener("offline", update);
  });
}

qs("#home-weather-refresh").addEventListener("click", async () => {
  const el = qs("#home-weather");
  renderLoadingState(el);
  try {
    const { latitude, longitude } = await getCurrentPositionOnce();
    const envelope = await getCurrentWeatherByCoords(latitude, longitude);
    renderWeatherResult(el, envelope, " (내 위치)");
  } catch (error) {
    renderToast({ message: error.message, type: "error" });
    renderWeather();
  }
});

renderProfileSummary();
renderRecentPosts();
renderNextClass();
renderNextTravel();
renderVisitorSummary();
renderWeather();
renderExchange();
renderRecentActivity();
initSearch();
initNotifications();
initNetworkStatus();
