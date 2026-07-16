/* ─────────────────────────────────────────────────────────────
   folio/engine/ring.js — 회전 콘텐츠 링 / 강강술래 갤러리 (Cipher §4.0 ★시그니처)
   중앙 엠블럼을 감싸는 타원 링에 콘텐츠 타일(이미지/영상)을 배치하고 스크롤/idle로 회전.
   타일은 실제 <a> 링크라 호버 반응 + 클릭 시 상세 페이지로 이동한다(포트폴리오·주요활동·블로그).
   ───────────────────────────────────────────────────────────── */
import { onFrame, REDUCED, clamp } from './core.js';

/** 사진이 없는 항목용 SVG 커버(그라디언트 + 동심원) 생성 — tint(hue)로 카테고리 구분 */
export function makeCover(seed = 0, tint = 210) {
  const h = tint, h2 = (tint + 44) % 360;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='200'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='hsl(${h},34%,${26 + (seed % 3) * 7}%)'/>
      <stop offset='1' stop-color='hsl(${h2},42%,11%)'/></linearGradient></defs>
    <rect width='320' height='200' fill='url(#g)'/>
    <g fill='none' stroke='rgba(233,234,228,.16)' stroke-width='1'>
      ${Array.from({ length: 5 }, (_, i) => `<circle cx='160' cy='100' r='${20 + i * 27}'/>`).join('')}
    </g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** 하위호환: 예전 makeReel 이름을 쓰는 곳(장식 고스트 패널)용 별칭 */
export const makeReel = (seed) => makeCover(seed, (seed * 53) % 360);

export function createRing({ stage, items = [], getScroll = () => 0, fadeOnScroll = true } = {}) {
  const ringEl = stage.querySelector('.ring');
  if (!ringEl) return { destroy() {} };
  const tiles = [];
  const N = items.length;

  items.forEach((item) => {
    const a = document.createElement('a');
    a.className = 'folio-tile' + (item.type === 'video' ? ' folio-tile--video' : '');
    a.href = item.href || '#';
    a.dataset.cursor = '열기';
    a.setAttribute('aria-label', `${item.cat} — ${item.title} (자세히 보기)`);

    const media = document.createElement('span');
    media.className = 'folio-tile__media';
    if (item.src) media.style.backgroundImage = item.src.startsWith('url(') ? item.src : `url("${item.src}")`;

    // 영상 타일: 포스터(=src) 위에 실제 <video>를 얹고 호버할 때만 로드·재생한다.
    // (자동재생하면 링 13개가 동시에 수십 MB를 받으므로 preload="none" + 호버 재생)
    if (item.type === 'video' && item.video) {
      const v = document.createElement('video');
      v.className = 'folio-tile__video';
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none';
      v.setAttribute('aria-hidden', 'true');
      const source = document.createElement('source');
      source.src = item.video;
      source.type = item.video.endsWith('.webm') ? 'video/webm' : 'video/mp4';
      v.appendChild(source);
      media.appendChild(v);
      a.addEventListener('pointerenter', () => { v.play().catch(() => {}); });
      a.addEventListener('pointerleave', () => { v.pause(); });
    }

    const overlay = document.createElement('span');
    overlay.className = 'folio-tile__overlay';
    const cat = document.createElement('span'); cat.className = 'folio-tile__cat'; cat.textContent = item.cat;
    const title = document.createElement('span'); title.className = 'folio-tile__title'; title.textContent = item.title;
    overlay.append(cat, title);

    a.append(media, overlay);
    if (item.type === 'video') {
      const play = document.createElement('span'); play.className = 'folio-tile__play'; play.textContent = '▶';
      a.appendChild(play);
    }
    ringEl.appendChild(a);
    tiles.push(a);
  });

  let faded = false;
  function layout(now) {
    const cx = innerWidth / 2, cy = innerHeight / 2;
    const Rx = Math.min(innerWidth * 0.28, 560);
    const Ry = Math.min(innerHeight * 0.33, 360);
    const scroll = getScroll();
    const phi = (REDUCED ? 0 : now * 0.00006) + scroll * 0.0016;
    for (let i = 0; i < N; i++) {
      const ang = phi + i * (Math.PI * 2 / N);
      const x = cx + Rx * Math.cos(ang);
      const y = cy + Ry * Math.sin(ang);
      const depth = (Math.sin(ang) + 1) / 2; // 하단=앞(크고 진하게)
      const t = tiles[i];
      t.style.transform =
        `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%) scale(${(0.72 + depth * 0.4).toFixed(3)})`;
      t.style.zIndex = Math.round(depth * 100);
      t.style.opacity = (0.55 + depth * 0.45).toFixed(3);
    }
    if (fadeOnScroll) {
      const op = 1 - clamp(scroll / (innerHeight * 0.72), 0, 1);
      stage.style.opacity = op.toFixed(3);
      const shouldFade = op < 0.55; // 스크롤로 흐려지면 타일 클릭 비활성(아래 섹션 가리지 않게)
      if (shouldFade !== faded) { faded = shouldFade; stage.classList.toggle('is-faded', faded); }
    }
  }

  if (REDUCED) { layout(0); return { destroy() {} }; }
  const stop = onFrame(layout);
  return { destroy() { stop(); } };
}
