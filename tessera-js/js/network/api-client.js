import { createHttpClient } from "./http-client.js";
import { eventBus } from "../core/event-bus.js";
import { EVENTS } from "../config/constants.js";
import { sessionStore } from "../storage/session-storage.js";

/** 앱 전역에서 쓰는 기본 설정이 적용된 HTTP 클라이언트 인스턴스 */
export const apiClient = createHttpClient({ timeout: 5000, retry: 2, maxConcurrent: 4 });

apiClient.setAuthTokenProvider(() => sessionStore.get("auth-token"));

apiClient.useRequestInterceptor((config) => {
  return { ...config, headers: { Accept: "application/json", ...config.headers } };
});

window.addEventListener("online", () => eventBus.emit(EVENTS.NETWORK_ONLINE));
window.addEventListener("offline", () => eventBus.emit(EVENTS.NETWORK_OFFLINE));

export function isOnline() {
  return navigator.onLine;
}
