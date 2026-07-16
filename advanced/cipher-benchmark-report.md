# Cipher (cipher.tv) 벤치마킹 조사 보고서

> 목적: Awwwards 노미네이트작 **Cipher**를 벤치마킹하여, **외부 HTML/CSS/JS 라이브러리·프레임워크 없이(바닐라)** 유사한 경험을 재구현하기 위한 기술 분석 및 구현 가이드.
> 조사 방식: 실제 사이트를 브라우저로 라이브 계측(DOM·번들 CSS·캔버스 컨텍스트·네트워크·폰트) + 화면 캡처.
> 조사일: 2026-07-16

---

## 0. 한눈에 보기 (TL;DR)

Cipher는 파리 기반 크리에이티브 프로덕션 컴퍼니의 포트폴리오 사이트다. 화려한 컴포넌트가 아니라 **극도로 절제된 타이포그래피 + 전면 WebGL 씬 + 정교한 마이크로 인터랙션**으로 완성도를 만든다. 실제로 사이트의 **CSS 총량은 약 11KB에 불과**하고, `@keyframes`는 **0개**다. 즉 시각적 임팩트의 대부분은 (1) 홈의 **회전 이미지 링(강강술래 갤러리)**, (2) 셰이더로 그린 도트 필드, (3) JS로 구동되는 부드러운 스크롤/전환/리빌, (4) 커스텀 커서에서 나온다.

벤치마킹의 핵심은 "예쁜 레이아웃"을 베끼는 게 아니라 **다음 8가지 인터랙션 시스템을 바닐라로 이식**하는 것이다.

1. **홈 히어로 — 회전 이미지 링(강강술래 갤러리)** ★ 사이트의 시그니처. 프로젝트 영상 타일들이 중앙 © 엠블럼을 감싸는 타원 링에 배치되어 스크롤에 따라 원을 그리며 회전
2. 도트 필드 로더(진행률 셰이더 + 모핑 © 엠블럼)
3. 큐브형 커스텀 커서(+ `mix-blend-mode: difference` 라벨)
4. 관성(lerp) 스무스 스크롤 — 원본은 Lenis 사용
5. 라우트별 **다크↔라이트 테마 반전** + 오버레이 페이지 전환
6. blur/opacity 기반 리빌 애니메이션(`blurry_els`)
7. hover 마이크로 인터랙션(JOUΓ 화살표 스왑, works 인덱스 hover-리빌)
8. 전면 WebGL 배경/컨택트 캔버스

---

## 1. 사이트 정체성 · 크레딧

| 항목 | 내용 |
|---|---|
| 사이트 | https://cipher.tv/ |
| 정체성 | 파리 기반 **크리에이티브 프로덕션 컴퍼니** 포트폴리오 |
| 태그라인 | **"For culture and its counter."** (meta description 동일) |
| 소개 문구(About) | "Cipher is a creative production company working between the established and the experimental. Born in Paris…" |
| 주소 | 7 Impasse Franchemont, Paris 11 · prod@cipher.tv |
| 제작 크레딧 | 푸터의 **"JOUΓ ↗"** 링크 → **Studio Jour (studiojour.paris)** |
| Awwwards | Nominee (2026-07 등록). 기술 태그: **Nuxt.js, GSAP** / 카테고리: Design Agencies, Web & Interactive, Experimental, Portfolio |
| CMS | **Prismic** (이미지가 `images.prismic.io/cipherwebsite/...`에서 서빙, 반응형 `srcset`) |

> 참고: Awwwards 등록 스튜디오명은 "Magnetism"으로 표기되어 있으나, 사이트 자체가 명시적으로 크레딧하는 제작 스튜디오는 푸터 링크의 **Studio Jour**다. 두 정보가 상충하는 부분은 사이트 내 크레딧을 우선했다.

### 페이지 구성

- `/` (홈) — **다크 테마**. 전면 WebGL 도트 필드 + 미니멀 내비 + 중앙 모핑 © 엠블럼.
- `/works` — **라이트 테마**. 대형 세리프 헤드라인 + 번호가 매겨진 12개 프로젝트 인덱스(hover 시 이미지 리빌). 프로젝트 상세는 `/works/{slug}`.
- `/talents` — **라이트 테마**. 대형 세리프 이름 + 포트레이트 리빌 로스터(Director/Photographer 등).
- `/about` — **라이트 테마**. 두운(頭韻) "C" 카피로 짜인 다이아몬드형 타이포 구성 + 대형 선언 문구.
- Contact — 라우트가 아니라 **전역 고정 오버레이**(`.contact`, `position:fixed`, WebGL 캔버스 포함).

---

## 2. 기술 스택 → 바닐라 대체 매핑

라이브 계측으로 확인한 실제 스택과, 라이브러리 없이 대체하는 방법이다.

| 원본에서 사용 | 계측 근거 | 바닐라 대체 전략 |
|---|---|---|
| **Nuxt.js (Vue SSR)** | `window.__NUXT__` 존재, `/_nuxt/*.js` 번들, `data-v-*` 스코프 속성 | 정적 다중 HTML 또는 자체 미니 라우터. 스코프 CSS는 BEM/`data-` 접두사로 대체 |
| **Lenis** (스무스 스크롤) | `<html class="lenis">`, `window.Lenis` 존재 | `requestAnimationFrame` + **lerp**로 자체 관성 스크롤(§5) |
| **GSAP** (Awwwards 태그) | 번들 내부. `window.gsap`은 미노출(트리셰이킹) | rAF 트윈 헬퍼(`lerp`, easing 함수) + **Web Animations API**(§10) |
| **WebGL2 셰이더 × 3** | `<canvas>` 3개 모두 `webgl2` 컨텍스트 (`.loader`, `.anim_layer`, `.contact_webgl`) | (A) **raw WebGL** 셰이더 직접 작성(라이브러리 아님) 또는 (B) **Canvas 2D** 도트 그리드로 근사(§4·§9) |
| **Prismic CMS** | 이미지 CDN 도메인 | 정적 JSON/로컬 이미지. 반응형은 `<picture>`+`srcset` 그대로 |
| **ABC Arizona / ABC Favorit (가변 폰트)** | `document.fonts` = Arizona, Favorit. `@font-face` `woff2`, `font-weight:100 900` | 라이선스 폰트이므로 **유사 무료 가변 폰트로 대체**(§8) |
| Google Tag Manager | 스크립트 태그 | 선택 사항 |

**핵심 원칙**: WebGL·Canvas·IntersectionObserver·Web Animations API·CSS 커스텀 프로퍼티는 모두 **브라우저 내장 API**이므로 "라이브러리 없이"라는 제약과 충돌하지 않는다. 제약 대상은 GSAP/Lenis/three.js/React/Bootstrap 같은 **서드파티 패키지**다.

---

## 3. 디자인 언어

### 3.1 색상 토큰 (실측)

번들 CSS의 `:root`에서 그대로 추출했다.

```css
:root{
  --color-dark:  #060403;  /* 웜 블랙 (순수 #000 아님, 살짝 붉은 기 있음) */
  --color-light: #e9eae4;  /* 웜 오프화이트 (살짝 그린-그레이 기) */
  --fontXXS: 8px;
  --fontXS:  10px;
  --fontS:   12px;
  --fontM:   24px;
}
/* 그 외 실측 색: #676767(중간 회색), #fff, #000 */
```

- **거의 모노크롬**. 다크/라이트 두 값만으로 전 사이트를 운용하며, 라우트에 따라 이 둘을 **뒤집는다**(배경↔글자).
- `#000`/`#fff`가 아니라 **웜 뉴트럴**(`#060403`/`#e9eae4`)을 쓰는 것이 고급스러운 인상의 핵심.

### 3.2 타이포그래피

| 역할 | 폰트 | 특징 |
|---|---|---|
| 디스플레이/에디토리얼 | **ABC Arizona (Mix, Variable)** | 플레어 세리프. 헤드라인·이름·선언 문구. 실측 40px(작업 히어로)~77px(어바웃)로 뷰포트에 따라 큼 |
| UI/라벨/메타 | **ABC Favorit (Variable)** | 그로테스크 산세리프. 내비·번호·메타데이터 |

- UI 타입이 **아주 작다**: 8/10/12px. 내비·메타는 `text-transform:uppercase` + **`letter-spacing:12%`** + `line-height` 19px.
- 대비 전략: 초소형 대문자 산세리프(정보) ↔ 대형 세리프(감성). 이 이원 대비가 톤을 만든다.
- 큰 제목에 `clamp()`를 쓰지 않는다(실측). 즉 반응형 크기는 JS/뷰포트 단위나 고정값으로 관리.

### 3.3 레이아웃 · 그리드

- 배경 캔버스는 **`position:fixed; inset:0; width:100vw; height:100vh`** 로 전면 고정. 콘텐츠가 그 위에 얹힌다.
- 내비/메타 바는 **3열 그리드**:

```css
.works_infos{
  display:grid; grid-template-columns:1fr 1fr 1fr;
  align-items:center; width:100%;
  padding:16px 20px;
  font-size:var(--fontXS); text-transform:uppercase; letter-spacing:12%;
}
.m{justify-content:center; display:flex}  /* 가운데 열 */
.r{justify-content:end;   display:flex}  /* 오른쪽 열 */
@media(max-width:768px){ .m{display:none} .works_infos{grid-template-columns:1fr} }
```

- 로고는 좌상단 고정(`top:18px; left:20.5px`), 여백을 크게 두고 중앙에 © 엠블럼을 배치하는 **대칭·정중앙 구도**.

### 3.4 시그니처 이징 (실측)

전체 사이트에서 단 하나의 커스텀 베지어가 반복 사용된다.

```css
/* 이 값 하나가 사이트의 '손맛'을 지배한다 */
transition: transform .45s cubic-bezier(.83,.12,.35,.96);
```

- 특징: 초반에 훅 빠졌다가(강한 ease-in) 끝에서 부드럽게 안착. duration은 **0.45s**가 기준.
- `mix-blend-mode: difference` 도 사용됨(커서 라벨 등, 배경 위에서 자동 반전).

---

## 4. 인터랙션 인벤토리 (관찰 → 원리 → 바닐라 구현)

> 아래 각 항목은 **① 실제 관찰 → ② 동작 원리 → ③ 라이브러리 없는 구현 코드** 순서다. 코드는 프로토타입(`cipher-clone-prototype.html`)에서 실제로 동작한다.

### 4.0 홈 히어로 — 회전 이미지 링(강강술래 갤러리) ★ 시그니처

> 이 사이트를 가장 특징짓는 요소. (참고 캡처: `ref-04-home-rotating-ring.jpg`)

**① 관찰**: 홈에 진입하면 **프로젝트 영상 타일 약 12~14개가 중앙의 © 엠블럼을 감싸는 큰 타원 링에 배치**되어 있고, **스크롤하면 이 링 전체가 원을 그리며 회전**한다(강강술래처럼 위치가 원을 따라 돌되 타일 자체는 세워진 채 유지). 링은 세로보다 가로가 넓은 **타원**이고, 하단(앞쪽) 타일은 크고 진하게·상단(뒤쪽) 타일은 작고 흐리게 **깊이감**이 있다. 각 타일은 정지 이미지가 아니라 **재생되는 영상**이다. 끝없이 순환(무한 루프)하며, 하단 `works_infos` 3열 바가 현재 프로젝트 정보를 표시한다.

**② 원리**: 홈의 메인 `main > .anim_layer > canvas` 는 **WebGL2** 캔버스 하나다(DOM 이미지는 로고 1개뿐, `picture` 0개 — 즉 **모든 타일이 셰이더 텍스처**). 영상들을 텍스처로 올려 링 좌표에 배치하고, **스크롤 값을 회전각으로 매핑**해 링을 돌린다. (그래서 로더가 완료되기 전이나 rAF가 멈춘 환경에서는 링이 렌더되지 않고 배경 도트만 보인다 — 초기 조사에서 이 요소를 놓친 이유.)

**③ 바닐라 구현**: WebGL 없이도 **DOM 타일 + 타원 좌표 + rAF**로 충실히 재현된다. 핵심은 "타일을 세운 채 **위치만** 타원을 따라 회전"시키는 것.

```css
#hero-stage{ position:fixed; inset:0; z-index:1; pointer-events:none; }  /* 원본의 고정 anim_layer */
.ring{ position:absolute; inset:0; }
.tile{ position:absolute; top:0; left:0; width:clamp(112px,14vw,224px); aspect-ratio:16/10;
  background-size:cover; border-radius:2px; will-change:transform,opacity;
  box-shadow:0 14px 55px rgba(0,0,0,.5); }
```

```js
const N=12, tiles=[/* .tile 엘리먼트들 (배경은 <video> 또는 이미지) */];
function layoutRing(now, scroll){
  const cx=innerWidth/2, cy=innerHeight/2;
  const Rx=Math.min(innerWidth*0.27, 540), Ry=Math.min(innerHeight*0.32, 340); // 타원 반경
  const phi = now*0.00006 + scroll*0.0016;         // idle 회전(강강술래) + 스크롤 가속
  tiles.forEach((t,i)=>{
    const a = phi + i*(Math.PI*2/N);               // 타일별 기준각 + 전체 회전각
    const x = cx + Rx*Math.cos(a);
    const y = cy + Ry*Math.sin(a);                 // 타원(가로>세로)
    const depth = (Math.sin(a)+1)/2;               // 하단=앞(1) 상단=뒤(0)
    // ✱ 세운 채 위치만 이동 = 강강술래. rotate(a)를 더하면 링과 함께 기욺.
    t.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%) scale(${0.78+depth*0.34})`;
    t.style.zIndex   = Math.round(depth*100);      // 앞 타일이 위로
    t.style.opacity  = 0.5 + depth*0.5;            // 깊이 페이드
  });
}
// 통합 rAF 루프에서: layoutRing(now, smoothScrollValue)
```

- **무한 루프**: 각도는 자연히 2π로 순환하므로 타일이 끝없이 돈다(별도 처리 불필요).
- **영상 타일**: `background-image` 대신 `<video muted loop playsinline autoplay>` 를 타일에 깔면 원본처럼 "재생되는 릴"이 된다. 성능을 위해 화면 밖 타일은 `pause()` 권장.
- **깊이/원근**: 위 코드는 scale+opacity로 유사 원근. 더 사실적으로는 `perspective` + `translateZ(depth)`(3D)로 대체 가능(라이브러리 불필요).
- **스크롤 결합**: 원본은 스크롤 주도. 프로토타입은 idle 회전 + 스크롤 가속을 합쳐, 스크롤을 멈춰도 은은히 도는(강강술래) 느낌을 준다. 스크롤만으로 돌리려면 `now` 항을 제거.
- **접근성**: `prefers-reduced-motion`에서는 idle 회전을 끄고 정적 그리드로 폴백.

> 프로토타입 `cipher-clone-prototype.html` 의 히어로에 이 링이 실제로 동작하도록 구현되어 있다(타일 12개, 타원 배치, idle+스크롤 회전, 스크롤 시 스테이지 페이드아웃).

### 4.1 도트 필드 로더

**① 관찰**: 검은 화면에 격자형 도트가 노이즈처럼 물결치고, 중앙에 회전·모핑하는 © 엠블럼, 하단 중앙에 로딩 퍼센트(0→100%). DOM은 `.loader > canvas + .overlay_loader`, 퍼센트 요소 클래스는 **`.progress_shader`**.

**② 원리**: 도트 그리드를 그리는 WebGL 셰이더에 **로딩 진행률을 uniform으로 전달**하여, 진행에 따라 도트가 밝아지거나 특정 패턴이 드러난다(그래서 클래스명이 `progress_shader`). 진행률은 실제 에셋 로드율에 연동. 완료 후 로더가 페이드/블러 아웃되며 페이지로 전환.

**③ 바닐라 구현(Canvas 2D 근사)**: 격자 좌표마다 시간·좌표 기반 유사 노이즈로 밝기를 계산하고, 진행률로 전체를 마스킹한다.

```js
const cv = loaderCanvas, ctx = cv.getContext('2d');
const GAP = 22, R = 1.1;         // 도트 간격/반지름
let progress = 0;                 // 0→1, 실제 프리로드에 연동
function noise(x, y, t){          // 라이브러리 없는 값-노이즈 근사
  return (Math.sin(x*0.15 + t) + Math.sin(y*0.18 - t*0.8)
        + Math.sin((x+y)*0.07 + t*1.3)) / 3;      // -1..1
}
function drawDots(t){
  ctx.clearRect(0,0,cv.width,cv.height);
  for(let y=0; y<cv.height; y+=GAP){
    for(let x=0; x<cv.width; x+=GAP){
      const n = (noise(x, y, t*0.001) + 1) / 2;    // 0..1
      // 진행률 아래로는 밝게, 위로는 어둡게(리빌 마스크)
      const reveal = n < progress ? 1 : 0.12;
      ctx.globalAlpha = 0.15 + n * 0.65 * reveal;
      ctx.beginPath();
      ctx.arc(x, y, R, 0, Math.PI*2);
      ctx.fillStyle = '#e9eae4';
      ctx.fill();
    }
  }
}
```

- 진행률은 실제 이미지/폰트 프리로드로 계산: `Promise.all(images.map(preload))` 완료율을 `progress`에 반영.
- `document.fonts.ready` 도 함께 대기.

### 4.2 커스텀 커서 (큐브 + 라벨)

**① 관찰**: 기본 커서 대신 **4×4px 밝은 큐브**(`.cursor_cube > .cube`)가 마우스를 따라오고, 별도 라벨(`.cursor_label` / `.cursor_contact`)이 `mix-blend-mode:difference`로 배경 위에서 자동 반전. 인터랙티브 요소에는 `cursor_out` 클래스가 붙어 상태가 바뀐다.

```css
/* 실측 규칙 */
.cube{ width:4px; height:4px; aspect-ratio:1; background:var(--color-light); }
.cursor_contact{ position:fixed; left:28px; top:36px; font-family:Arizona;
  font-size:var(--fontS); mix-blend-mode:difference; pointer-events:none; z-index:100; }
```

**② 원리**: `mousemove`로 목표 좌표를 잡고, 큐브는 **lerp로 지연 추적**(관성). 라벨은 `difference` 블렌드로 어떤 배경에서도 가독.

**③ 바닐라 구현**:

```js
const cursor = document.querySelector('.cube');
let mx=innerWidth/2, my=innerHeight/2, cx=mx, cy=my;
addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
function tick(){
  cx += (mx-cx)*0.18;  cy += (my-cy)*0.18;   // 지연 추적
  cursor.style.transform = `translate(${cx}px,${cy}px)`;
  requestAnimationFrame(tick);
}
tick();
// 인터랙티브 요소 hover 시 확대 + 라벨
document.querySelectorAll('[data-cursor]').forEach(el=>{
  el.addEventListener('mouseenter',()=>setCursor(el.dataset.cursor,true));
  el.addEventListener('mouseleave',()=>setCursor('',false));
});
```

- 기본 커서 숨김은 `*{cursor:none}` 로. (모바일/터치에서는 커서 시스템 비활성화)

### 4.3 관성 스무스 스크롤 (Lenis 대체)

**① 관찰**: `<html class="lenis">`. 휠 입력이 즉시가 아니라 **부드럽게 감속**되며, 이 스크롤 값이 리빌/패럴랙스의 기준.

**② 원리(Lenis 방식)**: 콘텐츠를 `position:fixed`로 두고, 실제 스크롤 높이만큼 스페이서를 만든 뒤, **`transform: translate3d(0, -lerp(scrollY), 0)`** 로 콘텐츠를 이동. 매 프레임 목표(scrollY)와 현재값을 lerp.

**③ 바닐라 구현**:

```js
const content = document.querySelector('.smooth-content');
const spacer  = document.querySelector('.smooth-spacer');
let current = 0, target = 0, ease = 0.08;
function setHeight(){ spacer.style.height = content.scrollHeight + 'px'; }
addEventListener('scroll', ()=> target = scrollY);
function raf(){
  current += (target - current) * ease;             // 관성
  content.style.transform = `translate3d(0, ${-current}px, 0)`;
  window.__scroll = current;                          // 리빌/패럴랙스가 참조
  requestAnimationFrame(raf);
}
setHeight(); raf();
```

- 접근성: `prefers-reduced-motion` 시 ease=1(즉시)로 폴백.
- 주의: 이 방식에서 `IntersectionObserver`는 변형된 실좌표를 반영하므로 정상 동작하나, 스크롤 기준 계산은 `window.__scroll`을 쓴다.

### 4.4 페이지 전환 + 테마 반전

**① 관찰**: 라우트별로 `dark_bg`/`light_bg` 클래스가 바뀌며 **배경↔글자 색이 통째로 반전**. 전환 시 전면 `anim_layer`(WebGL) 오버레이가 개입.

**② 원리**: (a) 색상은 CSS 커스텀 프로퍼티를 루트에서 스왑하면 전 요소가 트랜지션. (b) 페이지 전환은 오버레이 와이프 또는 **네이티브 View Transitions API**.

**③ 바닐라 구현**:

```css
:root{ --bg:var(--color-dark); --fg:var(--color-light);
  transition: --bg .6s var(--ease), --fg .6s var(--ease); }
body{ background:var(--bg); color:var(--fg); }
.theme-light{ --bg:var(--color-light); --fg:var(--color-dark); }
```

```js
// 다중 HTML을 SPA처럼: 페이드 오버레이 + fetch 스왑
async function go(url){
  overlay.classList.add('in');                       // 도트 오버레이 인
  await wait(500);
  const doc = new DOMParser().parseFromString(await (await fetch(url)).text(),'text/html');
  document.querySelector('main').replaceWith(doc.querySelector('main'));
  history.pushState({},'',url);
  initPage();                                         // 새 페이지 인터랙션 재바인딩
  overlay.classList.remove('in');
}
// 또는 완전 네이티브:
if(document.startViewTransition) document.startViewTransition(()=>swapDOM());
```

- 색상 트랜지션을 위해 `@property --bg{ syntax:'<color>'; inherits:true; initial-value:#060403 }` 등록 필요(커스텀 프로퍼티 애니메이션).

### 4.5 리빌 애니메이션 (`blurry_els`)

**① 관찰**: 헤드라인 클래스가 **`blurry_els`**. 요소가 화면에 들어올 때 **블러 + 투명도 + 살짝 이동**으로 리빌. Contact는 `translateY(200px)`에서 위로(`anim_contact`), `will-change:transform`.

**② 원리**: `IntersectionObserver`로 진입 감지 → 시그니처 이징으로 `filter:blur()`+`opacity`+`translateY` 해제. 텍스트는 단어/줄 단위로 분해해 **stagger**.

**③ 바닐라 구현**:

```css
.reveal{ opacity:0; filter:blur(14px); transform:translateY(28px);
  transition:opacity .9s var(--ease), filter .9s var(--ease), transform .9s var(--ease); }
.reveal.in{ opacity:1; filter:blur(0); transform:none; }
.reveal .word{ transition-delay:calc(var(--i)*60ms); } /* stagger */
```

```js
const io = new IntersectionObserver((es)=>es.forEach(e=>{
  if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold:0.2 });
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
```

### 4.6 hover 마이크로 인터랙션

**(a) JOUΓ 화살표 스왑** — 푸터 크레딧 링크. 15px 마스크 박스 안에서 화살표 두 개가 **대각선으로 교차 순환**한다.

```css
/* 실측 규칙 재구성 */
.arrow_c{ position:relative; width:15px; height:15px; overflow:hidden; }
.rel,.abs{ transition:transform .45s cubic-bezier(.83,.12,.35,.96); }
.abs{ position:absolute; left:50%; top:50%; transform:translate(-150%,150%); } /* 좌하단 대기 */
.jour:hover .rel{ transform:translate(150%,-150%); }   /* 기존 화살표는 우상단 탈출 */
.jour:hover .abs{ transform:translate(-50%,-50%); }    /* 새 화살표가 중앙 진입 */
.jour:hover .jour_svg{ transform:translate(10px); }    /* 워드마크도 살짝 이동 */
```

**(b) works 인덱스 hover-리빌** — 번호+제목 리스트(`.discover_links`)에 각 프로젝트 이미지(`.discover_asset > picture`)가 숨겨져 있다가 hover 시 리빌(커서 근처 또는 리스트 옆). 이미지는 `lazy_wrapper`+`placeholder`로 지연 로드.

```js
// 제목 hover → 연결된 에셋 페이드/스케일 인, 커서 추적
link.addEventListener('mouseenter', ()=> asset.classList.add('show'));
link.addEventListener('mouseleave', ()=> asset.classList.remove('show'));
link.addEventListener('mousemove', e=>{
  asset.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
});
```

### 4.7 전면 WebGL 배경 / 컨택트

**① 관찰**: 3개 캔버스 모두 `webgl2`. 홈 배경(`anim_layer`)·로더·컨택트가 셰이더로 그려진다. 컨택트는 `pointer-events:none`의 고정 오버레이로, 콘텐츠가 아래에서 위로 올라온다(`anim_contact`).

**② 바닐라 선택지**:
- **경량**: §4.1의 **Canvas 2D 도트 그리드**로 동일한 인상(권장 시작점, 성능·구현 난이도 낮음).
- **충실**: **raw WebGL2**(라이브러리 아님)로 프래그먼트 셰이더 직접 작성 — 도트/노이즈/마우스 리플. 더 사실적이지만 코드량↑. 프로토타입에는 Canvas 2D로 구현하고, 셰이더 확장 지점을 주석으로 표기.

---

## 5. 폰트 대체안

원본 폰트(**ABC Arizona Mix**, **ABC Favorit**)는 Dinamo 유료 폰트라 재배포 불가. 무료 가변 폰트로 인상을 근사한다.

| 원본 | 성격 | 무료 대체(가변) | 비고 |
|---|---|---|---|
| ABC Arizona Mix | 플레어 세리프(에디토리얼) | **Fraunces** (opsz/wght/SOFT 축), 또는 Instrument Serif | Fraunces가 축이 풍부해 대형 헤드라인에 적합 |
| ABC Favorit | 그로테스크 산세리프 | **Space Grotesk**, 또는 Archivo / Inter | 초소형 대문자·와이드 트래킹에 잘 맞음 |

> 제약 준수 노트: 웹폰트는 라이브러리/프레임워크가 아니라 **에셋**이다. 프로토타입은 폰트만 외부 링크(교체·제거 용이)로 두고, 시스템 폰트로 우아하게 폴백하도록 스택을 구성했다. 완전 오프라인이 필요하면 `woff2`를 로컬 동봉하면 된다.

---

## 6. 재현 아키텍처 제안 (바닐라)

프레임워크 없이도 유지보수 가능한 구조.

```
/cipher-clone
├─ index.html            # 홈(다크)
├─ works.html            # 라이트
├─ about.html            # 라이트
├─ /assets
│   ├─ fonts/            # (선택) 로컬 가변 폰트
│   └─ img/
└─ /js
    ├─ core.js           # lerp/easing/유틸, prefers-reduced-motion
    ├─ smooth-scroll.js  # §4.3
    ├─ cursor.js         # §4.2
    ├─ loader.js         # §4.1 (프리로드 진행률)
    ├─ reveal.js         # §4.5 (IntersectionObserver)
    ├─ transition.js     # §4.4 (View Transitions / fetch swap)
    └─ dotfield.js       # §4.7 (Canvas2D, 후에 WebGL 교체 가능)
```

**공통 유틸(core.js)**:

```js
export const lerp  = (a,b,t)=> a + (b-a)*t;
export const clamp = (v,a,b)=> Math.min(b,Math.max(a,v));
// 시그니처 이징을 JS로: cubic-bezier(.83,.12,.35,.96)
export const ease  = cubicBezier(.83,.12,.35,.96);  // 표준 4점 베지어 샘플러
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
```

- 단일 rAF 루프 하나로 커서·스크롤·도트필드를 함께 갱신(프레임 예산 관리).
- `document.hidden`일 때 rAF 일시정지(성능). *— 참고: 원본 로더가 자동화 브라우저에서 54%에 멈춘 것도 탭이 hidden이라 rAF가 스로틀됐기 때문. 실제 사용자 환경에선 정상 동작.*

---

## 7. 재현 우선순위 (임팩트 대비 난이도)

| 순위 | 요소 | 임팩트 | 난이도 | 비고 |
|---|---|---|---|---|
| 1 | 색상·타이포 토큰 + 테마 반전 | ★★★ | ★ | 가장 먼저. 인상의 절반 |
| 2 | **회전 이미지 링(강강술래)** — DOM 타일 버전 | ★★★ | ★★ | 홈 시그니처. 무라이브러리로 충분히 재현(§4.0) |
| 3 | 관성 스무스 스크롤 | ★★★ | ★★ | 전체 톤 결정 + 링 회전 구동 |
| 4 | 커스텀 큐브 커서 + difference 라벨 | ★★★ | ★★ | 브랜드 시그니처 |
| 5 | blur 리빌 (IntersectionObserver) | ★★★ | ★ | 저비용 고효율 |
| 6 | 도트 필드(Canvas2D) 로더 | ★★★ | ★★★ | 첫인상. WebGL은 후순위 |
| 7 | hover 마이크로(화살표/works 리빌) | ★★ | ★★ | 디테일 완성도 |
| 8 | WebGL 고도화(링 영상 텍스처/배경) | ★★ | ★★★★ | 여유 있을 때. DOM 버전으로 시작 권장 |

---

## 8. 프로토타입 안내

동봉된 **`cipher-clone-prototype.html`** 은 위 1~6순위를 **단일 파일 · 무(無)라이브러리**로 구현한 동작 데모다.

포함: 도트 필드 로더(진행률) → 다크 히어로(**회전 이미지 링/강강술래 갤러리** + 도트필드 + 미니멀 내비 + 중앙 모핑 © 엠블럼) → 스크롤 시 **라이트로 테마 반전** + 대형 세리프 blur 리빌 선언 → works 스타일 번호 인덱스(hover 이미지 리빌) → JOUΓ 스타일 화살표 스왑 푸터. 전 구간 **큐브 커서 + 관성 스크롤 + 시그니처 이징(.83,.12,.35,.96)** 적용.

검증 체크리스트:
- [ ] `prefers-reduced-motion`에서 애니메이션 최소화 폴백
- [ ] 터치 기기에서 커스텀 커서 비활성 + 네이티브 스크롤
- [ ] 폰트 미로딩 시 시스템 폰트 폴백
- [ ] 리사이즈 시 캔버스/스페이서 재계산

---

## 9. 출처

- Cipher — Awwwards: https://www.awwwards.com/sites/cipher
- Cipher (라이브): https://cipher.tv/ · `/works` · `/talents` · `/about`
- 제작 스튜디오(크레딧): https://www.studiojour.paris/
- 라이브 계측: 번들 CSS(`entry.BNNTYPWH.css`, `index.kw6Uep2r.css`, `Contact.qdDeWgPw.css`, `JourLink.O7ntihK2.css`), DOM/캔버스 컨텍스트/폰트 인스펙션(브라우저 자동화)
