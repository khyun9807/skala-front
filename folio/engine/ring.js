/* ─────────────────────────────────────────────────────────────
   folio/engine/ring.js — 회전 이미지 링 / 강강술래 갤러리 (Cipher §4.0 ★시그니처)
   프로젝트 타일들이 중앙 엠블럼을 감싸는 타원 링에 배치되어 스크롤에 따라
   원을 그리며 회전한다. 타일은 '세운 채' 위치만 타원을 따라 이동(강강술래).
   원본은 WebGL 영상 텍스처지만 여기선 DOM 타일 + 타원 좌표 + rAF로 재현.

   기대 마크업: stage(예: #hero-stage) 안에 .ring 요소 하나.
   ───────────────────────────────────────────────────────────── */
import { onFrame, REDUCED, clamp } from './core.js';

/** 라이브러리 없이 자체 SVG data-URI로 추상 '작업 릴' 타일 생성 (실제론 <video> 권장) */
export function makeReel(seed) {
  const h = (seed * 53) % 360, h2 = (h + 50) % 360;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='200'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='hsl(${h},30%,55%)'/><stop offset='1' stop-color='hsl(${h2},34%,17%)'/></linearGradient></defs>
    <rect width='320' height='200' fill='url(#g)'/>
    <g fill='none' stroke='rgba(233,234,228,.26)' stroke-width='1'>
      ${Array.from({ length: 6 }, (_, i) => `<circle cx='160' cy='100' r='${18 + i * 22}'/>`).join('')}
    </g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export function createRing({ stage, count = 12, tile = makeReel, getScroll = () => 0, fadeOnScroll = true } = {}) {
  const ringEl = stage.querySelector('.ring');
  if (!ringEl) return { destroy() {} };
  const tiles = [];
  for (let i = 0; i < count; i++) {
    const t = document.createElement('div');
    t.className = 'folio-tile';
    const bg = tile(i);
    if (bg) t.style.backgroundImage = bg;
    ringEl.appendChild(t);
    tiles.push(t);
  }

  function layout(now) {
    const cx = innerWidth / 2, cy = innerHeight / 2;
    const Rx = Math.min(innerWidth * 0.27, 540);
    const Ry = Math.min(innerHeight * 0.32, 340);
    const scroll = getScroll();
    // idle 회전(강강술래) + 스크롤 가속. 모션 최소화 시 idle 항 제거.
    const phi = (REDUCED ? 0 : now * 0.00006) + scroll * 0.0016;
    for (let i = 0; i < count; i++) {
      const a = phi + i * (Math.PI * 2 / count);
      const x = cx + Rx * Math.cos(a);
      const y = cy + Ry * Math.sin(a);
      const depth = (Math.sin(a) + 1) / 2; // 하단=앞(크고 진하게), 상단=뒤(작고 흐리게)
      const t = tiles[i];
      t.style.transform =
        `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%) scale(${(0.78 + depth * 0.34).toFixed(3)})`;
      t.style.zIndex = Math.round(depth * 100);
      t.style.opacity = (0.5 + depth * 0.5).toFixed(3);
    }
    if (fadeOnScroll) {
      stage.style.opacity = (1 - clamp(scroll / (innerHeight * 0.72), 0, 1)).toFixed(3);
    }
  }

  // 모션 최소화: 한 번만 정적 배치(회전/페이드 없음)
  if (REDUCED) { layout(0); return { destroy() {} }; }

  const stop = onFrame(layout);
  return { destroy() { stop(); } };
}
