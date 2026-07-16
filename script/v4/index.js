/**
 * [v4] index.v4.html 전용 배선. aurora-ui 마크업은 그대로 두고,
 * TesseraJS의 features/services를 가져와 실제 데이터로 카드를 채운다.
 * 상대경로는 이 파일이 아니라 "브라우저가 이 스크립트를 로드한 문서(html/index.v4.html)"를
 * 기준으로 fetch가 이루어진다는 점에 주의(js import 경로와 fetch 경로가 서로 다른 기준).
 */
import "./toast.js";
import { recordVisitStart, getRecentEvents } from "../../tessera-js/js/features/visitor.js";
import { convertCurrency } from "../../tessera-js/js/services/exchange-service.js";
import { showToast } from "../../tessera-js/js/features/notifications.js";
import { apiClient } from "../../tessera-js/js/network/api-client.js";
import { search, recordSearchTerm } from "../../tessera-js/js/features/search.js";
import { localStore } from "../../tessera-js/js/storage/local-storage.js";
import { debounce } from "../../tessera-js/js/utils/debounce.js";
import { relativeTime } from "../../tessera-js/js/utils/date.js";

async function fetchJSON(path) {
  const { data } = await apiClient.get(path, { cache: { enabled: true, ttl: 5 * 60_000 } });
  return data;
}

function describeEvent(event) {
  if (event.type === "pageview") return `${event.page} 페이지 방문`;
  if (event.type === "click") return "클릭 이벤트 발생";
  if (event.type === "scroll-depth") return `스크롤 깊이 ${Math.round((event.depth ?? 0) * 100)}%`;
  return event.type;
}

async function renderVisitor() {
  const stats = recordVisitStart("index-v4");
  document.getElementById("v4-visitor-stats").textContent = stats.isFirstVisit
    ? "이 브라우저에서 첫 방문입니다! (localStorage에 기록됨)"
    : `${stats.visitCount}회 방문 · 마지막 방문 ${relativeTime(stats.lastVisitAt)}`;

  const events = await getRecentEvents(5);
  const timelineEl = document.getElementById("v4-activity-timeline");
  timelineEl.textContent = "";
  if (!events.length) {
    const item = document.createElement("div");
    item.className = "aur-timeline__item";
    const time = document.createElement("span");
    time.className = "aur-timeline__time";
    time.textContent = "지금";
    const p = document.createElement("p");
    p.textContent = "아직 기록된 활동이 없습니다.";
    item.append(time, p);
    timelineEl.appendChild(item);
    return;
  }
  events.forEach((event) => {
    const item = document.createElement("div");
    item.className = "aur-timeline__item";
    const time = document.createElement("span");
    time.className = "aur-timeline__time";
    time.textContent = relativeTime(event.timestamp);
    const p = document.createElement("p");
    p.textContent = describeEvent(event);
    item.append(time, p);
    timelineEl.appendChild(item);
  });
}

async function renderExchange() {
  const el = document.getElementById("v4-exchange-rate");
  const providerEl = document.getElementById("v4-exchange-provider");
  try {
    const envelope = await convertCurrency(1, "USD", "KRW");
    const prevRate = localStore.get("v4-last-usd-krw-rate", null);
    localStore.set("v4-last-usd-krw-rate", envelope.rate);

    el.textContent = "";
    el.appendChild(document.createTextNode("1 USD = "));
    if (prevRate != null && prevRate !== envelope.rate) {
      const del = document.createElement("del");
      del.textContent = `${Math.round(prevRate).toLocaleString()}원`;
      const ins = document.createElement("ins");
      ins.textContent = `${Math.round(envelope.rate).toLocaleString()}원`;
      el.append(del, document.createTextNode(" → "), ins);
    } else {
      el.appendChild(document.createTextNode(`${Math.round(envelope.rate).toLocaleString()}원`));
    }
    providerEl.textContent = `provider: ${envelope.provider} · 갱신: ${envelope.data.date}`;
  } catch (error) {
    el.textContent = "환율 정보를 가져오지 못했습니다.";
  }
}

function updateNetworkStatus() {
  const el = document.getElementById("v4-network-status");
  el.textContent = navigator.onLine ? "온라인" : "오프라인";
  el.className = `aur-badge aur-badge--${navigator.onLine ? "success" : "danger"}`;
}

let searchIndexPromise = null;
function getSearchIndex() {
  if (!searchIndexPromise) {
    searchIndexPromise = Promise.all([
      fetchJSON("../tessera-js/data/profile.json"),
      fetchJSON("../tessera-js/data/schedules.json"),
      fetchJSON("../tessera-js/data/travel-posts.json"),
    ]).then(([profile, schedules, travels]) => [
      ...profile.projects.map((project) => ({ ...project, _kind: "프로젝트", _label: project.title, _href: "myProfile.v4.html" })),
      ...schedules.map((item) => ({ ...item, _kind: "수업/일정", _label: item.title, _href: "myClass.v4.html" })),
      ...travels.map((trip) => ({ ...trip, _kind: "여행", _label: trip.title, _href: "myTrip.v4.html" })),
    ]);
  }
  return searchIndexPromise;
}

function initSearch() {
  const form = document.getElementById("v4-search-form");
  const input = document.getElementById("v4-search-input");
  const panel = document.getElementById("v4-search-results");
  const template = document.getElementById("v4-search-item-template");

  function renderResults(results) {
    panel.textContent = "";
    if (!results.length) {
      panel.hidden = true;
      return;
    }
    results.slice(0, 8).forEach((item) => {
      const clone = template.content.cloneNode(true);
      const link = clone.querySelector("a");
      const dataEl = clone.querySelector("data");
      link.href = item._href;
      dataEl.value = item._kind;
      dataEl.textContent = `[${item._kind}] ${item._label}`;
      panel.appendChild(clone);
    });
    panel.hidden = false;
  }

  const handleInput = debounce(async () => {
    const query = input.value.trim();
    if (!query) {
      panel.hidden = true;
      return;
    }
    const items = await getSearchIndex();
    recordSearchTerm(query);
    const results = await search(query, items, ["title", "_label"]);
    renderResults(results);
  }, 200);

  input.addEventListener("input", handleInput);
  form.addEventListener("submit", (event) => event.preventDefault());
  document.addEventListener("click", (event) => {
    if (!form.contains(event.target)) panel.hidden = true;
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "/" || event.isComposing) return;
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    event.preventDefault();
    input.focus();
  });
}

document.getElementById("v4-toast-test").addEventListener("click", () => {
  showToast("TesseraJS 이벤트 버스로 발행되고 aurora-ui 컴포넌트로 그려진 토스트입니다!", { type: "success" });
});

updateNetworkStatus();
window.addEventListener("online", updateNetworkStatus);
window.addEventListener("offline", updateNetworkStatus);

renderVisitor();
renderExchange();
initSearch();
