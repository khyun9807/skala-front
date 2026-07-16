import { createWebStorageAdapter } from "./local-storage.js";
import { STORAGE_NAMESPACE, STORAGE_VERSION } from "../config/constants.js";

function isStorageAvailable(area) {
  try {
    const testKey = "__tessera_test__";
    area.setItem(testKey, "1");
    area.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function createMemoryFallback() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, v),
    removeItem: (k) => map.delete(k),
    get length() {
      return map.size;
    },
    key: (i) => Array.from(map.keys())[i] ?? null,
  };
}

const sessionArea = isStorageAvailable(window.sessionStorage) ? window.sessionStorage : createMemoryFallback();

/**
 * sessionStorage 래퍼. 세션 정보, 회원가입 임시 입력값, 현재 필터/페이지,
 * 스크롤 위치, 일회성 메시지, 로그인 리다이렉트 경로 등 "탭이 닫히면 사라져도 되는" 값에 사용한다.
 */
export const sessionStore = createWebStorageAdapter(sessionArea, {
  namespace: STORAGE_NAMESPACE,
  version: STORAGE_VERSION,
});
