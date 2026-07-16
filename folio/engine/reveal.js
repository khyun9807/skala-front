/* ─────────────────────────────────────────────────────────────
   folio/engine/reveal.js — blur 리빌 + 키네틱 타이포 분해
   Cipher §4.5 (blurry_els) + MG §7.5 (SplitText 없이 글자/단어 분해).
   · manual=false: IntersectionObserver (네이티브 스크롤 서브문서용)
   · manual=true : rAF+getBoundingClientRect (허브의 transform 콘텐츠용 —
     IO는 변형된 조상 안에서 부정확할 수 있어 실좌표를 직접 읽는다)
   ───────────────────────────────────────────────────────────── */
import { onFrame, REDUCED } from './core.js';

/** [data-split] 안의 문장을 단어 <span>으로 분해(stagger). <br>은 보존. */
export function splitWords(root = document) {
  root.querySelectorAll('[data-split]').forEach((el) => {
    if (el.dataset.splitDone) return;
    const parts = el.innerHTML.split(/(<br\s*\/?>)/i);
    let idx = 0, html = '';
    parts.forEach((p) => {
      if (/<br/i.test(p)) { html += p; return; }
      html += p
        .split(' ')
        .filter(Boolean)
        .map((w) => `<span class="folio-w" style="--i:${idx++}">${w}</span>`)
        .join(' ');
    });
    el.innerHTML = html;
    el.dataset.splitDone = '1';
  });
}

export function initReveals({ root = document, manual = false } = {}) {
  splitWords(root);
  const els = [...root.querySelectorAll('.reveal')];

  // 모션 최소화: 전부 즉시 표시
  if (REDUCED) {
    els.forEach((el) => el.classList.add('in'));
    return { destroy() {} };
  }

  if (manual) {
    let pending = els.slice();
    let first = true;
    const stop = onFrame(() => {
      const vh = innerHeight;
      // 첫 프레임: 이미 뷰포트 안에 있는 요소(히어로 등)는 스크롤 없이도 리빌.
      // 이후: 하단 85%를 넘어 올라오면 리빌(스크롤 도중 살짝 미리).
      const limit = first ? vh : vh * 0.85;
      for (let i = pending.length - 1; i >= 0; i--) {
        if (pending[i].getBoundingClientRect().top < limit) {
          pending[i].classList.add('in');
          pending.splice(i, 1);
        }
      }
      first = false;
      if (!pending.length) stop();
    });
    return { destroy() { stop(); } };
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: '0px 0px -12% 0px' }
  );
  els.forEach((el) => io.observe(el));
  return { destroy() { io.disconnect(); } };
}
