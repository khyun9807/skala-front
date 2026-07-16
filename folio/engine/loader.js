/* ─────────────────────────────────────────────────────────────
   folio/engine/loader.js — 도트필드 로더 + 사운드 진입 게이트
   Cipher §4.1 (진행률 셰이더 근사) + Michael Gatt §7.4 (오디오 언락 게이트).
   실제 프리로드(fonts + 이미지 decode)로 진행률을 채우고, 100%에서 게이트를
   띄운다. 사용자 첫 제스처(사운드 켜고 입장 / 무음 입장)에서 onEnter(sound)를
   동기 호출 → 이 컨텍스트에서 AudioContext.resume()로 오디오를 언락할 수 있다.

   기대 마크업(index.html):
     #folio-loader > canvas.folio-loader__dots + .brand + .emblem + .pct + .gate
   ───────────────────────────────────────────────────────────── */
import { onFrame, REDUCED, DPR, lerp, clamp } from './core.js';
import { pnoise } from './dotfield.js';

export function initLoader({ onEnter, preloadImages = [], minMs = 1400, maxMs = 3200 } = {}) {
  const el = document.getElementById('folio-loader');
  if (!el) { onEnter?.(false); return { destroy() {} }; }

  const canvas = el.querySelector('.folio-loader__dots');
  const pctEl = el.querySelector('.folio-loader__pct');
  const gate = el.querySelector('.folio-loader__gate');
  const silentBtn = el.querySelector('.folio-loader__silent');
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

  document.documentElement.classList.add('folio-loading'); // body 스크롤 잠금(CSS)

  let progress = 0, shown = 0, entered = false, gateOpen = false, stop = null;

  // ── 실제 프리로드 → 진행률 ─────────────────────────────
  const jobs = [document.fonts?.ready ?? Promise.resolve()];
  preloadImages.forEach((src) => {
    jobs.push(new Promise((res) => {
      const img = new Image();
      img.onload = img.onerror = () => res();
      img.src = src;
      if (img.decode) img.decode().then(res).catch(() => res());
    }));
  });
  const started = performance.now();
  Promise.all(jobs).then(() => {
    const wait = Math.max(0, minMs - (performance.now() - started));
    setTimeout(() => { progress = 1; }, wait); // 최소 노출시간(연출)
  });
  setTimeout(() => { progress = 1; }, maxMs); // 폰트/에셋이 오래 걸려도 강제 완료

  // ── 게이트 열기(진행률 100% 도달 시) ───────────────────
  function openGate() {
    if (gateOpen) return;
    gateOpen = true;
    if (gate) gate.hidden = false;
    el.classList.add('is-ready');
    el.addEventListener('click', enterWithSound); // 아무 곳이나 클릭 = 사운드 ON
    silentBtn?.addEventListener('click', enterSilent);
  }
  function enterWithSound(ev) { ev?.stopPropagation?.(); enter(true); }
  function enterSilent(ev) { ev?.stopPropagation?.(); enter(false); }

  function enter(sound) {
    if (entered) return;
    entered = true;
    // ★ 유저 제스처 컨텍스트 안에서 동기 호출 → 오디오 언락 가능(자동재생 정책 통과)
    onEnter?.(sound);
    el.classList.add('is-done');
    document.documentElement.classList.remove('folio-loading');
    setTimeout(() => { stop?.(); el.remove(); removeEventListener('resize', size); }, 1000);
  }

  // ── 도트필드 리빌 마스크(진행률 아래 도트만 밝게) ───────
  function draw(now) {
    const t = now * 0.0004;
    const gap = 20 * dpr, r = 1.1 * dpr;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#e9eae4';
    for (let y = 0; y < H; y += gap) {
      for (let x = 0; x < W; x += gap) {
        const n = (pnoise(x, y, t) + 1) / 2;
        const reveal = n < shown ? 1 : 0.1; // 진행률 마스크
        ctx.globalAlpha = (0.06 + n * 0.6) * reveal;
        ctx.beginPath();
        ctx.arc(x, y, r * (0.6 + n), 0, 6.283);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // 모션 최소화: 애니메이션 없이 즉시 게이트
  if (REDUCED) {
    progress = 1; shown = 1;
    if (pctEl) pctEl.textContent = '100%';
    openGate();
    return { destroy() { el.remove(); removeEventListener('resize', size); } };
  }

  stop = onFrame((now) => {
    shown = lerp(shown, progress, 0.06);
    draw(now);
    if (pctEl) pctEl.textContent = Math.round(clamp(shown, 0, 1) * 100) + '%';
    if (progress >= 1 && shown > 0.992) {
      shown = 1;
      if (pctEl) pctEl.textContent = '100%';
      openGate();
    }
  });

  return {
    /** 검증/폴백용: 즉시 진행 완료 */
    forceReady() { progress = 1; },
    destroy() { stop(); el.remove(); removeEventListener('resize', size); },
  };
}
