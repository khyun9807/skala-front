/* ─────────────────────────────────────────────────────────────
   script/folio/toast.js — 토스트 브리지
   로직은 TesseraJS(features/notifications.js가 emit하는 EVENTS.TOAST_SHOW),
   렌더링은 aurora-ui의 AuroraUI.components.showToast()에 위임한다.
   "로직은 tessera, 화면은 aurora-ui" — 두 자체 라이브러리를 함께 쓰는 실제 예.
   (aurora-ui의 CSS/JS는 각 folio 페이지가 로드; @layer 덕분에 folio 룩은 유지됨)
   ───────────────────────────────────────────────────────────── */
import { eventBus } from '../../tessera-js/js/core/event-bus.js';
import { EVENTS } from '../../tessera-js/js/config/constants.js';

eventBus.on(EVENTS.TOAST_SHOW, (toast) => {
  if (window.AuroraUI && window.AuroraUI.components) {
    window.AuroraUI.components.showToast(toast.message, toast.type ?? 'info', toast.duration ?? 4000);
  } else {
    // aurora-ui 미로드 시 폴백(콘솔) — 정상 페이지에선 항상 로드됨
    console.info('[toast]', toast.message);
  }
});
