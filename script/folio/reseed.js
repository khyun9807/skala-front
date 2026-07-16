/* ─────────────────────────────────────────────────────────────
   script/folio/reseed.js — 콘텐츠 시드 버전 관리 (folio 글루)

   TesseraJS의 seedXIfEmpty()는 "스토어가 비어 있을 때만" 시드한다.
   그래서 시드 원본(tessera-js/data/*.json)을 실제 내용으로 교체해도,
   이전에 한 번이라도 방문해 IndexedDB가 채워진 브라우저에는 옛 데모 데이터가 그대로 남는다.

   → 시드 버전이 바뀌면 해당 스토어를 비워, 뒤이어 호출되는 seedXIfEmpty가 새 데이터를 넣게 한다.
   TesseraJS 소스는 건드리지 않고 이 글루 계층에서만 처리한다.

   주의: 스토어를 비우므로 사용자가 직접 추가한 항목(일정 등)도 함께 사라진다.
   버전 문자열이 바뀔 때 브라우저당 한 번만 일어나는 마이그레이션 성격의 동작이다.
   ───────────────────────────────────────────────────────────── */
import { indexedDb } from '../../tessera-js/js/storage/indexed-db.js';
import { localStore } from '../../tessera-js/js/storage/local-storage.js';

/** 시드 내용을 바꿀 때마다 이 값을 올린다. */
export const SEED_VERSION = '2026-07-16-real-content-2'; // v2: 블로그 글에 cover/images 추가

/**
 * 시드 버전이 바뀌었으면 스토어를 비운다.
 * @param {string} storeName OBJECT_STORES 값
 * @returns {Promise<boolean>} 실제로 비웠으면 true
 */
export async function reseedIfStale(storeName) {
  const key = `folio-seed:${storeName}`;
  if (localStore.get(key) === SEED_VERSION) return false;
  try {
    await indexedDb.clear(storeName);
  } catch {
    /* IndexedDB 미지원/실패해도 아래 시드는 그대로 진행 */
  }
  localStore.set(key, SEED_VERSION);
  return true;
}

/**
 * IndexedDB가 아닌 항목(예: localStorage에 남은 데모 시절 초안)을 시드 버전당 1회만 정리한다.
 * @param {string} name 마커 이름
 * @param {() => void} fn 정리 동작
 * @returns {boolean} 실제로 실행했으면 true
 */
export function runOnceForVersion(name, fn) {
  const key = `folio-seed:${name}`;
  if (localStore.get(key) === SEED_VERSION) return false;
  try {
    fn();
  } catch {
    /* 정리 실패는 무시 — 마커는 남겨 반복 시도하지 않음 */
  }
  localStore.set(key, SEED_VERSION);
  return true;
}
