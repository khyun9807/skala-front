# Aurora UI

외부 CSS/JS 라이브러리, 아이콘 폰트, CDN 리소스를 전혀 사용하지 않고 **순수 HTML5 · CSS3 · Vanilla JavaScript**만으로 만든 나만의 디자인 시스템입니다. Glassmorphism, Aurora gradient, Bento grid, Holographic card 등 미래지향적 SaaS 대시보드 톤을 목표로 설계했습니다.

이 라이브러리는 [`docs/csslibrary.md`](../docs/csslibrary.md)에 정리된 요구사항을 바탕으로 만들어졌고, 이후 `html/` 폴더의 실제 과제 페이지(`index.html`, `myProfile.html` 등)에 가져다 붙여서 사용할 목적으로 별도 패키지로 분리했습니다.

## 1. 프로젝트 구조

```text
aurora-ui/
├── index.html          데모 겸 20개 섹션 쇼케이스 대시보드
├── css/
│   ├── reset.css        모던 리셋 (box-sizing, 포커스, 스크롤바, 선택영역 등)
│   ├── tokens.css        :root 디자인 토큰 (색상/그라디언트/그림자/스페이싱/타이포/라운드/모션/z-index)
│   ├── themes.css        [data-theme] 5종 + [data-accent] 4종 — 토큰만 교체
│   ├── layout.css        컨테이너, 12단 그리드, bento, masonry, app shell(sidebar+main+drawer)
│   ├── utilities.css     한 속성짜리 원자 유틸리티 클래스
│   ├── components.css    네비/버튼/카드/폼/정보표시/오버레이/데이터/콘텐츠 섹션 전체
│   ├── animations.css    모든 @keyframes + prefers-reduced-motion 처리
│   ├── spatial.css       살아있는 배경/포탈/독/오빗 캐러셀/커스텀 커서 — "공간" 레이어 (추가 확장)
│   └── main.css          @layer 순서 선언 + 전체 import (이 파일 하나만 링크하면 됨)
├── js/
│   ├── theme.js          테마/accent 전환, localStorage 저장, OS 다크모드 감지
│   ├── interactions.js   스포트라이트/틸트/마그네틱/리플/패럴랙스/카운터/스크롤리빌 등 범용 인터랙션
│   ├── components.js     모달/드로어/토스트/탭/아코디언/폼검증/캘린더/칸반/채팅 등 컴포넌트 로직
│   ├── spatial.js        스타필드 캔버스/커서/포탈/독/오빗 캐러셀 엔진 (추가 확장)
│   └── main.js           로딩 화면 제거 + 각 모듈 init 호출 + 이 데모 페이지 전용 배선
└── README.md
```

## 2. 실행 방법

빌드 과정이 전혀 없습니다. `aurora-ui/index.html`을 브라우저로 열거나(더블클릭), VS Code Live Server 등으로 열면 바로 전체 데모가 동작합니다.

```bash
# 예: 프로젝트 루트에서
open aurora-ui/index.html
```

## 3. 디자인 콘셉트

- **Aurora gradient mesh** — 여러 겹의 `radial-gradient`를 blur로 겹쳐 오로라처럼 흐르는 배경
- **Glassmorphism** — `backdrop-filter` + 반투명 표면 (`navbar`, `card--glass`, `modal`, `drawer`)
- **Neumorphism 일부** — 버튼/스위치의 인셋 그림자(`--aur-shadow-inset`)
- **Holographic card** — 애니메이션 그라디언트 + 대각선 텍스처 오버레이(`mix-blend-mode`)
- **Bento grid** — 기능 섹션과 대시보드 카드가 서로 다른 크기로 맞물리는 레이아웃
- **Layered depth** — box-shadow 단계(sm→xl)와 `transform-style: preserve-3d` 기반 tilt/flip

한 가지 효과를 반복하지 않도록 카드마다 다른 기법(spotlight / tilt / holographic / gradient ring / flip / glass)을 하나씩만 적용했습니다.

### 3-1. Spatial 레이어 — "웹페이지가 아니라 공간에 있는 느낌"

기본 디자인 시스템 위에 추가로 얹은, 계속 움직이는 몰입형 레이어입니다. `spatial.css`/`spatial.js`로 완전히 분리되어 있어 이 두 파일만 빼면 나머지 라이브러리는 그대로 정적으로 동작합니다.

- **살아있는 배경** — `<canvas>`에 깊이(z)를 가진 별 파티클을 그립니다. 가까운 별일수록 크고 밝고, 커서를 움직이면 더 크게 시차 이동해서 진짜 공간감을 만듭니다.
- **포탈 히어로** (`.aur-portal`) — 히어로를 유리판 여러 장이 서로 다른 `translateZ` 깊이에 떠 있는 3D 공간으로 구성. 스크롤하면 그 판들 사이를 통과해 앞으로 나아가는 듯한 시차가 생깁니다. 스크롤을 가로채지 않고 순수하게 반응만 하므로 접근성/사용성을 해치지 않습니다.
- **앰비언트 오브** — 화면 전체에 깔린, 서로 다른 주기로 흐르는 흐릿한 빛 덩어리 레이어.
- **커스텀 커서** — 실제 커서를 lerp로 살짝 지연 추적하는 링 + 도트. 링크/버튼 위에서 커지고 `mix-blend-mode: difference`로 배경과 섞입니다.
- **매그네틱 독** — 하단 중앙의 macOS 스타일 독. 커서가 가까이 갈수록 아이콘이 커집니다.
- **3D 오빗 캐러셀** (`.aur-orbit-carousel`) — 카드가 원통형으로 배치되어 드래그로 회전하고, 놓아두면 천천히 자동 공전합니다.
- **구조 조립** (`.aur-assemble`) — 카드가 흩어진 위치/회전으로 시작했다가 스크롤로 뷰포트에 들어오면 제자리로 조립됩니다.
- **전역 포인터 필드** — 마우스 위치를 `:root`의 `--field-x`/`--field-y`로 전역 방송해서 여러 요소가 같이 미세하게 반응합니다.

모두 `(pointer: fine)`과 `prefers-reduced-motion`을 감지해서, 터치 기기나 모션 최소화 사용자에게는 자동으로 비활성화되거나 정적으로 대체됩니다.

## 4. 구현된 컴포넌트 (요약)

내비게이션(navbar, dropdown, mega menu, mobile drawer, breadcrumb, sidenav, bottom nav) · 버튼 14종 · 카드 13종 · 폼 컨트롤 전체(text/password/textarea/select/checkbox/radio/switch/range/search/floating-label/validation/dropzone/OTP/tag-input) · 정보 표시 20종 이상(badge/tag/chip/tooltip/popover/alert/toast/progress/circular-progress/skeleton/spinner/timeline/stepper/accordion/tabs/pagination/avatar/status/rating/empty-state/quote/code-block/kbd/metric/countdown) · 오버레이(modal/confirm/image-modal/drawer/command-palette/context-menu) · 데이터 표현(반응형·정렬·필터 테이블, bar/line/donut/gauge/sparkline/heatmap 차트) · 콘텐츠 섹션(hero/feature/stats/gallery/testimonial/pricing/faq/newsletter/contact/footer/CTA/kanban/calendar/chat/settings).

## 5. 사용된 CSS 기술

CSS custom properties · `calc()` · `clamp()` · `min()`/`max()`/`minmax()` · `repeat()` + `auto-fit`/`auto-fill` · CSS Grid(+`grid-template-areas`, 실험적 `subgrid` 미사용 대체로 bento span 유틸리티) · Flexbox · 가상 클래스/요소 · `linear/radial/conic-gradient` · multiple background · `background-blend-mode` · `mix-blend-mode` · `backdrop-filter` · `filter` · box/text-shadow(inset 포함) · `mask`/`clip-path` · `transform`/`transform-style`/`perspective` · `isolation` · `object-fit` · `aspect-ratio` · `text-overflow`/line-clamp · `scroll-snap` · sticky positioning · CSS 카운터 대신 커스텀 스크롤바 · `@keyframes`/`transition`/`cubic-bezier` · 컨테이너 쿼리(`container-type`, `@container`) · 미디어 쿼리(`pointer`, `prefers-reduced-motion` 포함) · 논리적 속성(`margin-inline`, `inset-block` 등) · `accent-color` · `appearance` · `caret-color` · `user-select` · `pointer-events` · `place-items` · `:has()`(점진적 향상) · `@supports` · `@layer` · `@property`(그라디언트 링 & 오빗 캐러셀 각도 애니메이션용, `@supports`로 폴백 제공) · `color-mix()` · Canvas 2D API(스타필드) · `PointerEvent`/포인터 캡처(드래그 회전) · `IntersectionObserver`(스크롤 리빌 & 구조 조립).

## 6. 라이브러리 사용 방법

새 HTML 파일에서 딱 한 줄이면 전체 시스템을 불러옵니다.

```html
<!doctype html>
<html lang="ko" data-theme="dark" data-accent="violet">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="aurora-ui/css/main.css">
</head>
<body>
  <button class="aur-btn aur-btn--primary aur-btn--shine">시작하기</button>

  <script src="aurora-ui/js/theme.js" defer></script>
  <script src="aurora-ui/js/interactions.js" defer></script>
  <script src="aurora-ui/js/components.js" defer></script>
  <script src="aurora-ui/js/spatial.js" defer></script>
  <script>
    document.addEventListener("DOMContentLoaded", function () {
      AuroraUI.theme.init();
      AuroraUI.interactions.init();
      AuroraUI.components.init();
      AuroraUI.spatial.init(); // 살아있는 배경/커서/포탈 등이 필요 없으면 이 줄과 spatial.* 파일만 빼면 됨
    });
  </script>
</body>
</html>
```

`data-theme`/`data-accent`를 `<html>`에 직접 써 두면 기본값이 되고, 사용자가 설정 패널에서 바꾸면 그 값이 `localStorage`에 저장되어 다음 방문에도 유지됩니다. FOUC(테마 깜빡임)를 막으려면 `index.html` 상단의 인라인 스크립트처럼, `<head>` 맨 위에서 저장된 테마를 동기적으로 읽어 `data-theme`를 먼저 세팅하세요.

### 새 페이지에서 컴포넌트 재사용 예시

```html
<div class="aur-card aur-card--glass aur-reveal">
  <span class="aur-badge aur-badge--success">완료</span>
  <h3 class="aur-card__title">나의 소개</h3>
  <p class="aur-text-muted">이 카드는 aurora-ui/css/main.css 하나만 링크해서 그대로 붙여넣은 것입니다.</p>
</div>
```

`aur-` 접두사가 붙은 클래스는 모두 이 라이브러리 소속입니다. 페이지 자체 스타일을 추가할 때는 다른 접두사(or 아예 접두사 없는 시맨틱 클래스)를 써서 충돌을 피하세요.

## 7. 브라우저 호환성

최신 Chrome / Edge / Safari / Firefox 기준으로 개발되었습니다.

| 기능 | 비고 |
|---|---|
| `backdrop-filter` | 미지원 브라우저는 `main.css`의 `@supports not` 규칙이 불투명 배경으로 자동 대체 |
| `@property` | 미지원 브라우저는 `.aur-card--ring`이 `@supports` 폴백으로 단순 회전 애니메이션 사용 |
| `:has()` | 점진적 향상 — 미지원 브라우저는 그냥 그 스타일만 없을 뿐 기능은 정상 동작 |
| `<dialog>` | 최신 브라우저 전반 지원. 미지원 시 모달이 열리지 않을 수 있어 중요한 동작은 모달 없이도 접근 가능하게 구성. `showModal()`은 다이얼로그를 브라우저의 "top layer"로 올리는데, 이 레이어는 z-index와 무관하게 문서 전체보다 항상 위에 렌더링되므로, 커스텀 커서처럼 일반 DOM에 있는 요소는 모달이 열려 있는 동안 어떤 z-index를 줘도 그 위로 올라올 수 없습니다. `components.js`의 `initDialogCursorGuard`가 `dialog[open]`을 감시해서 모달이 열려 있는 동안만 커스텀 커서를 숨기고 실제 OS 커서로 되돌립니다 |
| Popover 관련 기능 | 자체 `.aur-popover`/드롭다운은 JS 클래스 토글 방식이라 네이티브 Popover API 지원 여부와 무관하게 동작 |
| container query | 미지원 브라우저는 `@container` 규칙만 무시되고 레이아웃은 정상 |

## 8. 접근성 · 성능 메모

- 모든 인터랙티브 요소에 `:focus-visible` 스타일 제공, 색상만으로 상태를 구분하지 않음(아이콘/텍스트 병행)
- `prefers-reduced-motion: reduce`일 때 모든 애니메이션·트랜지션을 사실상 즉시 완료로 단축
- 애니메이션은 대부분 `transform`/`opacity`만 사용해 리페인트 비용을 최소화
- `localStorage` 접근은 항상 `try/catch`로 감싸 프라이빗 모드에서도 에러 없이 동작
- 이벤트 리스너는 대부분 `document`에 위임해 리스너 수를 최소화
- 로딩 화면 제거처럼 "한 번만 실행되면 되는" 지연 작업은 `requestAnimationFrame` 폴링이 아니라 `setTimeout`으로 처리합니다. rAF는 탭이 백그라운드/비가시 상태가 되면 브라우저가 완전히 정지시킬 수 있어서, 반복 rAF에 완료 조건을 태우면 그 상태에서 영원히 끝나지 않는 작업이 될 수 있기 때문입니다.
- 반대로 스크롤에 반응하는 연산(포탈 진행도, 스크롤 진행바)은 반드시 `requestAnimationFrame`으로 스로틀링합니다. 빠른 트랙패드/휠 스크롤은 실제로 화면에 그려지는 프레임보다 훨씬 많은 `scroll` 이벤트를 발생시킬 수 있어서, rAF 없이 매 이벤트마다 `getBoundingClientRect`를 호출하면 화면에 보이지도 않을 계산을 여러 번 반복하게 됩니다.

### 3-2. Spatial 레이어 최적화

Spatial 레이어를 처음 만들었을 때는 매끄러웠지만 이후 체감 렉이 보고되어, 아래 항목들을 손봤습니다(시각적 결과물·기능은 동일):

- **전역 `pointermove` 리스너를 3~4개에서 1개로 통합.** 스포트라이트 카드, 커스텀 커서, 포인터 필드가 각자 `document`/`window`에 리스너를 달고 있었는데, 마우스가 페이지 어디를 움직이든 이 모든 리스너가 매번 실행됐습니다. 이제는 `spatial.js`에 있는 단 하나의 리스너가 좌표를 공유 상태로 기록하고, 각 rAF 루프가 거기서 값을 읽어갑니다.
- **스포트라이트 카드 리스너를 `document` 위임에서 카드별 스코프로 변경.** 기존에는 마우스가 스포트라이트 카드 근처에도 없을 때조차 매 mousemove마다 `closest()`로 조상 탐색을 했습니다. 카드에 직접 리스너를 붙이면 브라우저가 애초에 그 카드 위에 있을 때만 콜백을 호출합니다.
- **별자리 캔버스를 30fps로 캡.** 화면 전체를 지우고 다시 그리는 유일한 연속 작업이라 가장 비쌌는데, 느린 별 이동/반짝임은 60fps와 30fps의 시각적 차이가 없습니다.
- **탭이 백그라운드로 가면 별자리/커서/포인터 필드 루프가 다음 프레임 예약을 멈춤.** `document.visibilityState`를 감지해서, 보이지 않는 탭에서 CPU를 계속 태우지 않도록 하고 다시 보이면 자동으로 재개합니다.
- **긴 데모 페이지의 아래쪽 섹션에 `content-visibility: auto`를 적용** (`.aur-defer-offscreen` 유틸리티, `utilities.css`). 화면 밖에 있는 동안은 레이아웃/페인트 작업 자체를 건너뛰고, `contain-intrinsic-size`로 대략의 높이를 미리 알려줘서 스크롤바가 튀지 않게 했습니다. 단, `content-visibility`가 있는 조상은 `position:fixed` 자손의 containing block을 바꿔버릴 수 있어서, 컨텍스트 메뉴처럼 뷰포트 기준으로 고정되어야 하는 오버레이는 전부 body 최상위(모달·드로어와 같은 위치)로 옮겨뒀습니다.
- **오빗 캐러셀을 드래그로 잡을 때, CSS가 자동 회전시켜 놓은 실제 각도를 먼저 읽어와 동기화**한 뒤에 멈춥니다 — 안 그러면 잡는 순간 마지막으로 JS가 기억하던 각도로 순간 이동해버립니다.
- 커서 링/도트, 포탈 유리판처럼 매 프레임 `transform`이 바뀌는 요소에는 `will-change: transform`을 지정해 컴포지터가 미리 레이어를 준비하도록 했습니다.

### 3-3. 오버레이 스태킹 버그 수정

- **드로어/사이드바 위에 배경 블러가 뜨는 문제.** `--aur-z-overlay`(배경 어둡게/블러 처리하는 `.aur-backdrop`용)가 `--aur-z-drawer`/`--aur-z-fixed`보다 숫자가 커서, 배경이 드로어보다 위에 그려지고 있었습니다. `tokens.css`에서 순서를 `overlay(450) < fixed(500) < drawer(600)`로 바로잡았습니다.
- **위 수정 직후, 모바일 사이드바-드로어에서 같은 증상이 새로 발생.** `.aur-shell`에 걸어둔 `position:relative; z-index:1`이 새 스태킹 컨텍스트를 만들어서, 그 안에 중첩된 사이드바(z-index 500)가 실제로는 `.aur-shell` 자신의 z-index(1) 하나로만 body 레벨의 `.aur-backdrop`(450)과 비교되어버렸습니다 — 자손의 z-index가 아무리 높아도 조상의 스태킹 컨텍스트를 벗어날 수 없다는 전형적인 함정입니다. 캔버스/오브 레이어는 DOM 순서만으로 이미 `.aur-shell`보다 아래에 그려지므로 이 z-index는 애초에 필요 없었고, `spatial.css`에서 완전히 제거해 근본 원인을 없앴습니다.
- **모달/커맨드 팔레트를 열면 커스텀 커서가 사라지는 문제.** `showModal()`로 여는 `<dialog>`는 브라우저의 "top layer"에 올라가는데, 이 레이어는 z-index와 무관하게 문서 전체보다 항상 위에 렌더링됩니다. `components.js`의 `initDialogCursorGuard`가 모든 `dialog`의 `open` 속성을 `MutationObserver`로 감시해서, 열려 있는 동안은 가짜 커서를 숨기고 실제 OS 커서로 되돌립니다.

## 9. 향후 확장 아이디어

- `subgrid`가 더 널리 지원되면 가격표 카드들의 내부 행을 subgrid로 정렬
- 다국어 대응을 위한 `:dir(rtl)` 논리 속성 보강
- View Transitions API가 안정화되면 섹션 간 이동에 페이지 전환 효과 추가
- 차트 데이터에 실제 API 연동 (현재는 정적 데모 값)
