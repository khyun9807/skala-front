import { indexedDb } from "../storage/indexed-db.js";
import { generateId } from "../utils/security.js";
import { eventBus } from "../core/event-bus.js";
import { isToday, isSameDay, dateRange } from "../utils/date.js";
import { sortBy } from "../utils/array.js";
import { downloadCSV, downloadICS } from "../files/file-exporter.js";
import { exportBackup, importBackupFile } from "../files/backup.js";
import { findConflicts, hasConflict } from "./schedule-conflict.js";
import { OBJECT_STORES, EVENTS, RECURRENCE_TYPES } from "../config/constants.js";

const STORE = OBJECT_STORES.SCHEDULES;

export { findConflicts, hasConflict };

export async function seedSchedulesIfEmpty(fetchSeed) {
  const count = await indexedDb.count(STORE);
  if (count > 0) return;
  await indexedDb.bulkPut(STORE, await fetchSeed());
}

export function getAllSchedules() {
  return indexedDb.getAll(STORE);
}

export async function createSchedule(input) {
  const schedule = { id: generateId("sch"), completed: false, recurrence: RECURRENCE_TYPES.NONE, ...input };
  await indexedDb.put(STORE, schedule);
  eventBus.emit(EVENTS.SCHEDULE_CHANGED);
  return schedule;
}

export async function updateSchedule(id, patch) {
  const existing = await indexedDb.get(STORE, id);
  if (!existing) throw new Error(`schedule not found: ${id}`);
  const updated = { ...existing, ...patch };
  await indexedDb.put(STORE, updated);
  eventBus.emit(EVENTS.SCHEDULE_CHANGED);
  return updated;
}

export async function deleteSchedule(id) {
  await indexedDb.delete(STORE, id);
  eventBus.emit(EVENTS.SCHEDULE_CHANGED);
}

/** 드래그로 일정을 다른 시간으로 옮길 때: 기존 소요시간(duration)을 유지한 채 시작시각만 바꾼다 */
export async function moveSchedule(id, newStartAt) {
  const existing = await indexedDb.get(STORE, id);
  const durationMs = new Date(existing.endAt).getTime() - new Date(existing.startAt).getTime();
  const nextStart = new Date(newStartAt);
  return updateSchedule(id, {
    startAt: nextStart.toISOString(),
    endAt: new Date(nextStart.getTime() + durationMs).toISOString(),
  });
}

export async function toggleComplete(id) {
  const existing = await indexedDb.get(STORE, id);
  return updateSchedule(id, { completed: !existing.completed });
}

export async function duplicateSchedule(id) {
  const existing = await indexedDb.get(STORE, id);
  const copy = { ...existing, id: generateId("sch"), title: `${existing.title} (사본)` };
  await indexedDb.put(STORE, copy);
  eventBus.emit(EVENTS.SCHEDULE_CHANGED);
  return copy;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function occursOnDay(schedule, day) {
  const start = new Date(schedule.startAt);
  if (startOfDay(day) < startOfDay(start)) return false;
  switch (schedule.recurrence) {
    case RECURRENCE_TYPES.DAILY:
      return true;
    case RECURRENCE_TYPES.WEEKLY:
      return day.getDay() === start.getDay();
    case RECURRENCE_TYPES.WEEKDAYS:
      return day.getDay() >= 1 && day.getDay() <= 5;
    case RECURRENCE_TYPES.MONTHLY:
      return day.getDate() === start.getDate();
    case RECURRENCE_TYPES.SPECIFIC_WEEKDAY:
      return (schedule.recurrenceWeekdays ?? [start.getDay()]).includes(day.getDay());
    default:
      return isSameDay(day, start);
  }
}

/** 반복 일정을 rangeStart~rangeEnd 사이의 실제 발생 인스턴스들로 펼친다(가상 인스턴스, 저장하지 않음) */
export function expandOccurrences(schedule, rangeStart, rangeEnd) {
  const start = new Date(schedule.startAt);
  const end = new Date(schedule.endAt);
  const durationMs = end.getTime() - start.getTime();
  const occurrences = [];

  if (!schedule.recurrence || schedule.recurrence === RECURRENCE_TYPES.NONE) {
    if (start >= rangeStart && start <= rangeEnd) occurrences.push(schedule);
    return occurrences;
  }

  for (const day of dateRange(startOfDay(rangeStart), startOfDay(rangeEnd))) {
    if (!occursOnDay(schedule, day)) continue;
    const occurrenceStart = new Date(day);
    occurrenceStart.setHours(start.getHours(), start.getMinutes(), start.getSeconds());
    occurrences.push({
      ...schedule,
      id: `${schedule.id}::${occurrenceStart.toISOString()}`,
      originalId: schedule.id,
      startAt: occurrenceStart.toISOString(),
      endAt: new Date(occurrenceStart.getTime() + durationMs).toISOString(),
      isRecurrenceInstance: true,
    });
  }
  return occurrences;
}

export function expandAllOccurrences(schedules, rangeStart, rangeEnd) {
  return schedules.flatMap((schedule) => expandOccurrences(schedule, rangeStart, rangeEnd));
}

export function filterByKind(schedules, kind) {
  return kind ? schedules.filter((schedule) => schedule.kind === kind) : schedules;
}

export function getTodaySchedules(schedules) {
  return schedules.filter((schedule) => isToday(schedule.startAt));
}

export function getUpcoming(schedules, limit = 5) {
  const now = Date.now();
  return sortBy(
    schedules.filter((schedule) => new Date(schedule.startAt).getTime() >= now),
    (schedule) => new Date(schedule.startAt).getTime()
  ).slice(0, limit);
}

export function getPastSchedules(schedules) {
  const now = Date.now();
  return schedules.filter((schedule) => new Date(schedule.endAt).getTime() < now);
}

export function searchSchedules(schedules, query) {
  const q = query.trim().toLowerCase();
  if (!q) return schedules;
  return schedules.filter((schedule) => schedule.title.toLowerCase().includes(q) || schedule.location?.toLowerCase().includes(q));
}

export function exportSchedulesCSV(schedules) {
  downloadCSV(
    schedules.map((schedule) => ({
      title: schedule.title,
      kind: schedule.kind,
      startAt: schedule.startAt,
      endAt: schedule.endAt,
      location: schedule.location ?? "",
      completed: schedule.completed,
    })),
    { prefix: "schedules" }
  );
}

export function exportSchedulesJSON(schedules) {
  return exportBackup("schedules", schedules);
}

export async function importSchedulesJSON(file) {
  const payload = await importBackupFile(file, "schedules");
  await indexedDb.bulkPut(STORE, payload.items);
  eventBus.emit(EVENTS.SCHEDULE_CHANGED);
  return payload.items;
}

export function exportSchedulesICS(schedules) {
  downloadICS(schedules, "schedules");
}
