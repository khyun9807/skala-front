export const easings = {
  linear: (t) => t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
};

/** requestAnimationFrame 기반 범용 tween. 반환값을 호출하면 애니메이션을 취소한다. */
export function animate({ duration = 300, easing = easings.linear, onUpdate, onComplete = () => {} }) {
  const start = performance.now();
  let rafId;
  let cancelled = false;

  function frame(now) {
    if (cancelled) return;
    const progress = Math.min(1, (now - start) / duration);
    onUpdate(easing(progress));
    if (progress < 1) {
      rafId = requestAnimationFrame(frame);
    } else {
      onComplete();
    }
  }

  rafId = requestAnimationFrame(frame);
  return () => {
    cancelled = true;
    cancelAnimationFrame(rafId);
  };
}

/** 숫자 카운터 애니메이션(자기소개 페이지 기술 스택 지표 등에 사용) */
export function animateNumber(el, { from = 0, to, duration = 800, formatter = (n) => String(Math.round(n)) } = {}) {
  return animate({
    duration,
    easing: easings.easeOutQuad,
    onUpdate: (progress) => {
      el.textContent = formatter(from + (to - from) * progress);
    },
  });
}

export function fadeIn(el, duration = 200) {
  el.hidden = false;
  el.style.opacity = "0";
  return animate({ duration, onUpdate: (p) => (el.style.opacity = String(p)) });
}

export function fadeOut(el, duration = 200) {
  return animate({
    duration,
    onUpdate: (p) => (el.style.opacity = String(1 - p)),
    onComplete: () => {
      el.hidden = true;
    },
  });
}

export function slideToggle(el, { duration = 200 } = {}) {
  const isHidden = el.hidden || el.dataset.collapsed === "true";
  if (isHidden) {
    el.hidden = false;
    el.dataset.collapsed = "false";
    const target = el.scrollHeight;
    el.style.overflow = "hidden";
    el.style.height = "0px";
    return animate({
      duration,
      onUpdate: (p) => (el.style.height = `${target * p}px`),
      onComplete: () => {
        el.style.height = "";
        el.style.overflow = "";
      },
    });
  }
  const startHeight = el.scrollHeight;
  el.style.overflow = "hidden";
  el.style.height = `${startHeight}px`;
  return animate({
    duration,
    onUpdate: (p) => (el.style.height = `${startHeight * (1 - p)}px`),
    onComplete: () => {
      el.dataset.collapsed = "true";
      el.style.height = "";
      el.style.overflow = "";
    },
  });
}
