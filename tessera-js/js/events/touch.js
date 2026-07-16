/**
 * Pointer Event 기반(마우스/터치/펜 통합) 제스처. 순수 touch 이벤트는 보조적으로만 필요할 때 쓴다.
 */
export function onSwipe(el, { onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 40 } = {}) {
  let startX = 0;
  let startY = 0;
  let tracking = false;

  function handlePointerDown(event) {
    tracking = true;
    startX = event.clientX;
    startY = event.clientY;
  }

  function handlePointerUp(event) {
    if (!tracking) return;
    tracking = false;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > threshold) onSwipeRight?.();
      else if (dx < -threshold) onSwipeLeft?.();
    } else if (dy > threshold) {
      onSwipeDown?.();
    } else if (dy < -threshold) {
      onSwipeUp?.();
    }
  }

  el.addEventListener("pointerdown", handlePointerDown);
  el.addEventListener("pointerup", handlePointerUp);
  return () => {
    el.removeEventListener("pointerdown", handlePointerDown);
    el.removeEventListener("pointerup", handlePointerUp);
  };
}

/** 길게 누르기(일정 카드 컨텍스트 메뉴, 모바일 대응) */
export function onLongPress(el, handler, { delay = 500 } = {}) {
  let timerId = null;
  function start(event) {
    timerId = setTimeout(() => handler(event), delay);
  }
  function cancel() {
    clearTimeout(timerId);
  }
  el.addEventListener("pointerdown", start);
  el.addEventListener("pointerup", cancel);
  el.addEventListener("pointerleave", cancel);
  el.addEventListener("pointercancel", cancel);
  return () => {
    el.removeEventListener("pointerdown", start);
    el.removeEventListener("pointerup", cancel);
    el.removeEventListener("pointerleave", cancel);
    el.removeEventListener("pointercancel", cancel);
  };
}
