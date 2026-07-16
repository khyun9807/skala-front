/* ─────────────────────────────────────────────────────────────
   folio/engine/dotfield.js — 배경 도트필드 (Cipher §4.7 Canvas 2D 근사)
   격자 도트를 값-노이즈로 물결치게 하고 마우스 패럴랙스를 더한다.
   다크 테마에서만 보이고, 라이트 구간에선 CSS로 페이드아웃(engine.css).
   ───────────────────────────────────────────────────────────── */
import { onFrame, DPR, REDUCED, pointer } from './core.js';

export function pnoise(x, y, t) {
  return (Math.sin(x * 0.0022 + t) + Math.sin(y * 0.0026 - t * 0.8) + Math.sin((x + y) * 0.0012 + t * 1.3)) / 3;
}

export function createDotField({ canvas, color = '#e9eae4' } = {}) {
  const ctx = canvas.getContext('2d');
  let W, H, dpr = DPR();

  function size() {
    dpr = DPR();
    W = canvas.width = Math.floor(innerWidth * dpr);
    H = canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
  }
  size();
  addEventListener('resize', size);

  function draw(now) {
    const t = now * 0.0004;
    const gap = 20 * dpr;
    const r = 1.1 * dpr;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = color;
    const parX = (pointer.x - 0.5) * 30 * dpr;
    const parY = (pointer.y - 0.5) * 30 * dpr;
    for (let y = 0; y < H; y += gap) {
      for (let x = 0; x < W; x += gap) {
        const n = (pnoise(x + parX, y + parY, t) + 1) / 2;
        ctx.globalAlpha = 0.06 + n * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, r * (0.5 + n), 0, 6.283);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // 모션 최소화: 정적 한 프레임만 그림
  if (REDUCED) {
    requestAnimationFrame((now) => draw(now));
    return { size, destroy() { removeEventListener('resize', size); } };
  }

  const stop = onFrame((now) => {
    // 라이트 구간에선 배경 도트가 CSS로 opacity:0 → 그릴 필요 없음(프레임 예산 절약)
    if (document.documentElement.classList.contains('theme-light')) return;
    draw(now);
  });
  return { size, destroy() { stop(); removeEventListener('resize', size); } };
}
