/* ─────────────────────────────────────────────────────────────
   folio/engine/core.js — 시네마틱 엔진 공용 유틸 + 단일 rAF 스케줄러
   외부 의존 0. (Cipher §6 유틸 + Michael Gatt 부록 A.8 프레임독립 감쇠)
   ───────────────────────────────────────────────────────────── */

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const round = (v, n = 3) => Number(v.toFixed(n));

/* 프레임레이트 독립 지수 감쇠 — 120Hz에서도 동일한 감(MG A.8).
   lerp(a,b,0.08)은 프레임레이트에 의존하므로 카메라/시차 같은
   "목표를 부드럽게 좇는" 값은 damp를 쓴다. */
export const damp = (a, b, lambda, dt) => b + (a - b) * Math.exp(-lambda * dt);

/* 시그니처 큐빅 베지어 샘플러 — Cipher 실측 (.83,.12,.35,.96) 을 JS로.
   원본과 동일한 '손맛'을 rAF 트윈에서 재현하기 위한 것. */
export function cubicBezier(p1x, p1y, p2x, p2y) {
  const cx = 3 * p1x, bx = 3 * (p2x - p1x) - cx, ax = 1 - cx - bx;
  const cy = 3 * p1y, by = 3 * (p2y - p1y) - cy, ay = 1 - cy - by;
  const fx = (t) => ((ax * t + bx) * t + cx) * t;
  const fy = (t) => ((ay * t + by) * t + cy) * t;
  const dfx = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    let t = x;
    for (let i = 0; i < 5; i++) {
      const e = fx(t) - x;
      if (Math.abs(e) < 1e-4) break;
      t -= e / (dfx(t) || 1e-6);
    }
    return fy(clamp(t, 0, 1));
  };
}
export const EASE = cubicBezier(0.83, 0.12, 0.35, 0.96);

/* 인트로/전환용 이징 (MG A.8) */
export const expoOut = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const cubicIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* 환경 플래그 (라이브 — export let 은 import 측에서 최신값 반영) */
const mqReduced = matchMedia('(prefers-reduced-motion: reduce)');
const mqFine = matchMedia('(pointer: fine)');
export let REDUCED = mqReduced.matches;
export let FINE = mqFine.matches;
mqReduced.addEventListener?.('change', (e) => { REDUCED = e.matches; });
mqFine.addEventListener?.('change', (e) => { FINE = e.matches; });

export const DPR = () => Math.min(window.devicePixelRatio || 1, 2);

/* 공용 포인터 — 전역 pointermove 리스너는 하나로 합친다(CLAUDE.md 함정 #7).
   여러 rAF 루프(커서/도트필드/패널 시차)가 이 값을 읽어간다.
   px/py = 픽셀 좌표, x/y = 0..1 정규화. */
export const pointer = {
  px: window.innerWidth / 2, py: window.innerHeight / 2, x: 0.5, y: 0.5,
};
addEventListener('mousemove', (e) => {
  pointer.px = e.clientX; pointer.py = e.clientY;
  pointer.x = e.clientX / window.innerWidth;
  pointer.y = e.clientY / window.innerHeight;
}, { passive: true });

/* ── 단일 rAF 스케줄러 ──────────────────────────────────────
   전역 리스너/루프를 하나로 합친다(CLAUDE.md 함정 #7).
   콜백 시그니처: (nowMs, dt초, t초). 한 콜백이 던져도 루프는 유지.
   document.hidden 이면 정지(함정 #5/#9 — 배경 탭에서 영원히 안 끝나는 작업 방지). */
const subs = new Set();
let running = false;
let prevT = 0;

function loop(nowMs) {
  const t = nowMs / 1000;
  const dt = prevT ? Math.min(t - prevT, 0.05) : 1 / 60; // dt 상한(탭 복귀 튐 방지)
  prevT = t;
  for (const cb of subs) {
    try { cb(nowMs, dt, t); }
    catch (err) { console.error('[folio onFrame]', err); }
  }
  if (running) requestAnimationFrame(loop);
}

export function onFrame(cb) {
  subs.add(cb);
  if (!running) { running = true; prevT = 0; requestAnimationFrame(loop); }
  return function off() {
    subs.delete(cb);
    if (subs.size === 0) running = false;
  };
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    running = false;
  } else if (subs.size && !running) {
    running = true; prevT = 0; requestAnimationFrame(loop);
  }
});

/* 유틸: 다음 페인트 후 1회 실행 (setTimeout 기반 — rAF 폴링 금지, 함정 #5) */
export const nextTick = (fn) => setTimeout(fn, 0);

/* 검증 전용: 자동화 브라우저 탭은 document.hidden 으로 판정되어 rAF가
   멈춘다(함정 #9). 그 상태에서 캔버스 애니메이션(도트필드/링/EQ)의 한 프레임을
   강제로 진행시켜 스크린샷으로 확인하기 위한 개발용 훅. 프로덕션에선 호출되지 않는다. */
export function debugTick(steps = 60, dtMs = 16) {
  let now = performance.now();
  for (let i = 0; i < steps; i++) {
    now += dtMs;
    for (const cb of subs) {
      try { cb(now, dtMs / 1000, now / 1000); } catch (err) { console.error('[folio debugTick]', err); }
    }
  }
  return now;
}
