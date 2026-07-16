import { localStore } from "../storage/local-storage.js";

/** 카테고리별(즐겨찾기: 프로젝트/블로그/여행/항공편) 즐겨찾기 토글 — 공용 헬퍼 */
function key(category) {
  return `favorites-${category}`;
}

export function toggleFavorite(category, id) {
  const list = localStore.get(key(category), []);
  const next = list.includes(id) ? list.filter((existing) => existing !== id) : [...list, id];
  localStore.set(key(category), next);
  return next;
}

export function getFavorites(category) {
  return localStore.get(key(category), []);
}

export function isFavorite(category, id) {
  return getFavorites(category).includes(id);
}
