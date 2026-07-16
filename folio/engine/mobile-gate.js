/* ─────────────────────────────────────────────────────────────
   folio/engine/mobile-gate.js — 모바일 접근 시 v4 안내 게이트
   v5 시네마틱 엔진(가상 스크롤·3D 오빗·캔버스 도트필드)은 데스크톱
   전용이므로, 모바일 접근 시 시네마틱 안내 후 v4로 유도한다.
   <head>에서 blocking으로 로드 → body 파싱 전에 은폐 스타일을 주입.
   ───────────────────────────────────────────────────────────── */
(function () {
  var ua = navigator.userAgent;
  var mm = window.matchMedia;
  var isMobile =
    /iPhone|iPod/.test(ua) ||
    (/Android/.test(ua) && /Mobile/.test(ua)) ||
    (mm && mm('(hover: none) and (pointer: coarse)').matches && window.innerWidth < 768);

  if (!isMobile) return;

  /* ── 현재 페이지 → v4 매핑 ── */
  var page = location.pathname.split('/').pop() || 'index.html';
  var map = {
    'index.html':         '../html/index.v4.html',
    'profile.html':       '../html/myProfile.v4.html',
    'class.html':         '../html/myClass.v4.html',
    'trip.html':          '../html/myTrip.v4.html',
    'signup.html':        '../html/signUp.v4.html',
    'signup-result.html': '../html/signUpResult.v4.html',
    'holiday.html':       '../html/myHoliday.v4.html',
    'blog.html':          '../html/index.v4.html',
  };
  var v4 = map[page] || '../html/index.v4.html';

  /* ── 즉시 스타일 주입 (body 파싱 전 — 깜빡임 방지) ── */
  var s = document.createElement('style');
  s.textContent = [
    /* 페이지 콘텐츠 은폐 */
    'html { background: #060403 !important; }',
    'body { margin:0; padding:0; background:#060403 !important; overflow:hidden; height:100%; }',
    'body > *:not(.mobile-gate) { display:none !important; }',

    /* 키프레임 */
    '@keyframes mg-in { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }',
    '@keyframes mg-spin  { to { transform:rotate(360deg); } }',
    '@keyframes mg-rspin { to { transform:rotate(-360deg); } }',
    '@keyframes mg-float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }',
    '@keyframes mg-pulse { 0%,100% { opacity:.35; } 50% { opacity:.6; } }',

    /* 게이트 레이아웃 */
    '.mobile-gate {',
    '  position:fixed; inset:0; z-index:99999;',
    '  display:flex; flex-direction:column; align-items:center; justify-content:center;',
    '  text-align:center; padding:40px 28px;',
    '  padding-top:max(40px, env(safe-area-inset-top));',
    '  padding-bottom:max(40px, env(safe-area-inset-bottom));',
    '  background:#060403; color:#e9eae4;',
    '  font-family:"Space Grotesk",ui-sans-serif,system-ui,-apple-system,sans-serif;',
    '  -webkit-font-smoothing:antialiased;',
    '}',

    /* 엠블럼 */
    '.mg-emblem { position:relative; width:40px; height:40px; margin-bottom:44px; color:#e9eae4; animation:mg-float 4s ease-in-out infinite; }',
    '.mg-emblem svg { position:absolute; inset:0; width:100%; height:100%; }',
    '.mg-emblem .e1 { animation:mg-spin 9s linear infinite; }',
    '.mg-emblem .e2 { animation:mg-rspin 6s linear infinite; opacity:.6; }',

    /* 타이틀 */
    '.mg-title {',
    '  margin:0 0 28px;',
    '  font-family:"Fraunces",Georgia,"Times New Roman",serif;',
    '  font-weight:330; font-optical-sizing:auto;',
    '  font-size:32px; line-height:1.12; letter-spacing:-.01em;',
    '  animation:mg-in .9s cubic-bezier(.83,.12,.35,.96) both;',
    '}',
    '.mg-title em { font-style:italic; }',

    /* 본문 */
    '.mg-body {',
    '  margin:0 0 44px; max-width:28ch;',
    '  font-size:13px; line-height:1.9; letter-spacing:.01em; opacity:.6;',
    '  animation:mg-in .9s cubic-bezier(.83,.12,.35,.96) .12s both;',
    '}',

    /* CTA 버튼 */
    '.mg-cta {',
    '  display:inline-flex; align-items:center; gap:12px;',
    '  padding:16px 36px;',
    '  border:1px solid rgba(233,234,228,.32); border-radius:999px;',
    '  color:#e9eae4; text-decoration:none;',
    '  font-family:"Fraunces",Georgia,serif; font-size:18px; font-weight:350;',
    '  -webkit-tap-highlight-color:rgba(233,234,228,.06);',
    '  animation:mg-in .9s cubic-bezier(.83,.12,.35,.96) .24s both;',
    '}',
    '.mg-cta:active { background:rgba(233,234,228,.1); }',
    '.mg-cta-arrow { display:inline-block; transition:transform .3s cubic-bezier(.83,.12,.35,.96); }',
    '.mg-cta:active .mg-cta-arrow { transform:translateX(5px); }',

    /* CTA 보조 텍스트 */
    '.mg-sub {',
    '  margin:18px 0 0; font-size:10px; text-transform:uppercase;',
    '  letter-spacing:.18em; opacity:.32;',
    '  animation:mg-in .9s cubic-bezier(.83,.12,.35,.96) .36s both;',
    '}',

    /* 하단 라벨 */
    '.mg-ver {',
    '  margin:28px 0 0; font-size:9px; text-transform:uppercase;',
    '  letter-spacing:.22em; opacity:.2;',
    '  animation:mg-pulse 3s ease-in-out 1s infinite;',
    '}',

    /* 푸터 */
    '.mg-footer {',
    '  position:absolute; bottom:max(22px, env(safe-area-inset-bottom));',
    '  left:50%; transform:translateX(-50%);',
    '  font-size:9px; text-transform:uppercase; letter-spacing:.16em; opacity:.2;',
    '  animation:mg-in .9s cubic-bezier(.83,.12,.35,.96) .5s both;',
    '}',

    /* 모션 최소화 */
    '@media (prefers-reduced-motion:reduce) {',
    '  .mobile-gate, .mobile-gate * { animation-duration:0.01s !important; }',
    '}',
  ].join('\n');
  document.head.appendChild(s);

  /* ── DOM 준비 후 게이트 요소 생성 ── */
  document.addEventListener('DOMContentLoaded', function () {
    var gate = document.createElement('div');
    gate.className = 'mobile-gate';
    gate.setAttribute('role', 'alert');
    gate.innerHTML =
      /* 엠블럼 — 사이트와 동일한 회전 © 심볼 */
      '<div class="mg-emblem" aria-hidden="true">' +
        '<svg class="e1" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="4"/><text x="50" y="66" font-size="52" text-anchor="middle" fill="currentColor" font-family="Georgia,serif">c</text></svg>' +
        '<svg class="e2" viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="46" ry="30" fill="none" stroke="currentColor" stroke-width="3"/></svg>' +
      '</div>' +
      /* 타이틀 */
      '<h1 class="mg-title">이 경험은<br><em>더 큰 무대</em>가<br>필요합니다.</h1>' +
      /* 본문 */
      '<p class="mg-body">' +
        'v5가 모바일을 거부한 게 아닙니다.<br>' +
        '이 화면이 v5를 감당하지 못한 겁니다.<br><br>' +
        '3D 궤도, 관성 스크롤, 시네마틱 전환 —<br>' +
        'IMAX는 폰으로 보는 게 아니잖아요.' +
      '</p>' +
      /* CTA */
      '<a class="mg-cta" href="' + v4 + '">' +
        'v4에서 만나기 <span class="mg-cta-arrow" aria-hidden="true">→</span>' +
      '</a>' +
      '<p class="mg-sub">모바일에 최적화된 같은 콘텐츠</p>' +
      '<p class="mg-ver">desktop only experience</p>' +
      /* 푸터 */
      '<p class="mg-footer">SKALA · 2026</p>';
    document.body.appendChild(gate);
  });
})();
