import { initApp, renderToast } from "../app.js";
import { qs, qsa, createElement } from "../dom/selector.js";
import { apiClient } from "../network/api-client.js";
import { makeDraggable, makeDropzone } from "../events/drag-drop.js";
import { debounce } from "../utils/debounce.js";
import { Countdown } from "../utils/timer.js";
import { formatDurationClock } from "../utils/formatter.js";
import { formatTime, formatDate, startOfMonth, endOfMonth, addMonths, addDays, startOfWeek, isToday, isSameDay } from "../utils/date.js";
import { requestNotificationPermission, scheduleReminder } from "../features/notifications.js";
import * as scheduleFeature from "../features/schedule.js";

const { lifecycle } = initApp({ pageName: "schedule" });

async function fetchJSON(path) {
  const { data } = await apiClient.get(path, { cache: { enabled: true, ttl: 5 * 60_000 } });
  return data;
}

let allSchedules = [];
let currentView = "month";
let currentMonthDate = new Date();
let countdownInstance = null;

function getFiltered() {
  const kind = qs("#schedule-kind-filter").value;
  const query = qs("#schedule-search").value;
  return scheduleFeature.searchSchedules(scheduleFeature.filterByKind(allSchedules, kind), query);
}

function renderConflictBanner(occurrences) {
  const conflicts = scheduleFeature.findConflicts(occurrences);
  const banner = qs("#schedule-conflict-banner");
  if (conflicts.length) {
    banner.hidden = false;
    banner.textContent = `⚠ 겹치는 일정 ${conflicts.length}건 발견`;
  } else {
    banner.hidden = true;
  }
  return new Set(conflicts.flatMap((c) => [c.a, c.b]));
}

function renderMonthView() {
  qs("#schedule-month-label").textContent = `${currentMonthDate.getFullYear()}년 ${currentMonthDate.getMonth() + 1}월`;
  const grid = qs("#schedule-calendar");
  grid.textContent = "";

  const monthStart = startOfMonth(currentMonthDate);
  const monthEnd = endOfMonth(currentMonthDate);
  const gridStart = addDays(monthStart, -monthStart.getDay());
  const gridEnd = addDays(monthEnd, 6 - monthEnd.getDay());

  const occurrences = scheduleFeature.expandAllOccurrences(getFiltered(), gridStart, gridEnd);
  const conflictIds = renderConflictBanner(occurrences);

  ["일", "월", "화", "수", "목", "금", "토"].forEach((day) => grid.appendChild(createElement("div", { style: "font-weight:700;text-align:center;padding:4px;" }, [day])));

  let cursor = gridStart;
  while (cursor <= gridEnd) {
    const dayOccurrences = occurrences.filter((occ) => isSameDay(occ.startAt, cursor));
    const cellClasses = ["calendar-cell"];
    if (isToday(cursor)) cellClasses.push("calendar-cell--today");
    if (cursor.getMonth() !== currentMonthDate.getMonth()) cellClasses.push("calendar-cell--other-month");

    const cell = createElement("div", { class: cellClasses.join(" ") }, [createElement("strong", { class: "text-sm" }, [String(cursor.getDate())])]);

    dayOccurrences.forEach((occ) => {
      const chipId = occ.originalId ?? occ.id;
      const chip = createElement(
        "span",
        { class: `schedule-chip ${conflictIds.has(chipId) ? "schedule-chip--conflict" : ""}`, style: `background:${occ.color ?? "#4f6bed"};` },
        [occ.title]
      );
      makeDraggable(chip, () => ({ id: chipId, startAt: occ.startAt }));
      cell.appendChild(chip);
    });

    const cellDate = new Date(cursor);
    makeDropzone(cell, async (data) => {
      const original = allSchedules.find((s) => s.id === data.id);
      if (!original) return;
      const time = new Date(data.startAt);
      const targetDate = new Date(cellDate);
      targetDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
      await scheduleFeature.moveSchedule(data.id, targetDate.toISOString());
      renderToast({ message: "일정을 이동했습니다.", type: "success" });
      await refreshData();
    });

    grid.appendChild(cell);
    cursor = addDays(cursor, 1);
  }
}

function renderTimetableView() {
  const grid = qs("#schedule-timetable");
  grid.textContent = "";
  grid.appendChild(createElement("div", {}, [""]));
  ["일", "월", "화", "수", "목", "금", "토"].forEach((day) => grid.appendChild(createElement("div", { style: "font-weight:700;text-align:center;" }, [day])));

  const weekStart = startOfWeek(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const occurrences = scheduleFeature.expandAllOccurrences(getFiltered(), weekStart, addDays(weekStart, 6));

  for (let hour = 7; hour <= 22; hour += 1) {
    grid.appendChild(createElement("div", { class: "text-sm text-muted" }, [`${hour}시`]));
    days.forEach((day) => {
      const cellItems = occurrences.filter((occ) => isSameDay(occ.startAt, day) && new Date(occ.startAt).getHours() === hour);
      grid.appendChild(
        createElement(
          "div",
          {},
          cellItems.map((occ) => createElement("span", { class: "schedule-chip", style: `background:${occ.color ?? "#4f6bed"}; display:block;` }, [occ.title]))
        )
      );
    });
  }
}

function renderAgendaView() {
  const filtered = getFiltered();

  const todayList = qs("#schedule-today-list");
  todayList.textContent = "";
  const today = scheduleFeature.getTodaySchedules(filtered);
  if (!today.length) todayList.appendChild(createElement("li", { class: "text-muted" }, ["오늘 일정이 없습니다."]));
  today.forEach((item) => todayList.appendChild(createElement("li", {}, [`${formatTime(item.startAt)} ${item.title} ${item.completed ? "✅" : ""}`])));

  const occurrences = scheduleFeature.expandAllOccurrences(filtered, new Date(), addDays(new Date(), 30));
  const upcoming = scheduleFeature.getUpcoming(occurrences, 5);
  const upcomingList = qs("#schedule-upcoming-list");
  upcomingList.textContent = "";
  upcoming.forEach((item) => upcomingList.appendChild(createElement("li", {}, [`${formatDate(item.startAt)} ${formatTime(item.startAt)} — ${item.title}`])));

  const past = scheduleFeature.getPastSchedules(filtered).slice(-5);
  const pastList = qs("#schedule-past-list");
  pastList.textContent = "";
  past.forEach((item) => pastList.appendChild(createElement("li", { class: "text-muted" }, [`${formatDate(item.startAt)} — ${item.title}`])));

  initCountdown(upcoming[0]);
}

function initCountdown(next) {
  countdownInstance?.stop();
  const el = qs("#schedule-countdown");
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
  lifecycle.onCleanup(() => countdownInstance.stop());
}

function renderCurrent() {
  if (currentView === "month") renderMonthView();
  else if (currentView === "timetable") renderTimetableView();
  else renderAgendaView();
}

function setView(view) {
  currentView = view;
  qs("#schedule-month-view").hidden = view !== "month";
  qs("#schedule-timetable-view").hidden = view !== "timetable";
  qs("#schedule-agenda-view").hidden = view !== "agenda";
  qsa("[data-view]").forEach((btn) => btn.setAttribute("aria-selected", String(btn.dataset.view === view)));
  renderCurrent();
}

async function refreshData() {
  allSchedules = await scheduleFeature.getAllSchedules();
  renderCurrent();
}

function getTodayNotifiable() {
  return scheduleFeature.getTodaySchedules(allSchedules).filter((item) => item.notify && new Date(item.startAt).getTime() > Date.now());
}

function initControls() {
  qsa("[data-view]").forEach((btn) => btn.addEventListener("click", () => setView(btn.dataset.view)));
  qs("#schedule-prev-month").addEventListener("click", () => {
    currentMonthDate = addMonths(currentMonthDate, -1);
    renderMonthView();
  });
  qs("#schedule-next-month").addEventListener("click", () => {
    currentMonthDate = addMonths(currentMonthDate, 1);
    renderMonthView();
  });
  qs("#schedule-kind-filter").addEventListener("change", renderCurrent);
  qs("#schedule-search").addEventListener("input", debounce(renderCurrent, 200));

  qs("#schedule-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    await scheduleFeature.createSchedule({
      title: formData.get("title"),
      location: formData.get("location"),
      kind: formData.get("kind"),
      startAt: new Date(formData.get("startAt")).toISOString(),
      endAt: new Date(formData.get("endAt")).toISOString(),
      recurrence: formData.get("recurrence"),
      notify: formData.get("notify") === "on",
      priority: "medium",
      color: "#4f6bed",
    });
    event.target.reset();
    renderToast({ message: "일정을 추가했습니다.", type: "success" });
    await refreshData();
  });

  qs("#schedule-export-csv").addEventListener("click", () => scheduleFeature.exportSchedulesCSV(allSchedules));
  qs("#schedule-export-json").addEventListener("click", () => scheduleFeature.exportSchedulesJSON(allSchedules));
  qs("#schedule-export-ics").addEventListener("click", () => scheduleFeature.exportSchedulesICS(allSchedules));
  qs("#schedule-import-json").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      await scheduleFeature.importSchedulesJSON(file);
      renderToast({ message: "일정을 가져왔습니다.", type: "success" });
      await refreshData();
    } catch (error) {
      renderToast({ message: error.message, type: "error" });
    } finally {
      event.target.value = "";
    }
  });

  qs("#schedule-enable-notifications").addEventListener("click", async () => {
    const result = await requestNotificationPermission();
    renderToast({ message: `알림 권한: ${result}`, type: result === "granted" ? "success" : "info" });
    if (result === "granted") {
      getTodayNotifiable().forEach((item) => scheduleReminder(lifecycle, item.startAt, { title: `일정 시작: ${item.title}`, body: item.location ?? "" }));
    }
  });
}

async function init() {
  await scheduleFeature.seedSchedulesIfEmpty(() => fetchJSON("../data/schedules.json"));
  initControls();
  await refreshData();
  setView("month");
}

init();
