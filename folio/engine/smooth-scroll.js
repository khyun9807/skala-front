/* ─────────────────────────────────────────────────────────────
   folio/engine/smooth-scroll.js — 관성 가상 스크롤 (Lenis 대체)
   Cipher §4.3 / MG §7.2. content를 fixed로 두고 transform으로 이동,
   실제 스크롤 높이는 spacer가 확보한다. 매 프레임 목표(scrollY)를 lerp.
   ───────────────────────────────────────────────────────────── */
import { onFrame, REDUCED } from './core.js';

export function createSmoothScroll({ content, spacer, ease = 0.085 } = {}) {
  const state = { current: 0, target: 0 };
  const e = REDUCED ? 1 : ease; // 모션 최소화 시 즉시(관성 제거)

  function size() {
    if (spacer && content) spacer.style.height = content.scrollHeight + 'px';
  }
  function onScroll() { state.target = window.scrollY; }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', size);
  size();
  requestAnimationFrame(size);      // 초기 레이아웃 후 재계산
  document.fonts?.ready.then(size); // 웹폰트 로드 후 높이 재계산

  const stop = onFrame(() => {
    state.current += (state.target - state.current) * e;
    if (Math.abs(state.current - state.target) < 0.05) state.current = state.target;
    if (content) content.style.transform = `translate3d(0, ${-state.current}px, 0)`;
  });

  return {
    get current() { return state.current; },
    get target() { return state.target; },
    /** 앵커 등으로 특정 y로 스무스 이동 (변형 보정 포함) */
    scrollToEl(el) {
      if (!el) return;
      const y = el.getBoundingClientRect().top + state.current;
      window.scrollTo({ top: y, behavior: REDUCED ? 'auto' : 'smooth' });
    },
    size,
    destroy() {
      stop();
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', size);
      if (content) content.style.transform = '';
    },
  };
}
