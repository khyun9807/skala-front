/* ─────────────────────────────────────────────────────────────
   script/folio/page.js — 서브문서 공용 부트스트랩
   허브(index)와 달리 서브문서는 네이티브 스크롤을 쓴다(폼 GET 이동/일반 문서에 자연스러움).
   → 리빌은 IntersectionObserver(manual:false), 커서/테마반전/배경 도트필드 공통 초기화.
   ───────────────────────────────────────────────────────────── */
import { initCursor } from '../../folio/engine/cursor.js';
import { initReveals } from '../../folio/engine/reveal.js';
import { initThemeInvert } from '../../folio/engine/theme.js';
import { createDotField } from '../../folio/engine/dotfield.js';
import { createAudio } from '../../folio/engine/audio.js';

export function initPage({ dotfield = true, audioSrc = '../media/bgm.wav' } = {}) {
  initCursor();
  initReveals({ manual: false });
  initThemeInvert();

  const bg = document.getElementById('folio-bg');
  if (dotfield && bg) createDotField({ canvas: bg });

  // 오디오: 서브문서엔 사운드 게이트가 없으므로 mute 버튼 클릭(유저 제스처)에서 언락/재생
  const eqEl = document.getElementById('folio-eq');
  const mute = document.querySelector('.folio-mute');
  let audio = null;
  if (eqEl && mute) {
    const bars = [];
    for (let i = 0; i < 20; i++) { const b = document.createElement('span'); b.className = 'folio-eq__bar'; eqEl.appendChild(b); bars.push(b); }
    audio = createAudio({ src: audioSrc, bars, muteToggle: mute });
  }

  // aurora-ui 컴포넌트 시스템(토스트/뱃지 등) 초기화. spatial/interactions는 로드 안 함(folio 엔진과 충돌 방지).
  window.AuroraUI?.components?.init?.();

  // 진입 페이드인(문서 전환 느낌)
  requestAnimationFrame(() => document.documentElement.classList.add('folio-ready'));
  return { audio };
}
