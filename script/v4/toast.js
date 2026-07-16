/**
 * [v4] TesseraJS의 이벤트 버스(features/notifications.js가 emit하는 EVENTS.TOAST_SHOW)를
 * 구독해서, 렌더링은 aurora-ui의 기존 AuroraUI.components.showToast()에 그대로 위임한다.
 * "로직은 TesseraJS, 화면은 aurora-ui" 원칙을 토스트 하나에도 그대로 적용한 예시.
 *
 * 사용법: 각 v4 페이지의 module script 맨 위에서 한 번만 import하면 된다.
 *   import "./toast.js";
 */
import { eventBus } from "../../tessera-js/js/core/event-bus.js";
import { EVENTS } from "../../tessera-js/js/config/constants.js";

eventBus.on(EVENTS.TOAST_SHOW, (toast) => {
  if (window.AuroraUI && window.AuroraUI.components) {
    window.AuroraUI.components.showToast(toast.message, toast.type ?? "info", toast.duration ?? 4000);
  }
});
