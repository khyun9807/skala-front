/* ─────────────────────────────────────────────────────────────
   script/folio/index.js — 허브(index.html) 배선 진입점
   엔진(folio/engine/*) + TesseraJS 로직(features/services)을 페이지 DOM에 배선.
   import 경로는 이 파일 URL(/script/folio/index.js) 기준.
   (참조 구현: script/v4/index.js — 동일 로직을 시네마틱 DOM에 재배선)
   ───────────────────────────────────────────────────────────── */
import './toast.js'; // tessera 이벤트버스 → folio 토스트 렌더 (side-effect)
import { initGames } from './games.js';

import { createSmoothScroll } from '../../folio/engine/smooth-scroll.js';
import { initCursor } from '../../folio/engine/cursor.js';
import { initReveals } from '../../folio/engine/reveal.js';
import { initThemeInvert } from '../../folio/engine/theme.js';
import { createDotField } from '../../folio/engine/dotfield.js';
import { createRing, makeReel, makeCover } from '../../folio/engine/ring.js';
import { createPanelField } from '../../folio/engine/panels.js';
import { createPanelUniverse } from '../../folio/engine/panels-webgl.js';
import { initLoader } from '../../folio/engine/loader.js';
import { createAudio } from '../../folio/engine/audio.js';

import { recordVisitStart, getRecentEvents } from '../../tessera-js/js/features/visitor.js';
import { convertCurrency } from '../../tessera-js/js/services/exchange-service.js';
import { showToast } from '../../tessera-js/js/features/notifications.js';
import { apiClient } from '../../tessera-js/js/network/api-client.js';
import { search, recordSearchTerm } from '../../tessera-js/js/features/search.js';
import { localStore } from '../../tessera-js/js/storage/local-storage.js';
import { debounce } from '../../tessera-js/js/utils/debounce.js';
import { relativeTime } from '../../tessera-js/js/utils/date.js';

/* aurora-ui 컴포넌트 시스템(토스트/뱃지 등) 초기화. folio 엔진과 겹치는 spatial/interactions는 로드/init 안 함. */
window.AuroraUI?.components?.init?.();

/* ════════ 엔진: 스크롤 · 커서 · 리빌 · 테마 · 배경 · 링 · 패널 ════════ */
const scroll = createSmoothScroll({
  content: document.getElementById('scroll-content'),
  spacer: document.getElementById('scroll-spacer'),
});
initCursor();
initReveals({ manual: true });
initThemeInvert();
createDotField({ canvas: document.getElementById('folio-bg') });
// 히어로 회전 링 = 포트폴리오·주요활동·블로그 콘텐츠 타일(이미지/영상). 클릭 시 상세 페이지로.
const HERO_ITEMS = [
  { type: 'image', cat: 'PORTFOLIO', title: '홋카이도 여행', src: '../media/hokkaido.svg', href: 'trip.html' },
  { type: 'image', cat: 'PORTFOLIO', title: '세부 다이빙', src: '../media/cebu.svg', href: 'trip.html' },
  { type: 'image', cat: 'PORTFOLIO', title: '리장 고성', src: '../media/lijiang.svg', href: 'trip.html' },
  { type: 'image', cat: 'PORTFOLIO', title: '프로젝트 아카이브', src: makeCover(1, 26), href: 'profile.html' },
  { type: 'video', cat: 'ACTIVITY', title: '주간 강의 하이라이트', src: makeCover(2, 210), href: 'class.html' },
  { type: 'image', cat: 'ACTIVITY', title: '개인 일정 관리', src: makeCover(3, 210), href: 'class.html' },
  { type: 'video', cat: 'ACTIVITY', title: '회원 온보딩', src: makeCover(4, 268), href: 'signup.html' },
  { type: 'video', cat: 'ACTIVITY', title: '실시간 대시보드', src: makeCover(5, 200), href: '#signal' },
  { type: 'image', cat: 'BLOG', title: '바닐라 상태관리', src: makeCover(6, 150), href: 'blog.html' },
  { type: 'video', cat: 'BLOG', title: 'Web Worker 검색', src: makeCover(7, 150), href: 'blog.html' },
  { type: 'image', cat: 'BLOG', title: 'IndexedDB 일정', src: makeCover(8, 150), href: 'blog.html' },
  { type: 'image', cat: 'PORTFOLIO', title: '나를 소개합니다', src: makeCover(9, 26), href: 'profile.html' },
];
createRing({ stage: document.getElementById('hero-stage'), items: HERO_ITEMS, getScroll: () => scroll.current });

// 패널 필드(nav) — 장식 패널엔 추상 릴 배경을 깔아 밀도 부여
document.querySelectorAll('.folio-panel--ghost').forEach((el, i) => { el.style.backgroundImage = makeReel(i + 7); });
createPanelField({ scene: document.getElementById('panel-scene'), getScroll: () => scroll.current });

// WebGL2 우주 배경(하이브리드 장식) — 미지원/reduced-motion이면 조용히 폴백(CSS-3D 고스트/오빗)
const universe = createPanelUniverse({
  canvas: document.querySelector('.folio-universe'),
  host: document.querySelector('.folio-constellation'),
});
if (universe.supported) document.querySelectorAll('.folio-panel--ghost').forEach((el) => { el.style.display = 'none'; });

/* ════════ 오디오 EQ + 로더/게이트 ════════ */
const eqEl = document.getElementById('folio-eq');
const bars = [];
for (let i = 0; i < 20; i++) { const b = document.createElement('span'); b.className = 'folio-eq__bar'; eqEl.appendChild(b); bars.push(b); }
const audio = createAudio({ src: '../media/bgm.wav', bars, muteToggle: document.querySelector('.folio-mute') });
const loader = initLoader({ onEnter: (sound) => { audio.unlock(sound); } });

/* ════════ <main> dispatch: 오늘 날짜 + 아카이브 검색(Web Worker) ════════ */
document.getElementById('today-date').textContent =
  new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

// 연도 진행률 → <progress>
(() => {
  const y = new Date().getFullYear();
  const start = new Date(y, 0, 1), end = new Date(y + 1, 0, 1), now = new Date();
  const pct = Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));
  const pg = document.getElementById('year-progress');
  if (pg) { pg.value = pct; pg.textContent = pct.toFixed(1) + '%'; }
  const lbl = document.getElementById('year-progress-label');
  if (lbl) lbl.textContent = `${pct.toFixed(1)}% of ${y}`;
})();

async function fetchJSON(path) {
  const { data } = await apiClient.get(path, { cache: { enabled: true, ttl: 5 * 60_000 } });
  return data;
}
let searchIndexPromise = null;
function getSearchIndex() {
  if (!searchIndexPromise) {
    searchIndexPromise = Promise.all([
      fetchJSON('../tessera-js/data/profile.json'),
      fetchJSON('../tessera-js/data/schedules.json'),
      fetchJSON('../tessera-js/data/travel-posts.json'),
    ]).then(([profile, schedules, travels]) => [
      ...(profile.projects ?? []).map((p) => ({ ...p, _kind: '프로젝트', _label: p.title, _href: 'profile.html' })),
      ...(schedules ?? []).map((s) => ({ ...s, _kind: '수업/일정', _label: s.title, _href: 'class.html' })),
      ...(travels ?? []).map((t) => ({ ...t, _kind: '여행', _label: t.title, _href: 'trip.html' })),
    ]);
  }
  return searchIndexPromise;
}
(function initSearch() {
  const input = document.getElementById('archive-search');
  const panel = document.getElementById('archive-results');
  if (!input || !panel) return;

  function renderResults(results) {
    panel.textContent = '';
    results.slice(0, 8).forEach((item) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item._href;
      a.dataset.cursor = 'open';
      const name = document.createElement('span'); name.textContent = item._label;
      const kind = document.createElement('span'); kind.textContent = item._kind;
      a.append(name, kind); li.appendChild(a); panel.appendChild(li);
    });
  }
  const handle = debounce(async () => {
    const q = input.value.trim();
    if (!q) { panel.textContent = ''; return; }
    const items = await getSearchIndex();
    recordSearchTerm(q);
    const results = await search(q, items, ['title', '_label']);
    renderResults(results);
  }, 200);
  input.addEventListener('input', handle);
  document.addEventListener('keydown', (e) => {
    if (e.key !== '/' || e.isComposing) return;
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    e.preventDefault(); input.focus();
  });
})();

/* ════════ <aside> HUD: 방문자 · 환율 · 네트워크 · 토스트 ════════ */
async function renderVisitor() {
  const stats = recordVisitStart('folio-index');
  document.getElementById('hud-visitor').textContent = stats.isFirstVisit
    ? '이 브라우저의 첫 방문입니다.'
    : `${stats.visitCount}회 방문 · 마지막 ${relativeTime(stats.lastVisitAt)}`;

  const timeline = document.getElementById('hud-timeline');
  const events = await getRecentEvents(4);
  timeline.textContent = '';
  (events.length ? events : [{ timestamp: Date.now(), type: 'quiet' }]).forEach((ev) => {
    const item = document.createElement('div'); item.className = 'folio-timeline__item';
    const time = document.createElement('span'); time.className = 'folio-timeline__time';
    time.textContent = relativeTime(ev.timestamp);
    const p = document.createElement('span');
    p.textContent = ev.type === 'pageview' ? `${ev.page ?? ''} 방문`
      : ev.type === 'scroll-depth' ? `스크롤 ${Math.round((ev.depth ?? 0) * 100)}%`
      : ev.type === 'click' ? '클릭' : '활동 기록 없음';
    item.append(time, p); timeline.appendChild(item);
  });
}
async function renderExchange() {
  const el = document.getElementById('hud-exchange');
  const note = document.getElementById('hud-exchange-note');
  try {
    const env = await convertCurrency(1, 'USD', 'KRW');
    const prev = localStore.get('folio-usd-krw', null);
    localStore.set('folio-usd-krw', env.rate);
    el.textContent = '';
    el.append(document.createTextNode('1 USD = '));
    if (prev != null && prev !== env.rate) {
      const del = document.createElement('del'); del.textContent = `${Math.round(prev).toLocaleString()}원`;
      const ins = document.createElement('ins'); ins.textContent = `${Math.round(env.rate).toLocaleString()}원`;
      el.append(del, document.createTextNode(' → '), ins);
    } else {
      el.append(document.createTextNode(`${Math.round(env.rate).toLocaleString()}원`));
    }
    note.textContent = `provider: ${env.provider} · ${env.data?.date ?? ''}`;
  } catch {
    el.textContent = '환율 정보를 가져오지 못했습니다.';
  }
}
function updateNetwork() {
  const el = document.getElementById('hud-network');
  el.textContent = navigator.onLine ? '온라인' : '오프라인';
  el.className = `aur-badge aur-badge--${navigator.onLine ? 'success' : 'danger'}`;
}
document.getElementById('hud-toast-test').addEventListener('click', () => {
  showToast('TesseraJS 이벤트 버스로 발행되고 folio 렌더러로 그려진 토스트입니다.', { type: 'success' });
});
updateNetwork();
addEventListener('online', updateNetwork);
addEventListener('offline', updateNetwork);
renderVisitor();
renderExchange();

/* ════════ JS 실습 게임 (인-월드 + classic 토글) ════════ */
initGames({ root: document.querySelector('[data-games]') });

/* ════════ 내부 앵커 스무스 이동 ════════ */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (ev) => {
    const id = a.getAttribute('href');
    if (id === '#') { ev.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const target = document.querySelector(id);
    if (!target) return;
    ev.preventDefault();
    scroll.scrollToEl(target);
  });
});

window.__folio = { scroll, audio, loader };
