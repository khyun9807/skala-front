import { indexedDb } from "../storage/indexed-db.js";
import { generateId } from "../utils/security.js";
import { eventBus } from "../core/event-bus.js";
import { remainingTime, durationBetween, formatDate } from "../utils/date.js";
import { sum } from "../utils/number.js";
import { groupBy } from "../utils/array.js";
import { exportBackup, importBackupFile } from "../files/backup.js";
import { downloadCSV } from "../files/file-exporter.js";
import { rankRecommendations } from "./travel-scoring.js";
import { OBJECT_STORES, EVENTS } from "../config/constants.js";

const STORE = OBJECT_STORES.TRAVELS;

export async function seedTravelsIfEmpty(fetchSeed) {
  const count = await indexedDb.count(STORE);
  if (count > 0) return;
  await indexedDb.bulkPut(STORE, await fetchSeed());
}

export function getAllTravels() {
  return indexedDb.getAll(STORE);
}

export function getTravelById(id) {
  return indexedDb.get(STORE, id);
}

export async function createTravel(input) {
  const travel = { id: generateId("trip"), checklist: [], expenses: [], status: "planned", ...input };
  await indexedDb.put(STORE, travel);
  eventBus.emit(EVENTS.TRAVEL_CHANGED);
  return travel;
}

export async function updateTravel(id, patch) {
  const existing = await indexedDb.get(STORE, id);
  if (!existing) throw new Error(`travel not found: ${id}`);
  const updated = { ...existing, ...patch };
  await indexedDb.put(STORE, updated);
  eventBus.emit(EVENTS.TRAVEL_CHANGED);
  return updated;
}

export async function deleteTravel(id) {
  await indexedDb.delete(STORE, id);
  eventBus.emit(EVENTS.TRAVEL_CHANGED);
}

export async function toggleChecklistItem(travelId, itemId) {
  const travel = await indexedDb.get(STORE, travelId);
  const checklist = travel.checklist.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item));
  return updateTravel(travelId, { checklist });
}

export async function addChecklistItem(travelId, label) {
  const travel = await indexedDb.get(STORE, travelId);
  const checklist = [...(travel.checklist ?? []), { id: generateId("chk"), label, done: false }];
  return updateTravel(travelId, { checklist });
}

export async function addExpense(travelId, expense) {
  const travel = await indexedDb.get(STORE, travelId);
  const expenses = [...(travel.expenses ?? []), { id: generateId("exp"), ...expense }];
  return updateTravel(travelId, { expenses });
}

/** 카테고리별 합계 + 전체 합계 + 예산 초과 여부(amountBase: 기준 통화로 환산된 금액) */
export function computeBudgetSummary(travel, budgetLimit) {
  const byCategory = groupBy(travel.expenses ?? [], (expense) => expense.category);
  const categoryTotals = {};
  for (const [category, items] of byCategory) {
    categoryTotals[category] = sum(items.map((item) => item.amountBase ?? item.amount));
  }
  const total = sum(Object.values(categoryTotals));
  return {
    categoryTotals,
    total,
    overBudget: budgetLimit ? total > budgetLimit : false,
    remaining: budgetLimit ? budgetLimit - total : null,
  };
}

export function computeProgress(travel) {
  const now = Date.now();
  const start = new Date(travel.startDate).getTime();
  const end = new Date(travel.endDate).getTime();
  if (now < start) return { phase: "upcoming", ratio: 0, remaining: remainingTime(travel.startDate) };
  if (now > end) return { phase: "completed", ratio: 1, elapsed: durationBetween(travel.startDate, travel.endDate) };
  return { phase: "ongoing", ratio: (now - start) / (end - start), elapsed: durationBetween(travel.startDate, new Date()) };
}

export function generateShareText(travel) {
  return [
    `${travel.title} (${formatDate(travel.startDate)} ~ ${formatDate(travel.endDate)})`,
    `방문 도시: ${(travel.cities ?? []).join(", ")}`,
    `준비물: ${(travel.checklist ?? []).map((item) => item.label).join(", ")}`,
  ].join("\n");
}

export function generateSummary(travel) {
  const progress = computeProgress(travel);
  return {
    title: travel.title,
    durationDays: Math.round((new Date(travel.endDate).getTime() - new Date(travel.startDate).getTime()) / 86_400_000),
    cityCount: travel.cities?.length ?? 0,
    phase: progress.phase,
  };
}

export function recommendTravels(candidates, preferences) {
  return rankRecommendations(candidates, preferences);
}

export function exportTravelJSON(travel) {
  return exportBackup("travel", [travel]);
}

export async function importTravelJSON(file) {
  const payload = await importBackupFile(file, "travel");
  await indexedDb.bulkPut(STORE, payload.items);
  eventBus.emit(EVENTS.TRAVEL_CHANGED);
  return payload.items;
}

export function exportExpensesCSV(travel) {
  downloadCSV(
    (travel.expenses ?? []).map((expense) => ({ category: expense.category, amount: expense.amount, currency: expense.currency, memo: expense.memo ?? "" })),
    { prefix: `travel-${travel.id}-expenses` }
  );
}
