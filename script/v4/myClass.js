/**
 * [v4] myClass.v4.html 전용 배선. 공식 rowspan/colspan 시간표는 건드리지 않고,
 * 그 아래 "개인 일정 관리" 섹션을 TesseraJS의 features/schedule.js(IndexedDB)로 구동한다.
 */
import "./toast.js";
import { apiClient } from "../../tessera-js/js/network/api-client.js";
import { Countdown } from "../../tessera-js/js/utils/timer.js";
import { formatDurationClock } from "../../tessera-js/js/utils/formatter.js";
import { formatTime, formatDate, addDays } from "../../tessera-js/js/utils/date.js";
import * as scheduleFeature from "../../tessera-js/js/features/schedule.js";

async function fetchJSON(path) {
  const { data } = await apiClient.get(path, { cache: { enabled: true, ttl: 5 * 60_000 } });
  return data;
}

function renderList(elId, items, emptyMessage, formatter) {
  const el = document.getElementById(elId);
  el.textContent = "";
  if (!items.length) {
    const li = document.createElement("li");
    li.className = "aur-text-muted";
    li.textContent = emptyMessage;
    el.appendChild(li);
    return;
  }
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = formatter(item);
    el.appendChild(li);
  });
}

let countdownInstance = null;
function initCountdown(next) {
  countdownInstance?.stop();
  const el = document.getElementById("v4-countdown");
  if (!next) {
    el.textContent = "예정된 일정이 없습니다.";
    return;
  }
  countdownInstance = new Countdown(next.startAt, {
    onTick: (remainingMs) => {
      el.textContent = `${next.title}까지 ${formatDurationClock(remainingMs)} 남음`;
    },
    onComplete: () => {
      el.textContent = `${next.title} 시작!`;
    },
  });
  countdownInstance.start();
}

async function refresh() {
  const all = await scheduleFeature.getAllSchedules();

  renderList("v4-today-list", scheduleFeature.getTodaySchedules(all), "오늘 일정이 없습니다.", (item) => `${formatTime(item.startAt)} ${item.title}${item.completed ? " ✅" : ""}`);

  const occurrences = scheduleFeature.expandAllOccurrences(all, new Date(), addDays(new Date(), 30));
  const upcoming = scheduleFeature.getUpcoming(occurrences, 5);
  renderList("v4-upcoming-list", upcoming, "다가오는 일정이 없습니다.", (item) => `${formatDate(item.startAt)} ${formatTime(item.startAt)} — ${item.title}`);

  const past = scheduleFeature.getPastSchedules(all).slice(-5);
  renderList("v4-past-list", past, "지난 일정이 없습니다.", (item) => `${formatDate(item.startAt)} — ${item.title}`);

  initCountdown(upcoming[0]);
}

function initExports() {
  document.getElementById("v4-export-csv").addEventListener("click", async () => {
    scheduleFeature.exportSchedulesCSV(await scheduleFeature.getAllSchedules());
  });
  document.getElementById("v4-export-json").addEventListener("click", async () => {
    scheduleFeature.exportSchedulesJSON(await scheduleFeature.getAllSchedules());
  });
  document.getElementById("v4-export-ics").addEventListener("click", async () => {
    scheduleFeature.exportSchedulesICS(await scheduleFeature.getAllSchedules());
  });
}

async function init() {
  await scheduleFeature.seedSchedulesIfEmpty(() => fetchJSON("../tessera-js/data/schedules.json"));
  await refresh();
  initExports();
}

init();
