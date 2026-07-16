/* ─────────────────────────────────────────────────────────────
   folio/engine/theme.js — 섹션별 다크↔라이트 테마 반전 (Cipher §4.4)
   화면 중앙(50%)을 점유한 [data-theme] 섹션의 값으로 루트 클래스를 스왑.
   실제 색 전환은 tokens.css의 @property --bg/--fg 트랜지션이 담당.
   (aurora-ui/js/theme.js 와는 완전히 별개 — 이건 시네마틱 반전 전용)
   ───────────────────────────────────────────────────────────── */
import { onFrame } from './core.js';

export function initThemeInvert({ root = document } = {}) {
  const sections = [...root.querySelectorAll('[data-theme]')];
  if (!sections.length) return { destroy() {} };

  function update() {
    const mid = innerHeight * 0.5;
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) {
        const light = s.dataset.theme === 'light';
        document.documentElement.classList.toggle('theme-light', light);
        document.documentElement.classList.toggle('theme-dark', !light);
        break;
      }
    }
  }

  const stop = onFrame(update);
  return { destroy() { stop(); } };
}
