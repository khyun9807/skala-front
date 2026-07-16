/* ─────────────────────────────────────────────────────────────
   folio/engine/cursor.js — 커스텀 커서 (Cipher §4.2 큐브 + MG §7.6 텍스트 라벨)
   큐브가 lerp로 지연 추적(관성), 라벨은 mix-blend-mode:difference로 어떤
   배경에서도 가독. [data-cursor="라벨"] 요소 hover 시 확대 + 라벨 표시.
   pointer:coarse(터치)에서는 완전 비활성. 열린 dialog(top-layer)에선 숨김.
   ───────────────────────────────────────────────────────────── */
import { onFrame, FINE, lerp, pointer } from './core.js';

export function initCursor() {
  if (!FINE) return { destroy() {} }; // 터치 기기: 커서 시스템 자체를 끔

  document.documentElement.classList.add('folio-cursor-on');
  const cube = document.createElement('div');
  cube.className = 'folio-cursor';
  const label = document.createElement('div');
  label.className = 'folio-cursor-label';
  document.body.append(cube, label);

  let cx = pointer.px, cy = pointer.py; // 지연 추적 현재값 (목표는 공용 pointer)

  // 위임: [data-cursor] hover 진입/이탈
  const onOver = (ev) => {
    const el = ev.target.closest?.('[data-cursor]');
    if (!el) return;
    cube.classList.add('is-big');
    label.textContent = el.dataset.cursor || '';
    label.classList.add('is-show');
  };
  const onOut = (ev) => {
    const el = ev.target.closest?.('[data-cursor]');
    if (el && !el.contains(ev.relatedTarget)) {
      cube.classList.remove('is-big');
      label.classList.remove('is-show');
    }
  };
  document.addEventListener('mouseover', onOver);
  document.addEventListener('mouseout', onOut);

  // top-layer 가드: showModal()로 열린 dialog는 z-index 무관하게 최상위이므로
  // 커스텀 커서가 그 아래 깔린다 → 열려 있는 동안 커서를 숨기고 OS 커서로 복귀.
  function syncGuard() {
    const modalOpen = !!document.querySelector('dialog[open]');
    cube.style.display = modalOpen ? 'none' : '';
    label.style.display = modalOpen ? 'none' : '';
    document.documentElement.classList.toggle('folio-cursor-on', !modalOpen);
  }
  const guard = new MutationObserver(syncGuard);
  guard.observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['open'] });

  const stop = onFrame(() => {
    cx = lerp(cx, pointer.px, 0.2);
    cy = lerp(cy, pointer.py, 0.2);
    cube.style.transform = `translate(${cx}px, ${cy}px)`;
    label.style.transform = `translate(${pointer.px}px, ${pointer.py}px)`;
  });

  return {
    destroy() {
      stop();
      guard.disconnect();
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      cube.remove();
      label.remove();
      document.documentElement.classList.remove('folio-cursor-on');
    },
  };
}
