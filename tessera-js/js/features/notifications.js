import { eventBus } from "../core/event-bus.js";
import { EVENTS } from "../config/constants.js";
import { generateId } from "../utils/security.js";

/** 인앱 toast — 실제 렌더링은 dom 레이어(app.js)가 이 이벤트를 구독해서 처리한다 */
export function showToast(message, { type = "info", duration = 4000 } = {}) {
  const toast = { id: generateId("toast"), message, type, duration };
  eventBus.emit(EVENTS.TOAST_SHOW, toast);
  return toast;
}

export function isNotificationSupported() {
  return "Notification" in window;
}

/**
 * 브라우저 Notification 권한 요청. 반드시 버튼 클릭 같은 사용자 제스처 핸들러 안에서 호출해야 하며,
 * 페이지 로드 직후 자동으로 호출하면 브라우저가 무시하거나 향후 요청을 막을 수 있다.
 */
export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return "unsupported";
  if (Notification.permission === "granted" || Notification.permission === "denied") return Notification.permission;
  return Notification.requestPermission();
}

export function showBrowserNotification(title, options = {}) {
  if (!isNotificationSupported() || Notification.permission !== "granted") {
    showToast(title, { type: "info" });
    return null;
  }
  return new Notification(title, options);
}

/** targetDate 시점에 알림을 띄우는 타이머. lifecycle에 등록되므로 페이지를 떠나면 자동 해제된다. */
export function scheduleReminder(lifecycle, targetDate, { title, body }) {
  const delay = new Date(targetDate).getTime() - Date.now();
  if (delay <= 0) return null;
  return lifecycle.setTimeout(() => showBrowserNotification(title, { body }), delay);
}
