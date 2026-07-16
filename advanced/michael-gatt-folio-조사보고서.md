# Michael Gatt Folio — 벤치마킹 조사 보고서

> 대상: [michaelgatt.com](https://michaelgatt.com/) · Awwwards Nominee ([사이트 페이지](https://www.awwwards.com/sites/michael-gatt-folio))
> 목적: 유사 구현을 위한 벤치마킹 (단, **외부 HTML/CSS/JS 라이브러리·프레임워크 미사용** 조건)
> 조사일: 2026-07-16 · 방법: 실제 사이트 브라우저 계측(DOM/네트워크/렌더링) + Awwwards 메타데이터

---

## 1. 한 줄 요약

이 사이트는 영화·TV·게임 음악 작곡가 Michael Gatt의 포트폴리오로, **"떠다니는 프로젝트 이미지 패널들의 우주(universe)를 스크롤로 날아서 통과하는" 풀스크린 WebGL 씬**이 사이트 전체의 배경이자 내비게이션 그 자체입니다. 여기에 **인터랙티브 사운드 진입 로더**, **키네틱(글자 단위 애니메이션) 히어로 타이포그래피**, **문장형 에디토리얼 내비게이션**, **커스텀 텍스트 커서**, **배경 음악 + 이퀄라이저 사운드 비주얼**이 결합되어 있습니다. 화려함의 핵심은 개별 요소가 아니라 이 모든 것이 **하나의 몰입형 3D 공간 안에서 매끄럽게 이어지는 연출**입니다.

핵심 벤치마킹 포인트는 라이브러리 없이도 재현 가능합니다. WebGL은 브라우저 네이티브 API이고, 스무스 스크롤·키네틱 타이포·오디오 비주얼·커스텀 커서는 모두 순수 JS로 구현할 수 있습니다. 다만 실제 사이트가 프레임워크로 감싸 처리한 **상태관리·자원 로딩·성능 최적화**를 직접 손으로 다뤄야 하므로, "효과 재현"보다 "무너지지 않게 만드는 엔지니어링"이 실제 난이도의 대부분을 차지합니다.

---

## 2. Awwwards 정보 및 크레딧

| 항목 | 내용 |
|---|---|
| 상태 | Nominee (2026-07-15 기준) |
| 평점(커뮤니티) | Design 9.6 · Usability 9.3 · Creativity 9.4 · Content 9.0 (종합 ≈ 9.3) |
| 스튜디오 | Synchronized Studio (PRO) |
| 디자이너 | Zhenya Rynzhuk (PRO) |
| 카테고리 | Film & TV · Music & Sound · Portfolio · Storytelling · Interaction Design |
| 태그/특징 | WebGL · Scroll-based storytelling · Microinteractions · Interactive website loader · Project Page · 404 page · Player equalizer visualization |

> 참고: Zhenya Rynzhuk / Synchronized은 어둡고 시네마틱한 톤 + WebGL 몰입 연출로 반복 수상해 온 팀입니다. 이 사이트도 그 시그니처(검정 배경, 미니멀 세리프/휴머니스트 타이포, 3D 공간감)를 따릅니다.

---

## 3. 사이트 아키텍처 한눈에 보기

```
┌───────────────────────────────────────────────┐
│  <canvas> WebGL  ── 사이트 전역 퍼시스턴트 배경  │  ← 라우트가 바뀌어도 유지
│   · ~90개 프로젝트 썸네일이 3D 공간에 부유       │
│   · 스크롤 = 카메라 전진(fly-through)            │
│   · 마우스 = 카메라 패럴랙스 / 패널 레이캐스트   │
├───────────────────────────────────────────────┤
│  DOM 오버레이 (라우트별로 교체)                  │
│   · 헤더: "MICHAEL GATT / COMPOSER"             │
│   · 히어로 카피(키네틱 타이포)                   │
│   · 하단 문장형 내비: THE WORK / ABOUT / CONTACT │
│   · 커스텀 커서 .a-cursor                        │
│   · 우하단 Mute/Unmute 토글                      │
└───────────────────────────────────────────────┘
```

**계측으로 확인한 핵심 사실**

- 홈(`/`), `/projects`, `/about`, `/contact`가 **모두 같은 WebGL 씬을 배경으로 공유**합니다. SPA 라우팅으로 오버레이 DOM만 교체되고 캔버스는 파괴되지 않습니다.
- `document.documentElement.scrollHeight === window.innerHeight` (예: 962 == 962). 즉 **네이티브 스크롤바가 없고**, 휠/터치 입력을 가로채 가상 스크롤 값으로 변환해 카메라·애니메이션을 구동합니다(scroll-hijacking).
- 캔버스는 뷰포트 전체(`1485×962`)를 덮고 `devicePixelRatio`로 스케일합니다.
- 프로젝트 "링크"는 DOM 앵커가 아니라 **WebGL 오브젝트**입니다(`a[href^="/projects/"]`가 DOM에 없음). 패널 클릭은 레이캐스팅으로 판정합니다.

---

## 4. 디자인 분석

### 4.1 톤 & 무드
철저히 **시네마틱·미니멀**. 배경은 순수 검정(`#000`), 텍스트는 따뜻한 오프화이트(Tailwind 커스텀 토큰 `offWhite`). 채도 높은 색은 프로젝트 썸네일 안에서만 등장하고, UI 자체는 흑백에 가깝습니다. 어둠 속에서 이미지 패널이 은은히 빛나며 중앙(카메라 근처)으로 올수록 밝아지는 명암 대비가 "우주/극장" 은유를 만듭니다.

### 4.2 타이포그래피
- **본문/헤드라인 폰트**: `Zapf Humanist 601 BT — Demi` (자체 호스팅 `.woff2`). Bitstream이 만든 **Optima 계열의 휴머니스트 산세리프**로, 세리프가 없지만 획 굵기에 미세한 대비가 있어 우아하고 클래식한 인상을 줍니다.
- **히어로 카피 계측값**: `font-size ≈ 58.8px`, `font-weight 400`, `letter-spacing ≈ 3.1px`, 대문자. 넉넉한 자간의 대문자 조판이 "영화 크레딧/포스터" 느낌을 냅니다.
- **혼합 스케일 조판**: 한 문장 안에서 핵심어(MICHAEL GATT'S / FILM / TV SHOWS / GAMES / COMPOSING)는 크게, 연결어(to·of·and·music)는 아주 작게 배치해 **리듬감 있는 편집 디자인**을 구성합니다.

### 4.3 레이아웃 & 반응형
- 유틸리티 클래스가 Tailwind 규약(`text-16`, `text-8`, `sm:text-20`, `bottom-9`, `z-40`, `z-50`, `text-offWhite`, `uppercase` 등)이라 **Tailwind CSS**를 사용 중임을 확인했습니다.
- 중앙 정렬 히어로 + 하단 고정 내비 + 우하단 고정 컨트롤의 **오버레이 HUD** 구조. 콘텐츠보다 여백과 배경이 지배적입니다.

### 4.4 내비게이션(문장형)
하단 내비가 링크 나열이 아니라 **한 문장**입니다:

```
the  WORK  and  ABOUT  me
        or  CONTACT
```

`WORK / ABOUT / CONTACT`만 큰 대문자 + 인터랙션 대상이고, `the·and·me·or`는 작은 소문자 연결어입니다. 현재 라우트에 해당하는 항목엔 **밑줄(active)**이 붙습니다(예: `/about`에서 ABOUT 밑줄). 편집 디자인 감각이 드러나는 시그니처 마이크로 디테일입니다.

---

## 5. 핵심 인터랙션 분석 (재현 대상 목록)

### 5.1 인터랙티브 사운드 로더 (진입 게이트)
- 검정 화면에 키네틱 텍스트가 마스크 애니메이션으로 나타남: `CLICK ANYWHERE TO TURN ON YOUR SOUND` (일부 글자는 `S O U N D`처럼 자간을 극단적으로 벌려 표현).
- 두 갈래 진입: **화면 아무 곳이나 클릭(사운드 ON) / "ENTER WITHOUT SOUND"(사운드 OFF)**.
- 목적: (1) 자산 프리로드 시간 커버, (2) 브라우저 정책상 사용자 제스처가 있어야 오디오 재생이 가능하므로 **오디오 언락 게이트** 역할.
- 진입 시 로더가 페이드아웃되며 WebGL 씬이 은은히 밝아지는 전환.

### 5.2 WebGL "우주" fly-through 갤러리 — **시그니처 효과**
- 약 90장의 프로젝트 썸네일이 **3D 공간에 터널/구름처럼 부유**. 각 이미지는 텍스처를 입힌 평면(plane).
- 스크롤하면 **카메라가 Z축으로 전진**하며 패널 사이를 통과. 마우스 이동에 따라 카메라가 살짝 기울어지는 **패럴랙스**.
- 카메라에 가까운 패널일수록 밝고 선명, 먼 패널은 어둡게 페이드(거리 기반 명도/포그).
- 패널에 커서를 올리면(레이캐스팅) 하이라이트되고, 커스텀 커서에 라벨이 뜨며, 클릭 시 해당 프로젝트로 진입하는 구조로 판단됨.

### 5.3 키네틱 히어로 타이포그래피
- 히어로 문구가 **단어/글자 단위로 시차를 두고** 등장·소멸(마스크 슬라이드 + 페이드). 스크롤 진행도에 따라 텍스트 투명도/블러/위치가 연동됩니다.

### 5.4 커스텀 텍스트 커서 & 마이크로인터랙션
- `.a-cursor`(`pointer-events-none fixed z-50 uppercase text-offWhite`) — 마우스를 따라다니며 문맥 라벨(예: OPEN/VIEW/DRAG류)을 표시하는 **텍스트형 커스텀 커서**. 네이티브 커서는 숨김에 가까움.
- 링크·패널 호버 시 커서 크기/문구 전환 등의 마이크로인터랙션.

### 5.5 오디오 + 이퀄라이저 비주얼
- `<audio>` 1개 + `AudioContext` 사용 확인. 배경 음악과 함께 **오디오 신호를 분석해 움직이는 이퀄라이저 비주얼**(Awwwards가 "player equalizer visualization"으로 언급).
- 우하단 **Mute/Unmute** 토글로 사운드 제어.

### 5.6 페이지 전환 · 프로젝트 페이지 · 404
- 라우트 전환 시 캔버스는 유지된 채 오버레이만 크로스페이드 → **끊김 없는 전환**.
- 프로젝트 상세, 커스텀 404 페이지 존재(Awwwards 태그). 상세는 스크롤 기반 스토리텔링 레이아웃으로 추정.

---

## 6. 실제 사이트 기술 스택 (계측 결과)

| 레이어 | 실제 사용 (확인/추정) |
|---|---|
| 프레임워크 | **Nuxt 3 + Vue** (`window.__NUXT__`, `#__nuxt`, `_nuxt/*.js` 청크 99개) — *확인* |
| 스타일 | **Tailwind CSS** (유틸리티 클래스 규약) — *확인* |
| CMS | **Prismic** (`static.cdn.prismic.io`, `images.prismic.io`) — *확인* |
| 그래픽 | **WebGL** (`<canvas>` 1개, WebGL2 컨텍스트) — *확인* / 렌더 엔진은 번들 내부라 전역 미노출 → **Three.js 또는 OGL** 계열 *추정* |
| 애니메이션 | 전역 미노출 → **GSAP** 계열 트윈 + 커스텀/**Lenis** 스무스 스크롤 *추정* |
| 오디오 | **Web Audio API** (`AudioContext`) + `<audio>` — *확인* |
| 폰트 | 자체 호스팅 `ZapfHumanist601BT-Demi.woff2` — *확인* |
| 이미지 | Prismic CDN, 프리로드 다수(≈90+) — *확인* |

> "추정"은 소스가 번들·트리셰이킹되어 전역 스코프에 라이브러리 이름이 노출되지 않았기 때문입니다. 효과의 형태로 역추론한 것입니다.

**우리 조건과의 관계**: 우리는 위 스택 중 어느 것도 쓰지 않습니다. Nuxt/Vue/Tailwind/Prismic/GSAP/Three는 전부 제외하고, **브라우저 네이티브 API만으로** 동일 "경험"을 만드는 것이 목표입니다. WebGL·Web Audio·History API·Pointer/Wheel/Touch 이벤트는 브라우저 표준이므로 "무라이브러리" 조건에 위배되지 않습니다.

---

## 7. 무(無)라이브러리 재구현 전략 — 핵심

### 7.1 전체 매핑: 실제 → 순수 바닐라

| 기능 | 실제 사이트 | 바닐라 대체 |
|---|---|---|
| UI 컴포넌트 | Vue | 순수 DOM + `<template>` / 작은 자체 상태 객체 |
| 스타일 | Tailwind | 손으로 쓴 CSS + CSS 커스텀 프로퍼티(디자인 토큰) |
| 라우팅 | Nuxt Router | **History API** (`pushState` + `popstate`) |
| 콘텐츠 | Prismic | 로컬 `data.json` (프로젝트 배열) |
| 3D 씬 | Three/OGL | **Raw WebGL2** (직접 셰이더 작성) |
| 스무스/가상 스크롤 | Lenis류 | **`requestAnimationFrame` + lerp** 커스텀 |
| 트윈 | GSAP | 자체 `lerp`/`easing` 유틸 (수십 줄) |
| 오디오 비주얼 | (자체) | **Web Audio `AnalyserNode`** |
| 커스텀 커서 | (자체) | `mousemove` + `transform` |

### 7.2 커스텀 스무스/가상 스크롤 (모든 것의 심장)
네이티브 스크롤을 막고, 휠·터치 델타를 목표값에 누적한 뒤 매 프레임 현재값을 목표값으로 **선형 보간(lerp)**합니다. 이 `scroll` 정규값(0~1 또는 누적 거리)이 카메라 위치·타이포 애니메이션 등 모든 것을 구동합니다.

```js
// 가상 스크롤: 라이브러리 없이 관성/스무스 구현
const scroll = { current: 0, target: 0, ease: 0.08, max: 1 };

addEventListener('wheel', (e) => {
  scroll.target += e.deltaY * 0.001;          // 감도
  scroll.target = Math.max(0, Math.min(scroll.max, scroll.target));
}, { passive: true });
// 터치도 동일하게 touchstart/touchmove 델타로 처리

function raf() {
  // lerp = GSAP 없이 부드러운 감쇠
  scroll.current += (scroll.target - scroll.current) * scroll.ease;
  updateCamera(scroll.current);   // WebGL 카메라 Z
  updateTypography(scroll.current);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

const lerp = (a, b, t) => a + (b - a) * t;      // 어디서나 재사용
```

접근성: `matchMedia('(prefers-reduced-motion: reduce)')`가 참이면 관성/카메라 이동을 끄고 즉시 점프하도록 분기합니다.

### 7.3 WebGL 패널 "우주" (가장 큰 작업)

> 이 절은 **최소 구성 개요**입니다. 이 씬의 정체성인 "공간감 + 살아있는 애니메이션 + 무한 fly-through + 3D 인터랙션"의 **심화 구현 전략은 문서 맨 끝 「부록 A. 공간·애니메이션 씬 딥다이브」에 별도로 상세히 정리**했습니다. 실제로 벤치마킹의 핵심 공수는 그쪽입니다.

라이브러리 없이 raw WebGL2로 만드는 최소 구성:

1. **지오메트리**: 유닛 quad(2 삼각형) 하나. 90장을 개별 draw call로 그리면 느리므로 **인스턴싱**(`drawArraysInstanced`)으로 한 번에 그립니다. 인스턴스별 속성 = 3D 위치(랜덤 분포), 스케일, 텍스처 인덱스.
2. **텍스처**: 썸네일 90장을 개별 텍스처로 바인딩하면 낭비가 크므로 **텍스처 아틀라스**(스프라이트 시트) 또는 `TEXTURE_2D_ARRAY` 한 장으로 묶고, 인스턴스 속성으로 UV 오프셋을 넘깁니다.
3. **카메라**: 원근 투영 행렬을 직접 계산(`perspective`, `lookAt`). 행렬 라이브러리(gl-matrix)도 안 쓴다면 4×4 행렬 함수 30~40줄을 자체 작성.
4. **버텍스 셰이더**: 인스턴스 위치 + 카메라 전진(scroll) + 마우스 패럴랙스를 반영해 각 패널을 배치.
5. **프래그먼트 셰이더**: 텍스처 샘플 + **카메라 거리 기반 밝기/포그**로 원근감·시네마틱 톤을 연출.
6. **레이캐스팅(클릭 판정)**: 마우스 좌표를 NDC로 변환 → 역투영으로 레이 생성 → 각 패널 평면과 교차 검사해 가장 가까운 히트를 선택. 이때 커스텀 커서 라벨을 갱신하고 클릭 시 해당 프로젝트로 라우팅.
7. **해상도**: `canvas.width = innerWidth * devicePixelRatio`로 선명도 확보, DPR 상한(예: 2)으로 성능 보호. `resize` 시 투영행렬·뷰포트 갱신.

```glsl
// fragment (개념): 거리 기반 페이드로 "우주" 명암 만들기
precision highp float;
in vec2 vUv;
in float vDist;              // 카메라로부터의 거리
uniform sampler2D uTex;
out vec4 frag;
void main() {
  vec3 col = texture(uTex, vUv).rgb;
  float fade = clamp(1.0 - vDist * 0.04, 0.0, 1.0); // 멀수록 어둡게
  frag = vec4(col * fade, 1.0);
}
```

> 난이도 팁: WebGL 원리를 다지려면 [WebGL2 Fundamentals](https://webgl2fundamentals.org/)가 표준 참고서입니다. "우주 패널" 자체는 quad 인스턴싱 + 카메라 이동이 전부라, 원리를 이해하면 코드량은 생각보다 적습니다. **행렬/셰이더 수학이 실질 병목**입니다.
>
> 성능 타협안: 3D 몰입이 과하다면 **CSS 3D 변환**(`transform: translate3d/perspective`)으로 DOM `<img>`를 공간 배치하는 대체도 가능합니다. 구현 난이도는 크게 낮지만, 90장 규모에서 프레임·블렌딩·포그 품질은 WebGL이 확연히 우위입니다.

### 7.4 인터랙티브 사운드 로더 (오디오 언락 + 프리로드)
자산을 프리로드하는 동안 로더를 보여주고, 사용자의 첫 클릭에서 `AudioContext.resume()`으로 오디오를 언락합니다.

```js
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
// 로더 화면 클릭 → 반드시 사용자 제스처 안에서 resume
enterBtn.addEventListener('click', async () => {
  await audioCtx.resume();          // 브라우저 자동재생 정책 통과
  if (withSound) bgAudio.play();
  playIntroTransition();            // 로더 페이드아웃 + 씬 밝히기
});
// 프리로드: 이미지 디코드 완료를 기다렸다 진입 허용
await Promise.all(urls.map(u => { const i = new Image(); i.src = u; return i.decode().catch(()=>{}); }));
```

키네틱 로더 텍스트는 CSS `@keyframes`(마스크 슬라이드/페이드) + 자간(`letter-spacing`)만으로 재현 가능합니다.

### 7.5 키네틱 타이포그래피 (라이브러리 없이)
문장을 단어/글자 `<span>`으로 쪼갠 뒤(자바스크립트로 자동 분해), 각 span에 `transition-delay`를 순차로 주거나, 스크롤 정규값을 CSS 변수로 흘려 넣어 `transform`/`opacity`를 구동합니다.

```js
// "글자 쪼개기" — SplitText(GSAP 유료) 없이
el.innerHTML = [...el.textContent].map((ch, i) =>
  `<span style="--i:${i}">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
```
```css
h1 span {
  display:inline-block;
  transform: translateY(1em);
  opacity: 0;
  transition: transform .8s cubic-bezier(.16,1,.3,1), opacity .8s;
  transition-delay: calc(var(--i) * 30ms);   /* 글자별 stagger */
}
h1.in span { transform: none; opacity: 1; }
```

스크롤 연동 마스크 효과는 위 `scroll.current` 값을 `--p` 같은 CSS 변수로 써서 `clip-path`/`opacity`를 보간하면 됩니다.

### 7.6 커스텀 텍스트 커서
```js
const cur = document.querySelector('.a-cursor');
addEventListener('pointermove', e => {
  cur.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
});
// 호버 대상에 따라 라벨/스케일 전환
panelHover(label => cur.textContent = label);   // "OPEN" 등
```
`body { cursor: none }`로 네이티브 커서를 숨기고, `.a-cursor`는 `position:fixed; pointer-events:none`. 터치 기기에선 비활성화.

### 7.7 오디오 이퀄라이저 비주얼
```js
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 64;
source.connect(analyser); analyser.connect(audioCtx.destination);
const bins = new Uint8Array(analyser.frequencyBinCount);
function drawEQ() {
  analyser.getByteFrequencyData(bins);   // 주파수 대역별 진폭
  bars.forEach((bar, i) => bar.style.transform = `scaleY(${bins[i] / 255})`);
  requestAnimationFrame(drawEQ);
}
```
막대는 DOM/CSS로도, WebGL 씬 안에서도 그릴 수 있습니다.

### 7.8 라우팅 & 퍼시스턴트 배경
캔버스를 최상위에 한 번만 만들고, 라우트별 오버레이 DOM만 교체합니다. History API로 SPA 라우팅을 직접 구현:

```js
function navigate(path) {
  history.pushState({}, '', path);
  renderOverlay(path);        // 오버레이만 교체(캔버스 유지)
  crossfade();                // 이전/다음 오버레이 페이드
}
addEventListener('popstate', () => renderOverlay(location.pathname));
document.addEventListener('click', e => {
  const a = e.target.closest('a[data-spa]');
  if (a) { e.preventDefault(); navigate(a.getAttribute('href')); }
});
```

### 7.9 성능 · 접근성 · 모바일
- **DPR 상한**과 인스턴싱으로 GPU 부하 관리, 탭 비활성 시 `requestAnimationFrame` 정지.
- **`prefers-reduced-motion`**: 카메라 이동·관성·키네틱 stagger를 끄고 정적 레이아웃 제공.
- **모바일 폴백**: 저사양에서 패널 수 축소 또는 WebGL 대신 정적 그리드로 전환, 커스텀 커서 비활성.
- **접근성**: WebGL로만 존재하는 프로젝트 링크는 스크린리더가 못 읽으므로, **숨김 `<a>` 목록(시맨틱 내비)**을 DOM에 함께 제공해야 SEO·접근성을 확보(실제 사이트의 취약점이기도 함).

---

## 8. 구현 로드맵 (권장 우선순위)

1. **뼈대**: 검정 캔버스 풀스크린 + `rAF` 루프 + 가상 스크롤(lerp) + DPR 리사이즈. (7.2)
2. **정적 콘텐츠/라우팅**: `data.json` + History API SPA + 오버레이 HUD(헤더·문장형 내비·컨트롤). (7.8, 4.4)
3. **타이포 & 커서**: 키네틱 히어로 + 커스텀 텍스트 커서 + 로더 텍스트 애니메이션. (7.5, 7.6, 7.4)
4. **WebGL 우주(핵심)**: quad 인스턴싱 + 텍스처 아틀라스 + 카메라 전진 + 거리 페이드. (7.3)
5. **인터랙션 심화**: 마우스 패럴랙스 + 레이캐스트 호버/클릭 → 프로젝트 진입. (7.3)
6. **오디오**: 로더 언락 + 배경음 + AnalyserNode 이퀄라이저 + Mute. (7.4, 7.7)
7. **마감**: 라우트 크로스페이드, 404, reduced-motion/모바일 폴백, 접근성 보강. (7.9)

MVP만 노린다면 1→2→3까지로도 "분위기"의 70%가 나옵니다. 4~5(WebGL 우주)가 이 사이트의 **정체성이자 최대 공수**입니다.

---

## 9. 리스크 & 주의점

- **실난이도 = WebGL 수학**: 효과 자체는 단순하지만 투영/뷰 행렬, 레이캐스팅, 인스턴싱, 텍스처 관리가 라이브러리 없이는 손이 많이 갑니다. gl-matrix조차 안 쓴다면 4×4 행렬 유틸을 직접 작성해야 합니다.
- **자산 최적화**: 90장 원본을 그대로 올리면 로딩·VRAM이 무너집니다. 아틀라스화 + 압축(WebP/AVIF, 가능하면 KTX2)와 프리로드 전략이 필수.
- **입력 이질감**: 커스텀 관성 스크롤은 트랙패드/휠/터치마다 감도가 다릅니다. 감도·이징 튜닝에 반복 조정이 필요.
- **SEO/접근성**: 콘텐츠가 WebGL/JS 의존이라 크롤러·스크린리더에 취약. 시맨틱 폴백 마크업을 병행해야 함.
- **오디오 정책**: 자동재생 불가 → 반드시 사용자 제스처 후 재생. 로더의 "사운드 켜기/끄기" 게이트가 이 문제를 우아하게 해결하는 장치임(그대로 벤치마킹 권장).
- **폰트 라이선스**: 실제 사이트는 Zapf Humanist 601 BT(상용)를 씀. 재현 시 라이선스 확인 또는 유사 대체(예: Optima 계열/무료 휴머니스트 산세리프)로 교체 필요.

---

## 10. 참고 소스

- 대상 사이트: https://michaelgatt.com/ (홈·`/projects`·`/about`·`/contact` 직접 계측)
- Awwwards 등재: https://www.awwwards.com/sites/michael-gatt-folio
- 무라이브러리 WebGL 학습: https://webgl2fundamentals.org/

*본 보고서의 프레임워크/애니메이션 라이브러리 항목 중 "추정"으로 표기된 부분은 번들 난독화로 전역 스코프에 노출되지 않아 효과 형태로 역추론한 것입니다. 그 외 항목(Nuxt·Vue·Prismic·Tailwind·WebGL·Web Audio·커스텀 커서·가상 스크롤·폰트)은 브라우저 계측으로 직접 확인했습니다.*

---

# 부록 A. 공간·애니메이션 씬 딥다이브 (WebGL fly-through 심화)

§7.3의 확장판입니다. "떠다니는 프로젝트 패널의 우주를 스크롤로 날아 통과하는" 씬을 **외부 라이브러리(Three.js·OGL·GSAP·gl-matrix 등) 없이** 구현하기 위한 구체 전략을 다룹니다. 코드 스니펫은 실제 붙여 쓰는 완성본이 아니라 **핵심 로직을 드러내는 골격**입니다.

## A.0 먼저: "공간감"과 "살아있음"은 어디서 오는가

라이브러리 없이 만들 때 가장 중요한 통찰은, 이 씬의 몰입감이 **다섯 가지 지각 단서(depth cue)의 합**이라는 점입니다. 각 단서를 하나씩 코드로 만들어 쌓으면 됩니다.

| 지각 단서 | 만드는 방법 | 담당 |
|---|---|---|
| ① 원근(가까울수록 큼) | 원근 투영행렬 | 카메라(A.2) |
| ② 운동 시차(가까운 게 빨리 흐름) | 카메라 전진 + 마우스 패럴랙스 | 카메라/입력(A.2) |
| ③ 대기 원근(멀수록 어둡고 흐림) | 거리 기반 페이드·포그 | 프래그먼트 셰이더(A.6) |
| ④ 겹침/차폐 | 깊이 정렬(Depth test) | 렌더 설정(A.12) |
| ⑤ 상시 미세 운동(살아있음) | 시간 기반 부유·맥동·자동 드리프트 | 버텍스 셰이더(A.7) |

핵심 교훈: **①~④는 "공간"을, ⑤는 "생명"을 만듭니다.** 초심자 구현이 밋밋해 보이는 이유는 대개 ③(거리 페이드)과 ⑤(상시 운동)를 빼먹기 때문입니다. 이 둘이 시네마틱 톤과 "애니메이션 같은" 인상의 8할입니다.

## A.1 좌표계와 공간 배치 (spatial layout)

**월드 정의**: 카메라를 원점(0,0,0)에 두고 **-Z 방향을 응시**한다고 정합니다. 패널은 카메라 앞쪽, 즉 z가 음수인 공간에 깊게 흩뿌립니다. 전진(스크롤)은 "패널이 +Z 방향으로 다가와 카메라를 지나가는 것"으로 표현합니다(카메라는 사실상 고정, A.2에서 이유 설명).

**관찰된 배치**: 실제 사이트는 화면 좌우의 패널이 복도 벽처럼 안쪽을 향해 기울어 있었습니다. 이는 순수 빌보드(항상 정면)라기보다 **원통형 셸(cylindrical shell) 배치 + 안쪽을 향한 요(yaw) 회전**에 가깝습니다. 세 가지 분포 전략과 트레이드오프:

- **(a) 원통 셸** — 반지름 `R`, 각도 `θ`(랜덤), 깊이 `z`(랜덤)로 배치하고 각 패널을 중심축을 향하도록 회전. → 관찰된 "액자 복도" 느낌에 가장 근접. **권장.**
- **(b) 레이어드 깊이 슬랩** — 여러 z-평면에 그리드+지터로 흩뿌림. 구현 쉬움, 공간감은 약간 평면적.
- **(c) 황금각 나선** — 균질 분포, 규칙성이 은근히 드러나 포트폴리오엔 덜 어울림.

**두 가지 필수 제약**:
1. **중앙 통로 확보** — 카메라 정면 축 주변 원뿔 안에는 패널을 두지 않습니다(최소 반경 `Rmin`). 그래야 히어로 카피가 항상 가려지지 않고, "통과하는 터널" 느낌이 납니다.
2. **겹침 억제** — 최소거리 리젝션 샘플링(Poisson-disc 유사)으로 패널이 뭉치지 않게 합니다.

```js
// 인스턴스 데이터는 "빌드 타임 1회" 생성 후 버퍼로 굳힌다 (매 프레임 재계산 금지)
function buildInstances(count, opt) {
  const R = opt.radius, Rmin = opt.radiusMin, DEPTH = opt.depth;
  const out = [];
  let guard = 0;
  while (out.length < count && guard++ < count * 40) {
    const theta = Math.random() * Math.PI * 2;
    const r = Rmin + Math.random() * (R - Rmin);   // 중앙 통로 확보
    const x = Math.cos(theta) * r;
    const y = (Math.random() - 0.5) * R * 1.2;      // 세로도 살짝 흩뿌림
    const z = Math.random() * DEPTH;                // [0, DEPTH) — 셰이더에서 wrap
    // 최소거리 리젝션 (겹침 억제)
    if (out.some(p => (p.x-x)**2 + (p.y-y)**2 + (p.z-z)**2 < opt.minDist**2)) continue;
    out.push({
      x, y, z,
      rot: theta + Math.PI,                         // 중심축(안쪽)을 바라보게
      scale: 0.7 + Math.random() * 0.6,             // 크기 다양성 = 깊이감 강화
      phase: Math.random() * Math.PI * 2,           // 상시 애니메이션 위상
      layer: out.length % opt.textureCount          // 텍스처 배열 층
    });
  }
  return out;
}
```

## A.2 카메라 모델과 이동 (전진 · 시차 · 무한 루프)

**왜 카메라를 고정하고 패널을 움직이나?** 무한 스크롤을 유한 메모리로 만들려면 패널 z를 주기적으로 되감아(wrap) 재활용해야 합니다. 카메라를 실제로 -Z로 무한히 보내면 좌표가 계속 커지고 정밀도가 무너집니다. 대신 **카메라는 원점에 두고, 셰이더에서 `uScroll`로 패널 z를 밀어** 카메라를 지나간 패널을 다시 먼 곳으로 순환시킵니다 → **끝없는 fly-through + 좌표 고정**.

```glsl
// 셰이더 안의 무한 루프 핵심 (개념)
// aOffset.z ∈ [0, uDepth). uScroll이 커지면 z가 카메라(0)로 다가오고, 넘으면 되감김.
float z = -uDepth + mod(aOffset.z + uScroll, uDepth);   // 항상 (-uDepth, 0] 범위
```

**마우스 패럴랙스**는 카메라를 아주 살짝 평행이동(또는 미세 회전)시켜 운동 시차 ②를 만듭니다. 값은 damp로 부드럽게 따라가게 합니다.

```js
// 카메라 상태: 스크롤은 셰이더로, 시차만 뷰행렬로
const cam = { px: 0, py: 0, tx: 0, ty: 0 };       // parallax current/target
addEventListener('pointermove', e => {
  cam.tx = (e.clientX / innerWidth  - 0.5) * 2;    // -1..1
  cam.ty = (e.clientY / innerHeight - 0.5) * 2;
});
function updateView(dt) {
  cam.px = damp(cam.px, cam.tx, 4, dt);            // 프레임 독립 감쇠(A.8)
  cam.py = damp(cam.py, cam.ty, 4, dt);
  // 카메라를 시차만큼 옆으로: view = translate(-px*amt, +py*amt, 0)
  mat4Translate(uView, identity, [-cam.px * 1.2, cam.py * 1.2, 0]);
}
```

**팝핑 방지**: near(카메라 코앞)와 far(맨 뒤)에서 갑자기 나타나거나 사라지면 어색하므로, A.6의 `vFade`로 양 끝에서 **디졸브**시킵니다.

## A.3 필요한 행렬 수학 (gl-matrix 없이 · 최소 3~4개)

전체 3D 라이브러리는 필요 없습니다. 이 씬엔 **원근 투영 · 곱 · 평행이동**이면 충분하고, 원통 회전은 셰이더에서 처리합니다(A.5). 열 우선(column-major) 4×4.

```js
const identity = () => new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);

function perspective(out, fovyRad, aspect, near, far) {
  const f = 1 / Math.tan(fovyRad / 2), nf = 1 / (near - far);
  out.set([ f/aspect,0,0,0,  0,f,0,0,  0,0,(far+near)*nf,-1,  0,0,2*far*near*nf,0 ]);
  return out;
}
function mat4Translate(out, a, [x,y,z]) {           // out = a * T(x,y,z)
  out.set(a);
  out[12] = a[0]*x + a[4]*y + a[8]*z  + a[12];
  out[13] = a[1]*x + a[5]*y + a[9]*z  + a[13];
  out[14] = a[2]*x + a[6]*y + a[10]*z + a[14];
  out[15] = a[3]*x + a[7]*y + a[11]*z + a[15];
  return out;
}
// 필요 시 곱(mat4Multiply)만 추가하면 끝. 여기선 uProj·uView를 따로 넘겨 셰이더에서 곱한다.
```

## A.4 인스턴스 렌더링 파이프라인 (90장을 draw call 1번에)

패널 90장을 개별 그리면 CPU-GPU 호출 비용이 큽니다. **인스턴싱**으로 유닛 quad 하나를 90번 복제해 **한 번의 `drawArraysInstanced`**로 그립니다. 인스턴스별 차이(위치·크기·회전·위상·텍스처 층)는 divisor 속성으로 넘깁니다.

```js
// 유닛 quad (TRIANGLE_STRIP 4정점) — 모든 인스턴스가 공유
const quad = new Float32Array([-0.5,-0.5,  0.5,-0.5,  -0.5,0.5,  0.5,0.5]);

// 인스턴스 속성 하나당 vertexAttribDivisor(loc, 1)  ← "정점마다"가 아니라 "인스턴스마다"
gl.vertexAttribDivisor(LOC_OFFSET, 1);   // aOffset(vec3)
gl.vertexAttribDivisor(LOC_SCALE,  1);   // aScale(vec2) 또는 float
gl.vertexAttribDivisor(LOC_ROT,    1);   // aRot(float)
gl.vertexAttribDivisor(LOC_PHASE,  1);   // aPhase(float)
gl.vertexAttribDivisor(LOC_LAYER,  1);   // aLayer(float)

// 매 프레임: 카메라 uniform만 갱신하고 단 한 번 그린다
gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, instanceCount);
```

**텍스처**: 썸네일 90장을 개별 텍스처로 바인딩하면 텍스처 유닛·스위칭이 낭비입니다. **`TEXTURE_2D_ARRAY`**(같은 크기 이미지를 층으로 쌓은 배열 텍스처) 한 개로 묶고 `aLayer`로 골라 씁니다. (호환성이 걱정되면 스프라이트 아틀라스 + UV 오프셋 폴백.)

## A.5 버텍스 셰이더 — 공간 배치 + 전진 + 시차 + 상시 드리프트 (모든 마법이 여기)

```glsl
#version 300 es
precision highp float;
layout(location=0) in vec2  aPos;     // 유닛 quad 코너 (-0.5..0.5)
layout(location=1) in vec3  aOffset;  // 인스턴스 기준 위치 (z ∈ [0,uDepth))
layout(location=2) in float aScale;
layout(location=3) in float aRot;     // 원통 안쪽을 향하는 yaw
layout(location=4) in float aPhase;   // 상시 애니메이션 위상
layout(location=5) in float aLayer;

uniform mat4  uProj, uView;
uniform float uScroll, uDepth, uTime, uIntro;   // uIntro: 0→1 인트로 진행도

out vec2  vUv;
out float vFade;      // near/far 디졸브 (0..1)
out float vLayer;

void main() {
  // 1) 상시 부유 — 씬이 "살아있게" (스크롤 없어도 움직임)
  vec3 drift = vec3(sin(uTime*0.5 + aPhase), cos(uTime*0.4 + aPhase*1.3), 0.0) * 0.12;

  // 2) 패널 로컬 코너: 크기 → 원통 안쪽 향하도록 Y축 yaw 회전
  vec3 local = vec3(aPos * aScale, 0.0);
  float c = cos(aRot), s = sin(aRot);
  local = vec3(c*local.x + s*local.z, local.y, -s*local.x + c*local.z);

  // 3) 무한 z-루프: 스크롤로 카메라(0)를 향해 다가오고 넘으면 되감김
  float z = -uDepth + mod(aOffset.z + uScroll, uDepth);

  // 4) 인트로: far에서 모여들며 등장 (uIntro 0→1)
  vec3 center = vec3(aOffset.xy, z) + drift;
  center.z -= (1.0 - uIntro) * uDepth;            // 시작 시 더 멀리서

  vec4 viewPos = uView * vec4(center + local, 1.0);
  gl_Position  = uProj * viewPos;

  vUv    = aPos + 0.5;
  vLayer = aLayer;

  // 5) 거리 기반 near/far 페이드(대기 원근 ③ + 팝핑 방지)
  float dist = -viewPos.z;
  float nearFade = smoothstep(0.05, 2.5, dist);            // 코앞에서 서서히 등장
  float farFade  = 1.0 - smoothstep(uDepth*0.55, uDepth*0.98, dist); // 멀리서 소멸
  vFade = nearFade * farFade * uIntro;
}
```

여기 한 셰이더 안에 **원근(투영) · 시차(uView) · 상시 운동(drift) · 무한 루프(mod) · 인트로(uIntro) · 대기 원근(vFade)** 이 전부 담깁니다. "공간 애니메이션 씬"의 실체는 결국 이 40줄입니다.

## A.6 프래그먼트 셰이더 — 시네마틱 톤

```glsl
#version 300 es
precision highp float;
in vec2 vUv; in float vFade; in float vLayer;
uniform highp sampler2DArray uTex;
out vec4 frag;

void main() {
  vec3 col = texture(uTex, vec3(vUv, vLayer)).rgb;
  // 프레임 안쪽 비네트(가장자리 살짝 어둡게) — 사진 액자 느낌
  vec2 d = abs(vUv - 0.5);
  float vig = smoothstep(0.5, 0.35, max(d.x, d.y));
  col *= vFade * (0.85 + 0.15 * vig);
  // 배경이 검정 → 검정으로 페이드아웃되므로 불투명 렌더 가능(정렬 불필요, A.12)
  frag = vec4(col, 1.0);
}
```

거리가 멀수록 `vFade`가 작아져 **검정 배경으로 자연스럽게 녹아듭니다.** 별도 포그 색을 쓰지 않고 "검정으로의 감쇠"만으로 대기 원근을 얻는 것이 이 어두운 톤의 비결입니다.

## A.7 상시 애니메이션(idle life) — "정지 상태에서도 살아있는" 씬

사용자가 스크롤을 멈춰도 씬이 죽지 않게 하는 4가지 상시 운동. 이게 "애니메이션 같은" 인상의 핵심입니다.

1. **패널 부유** — A.5의 `drift`(sin/cos + 인스턴스별 `aPhase`)로 각 패널이 제각기 미세하게 흔들림.
2. **카메라 자동 드리프트** — 입력이 없을 때 `uScroll`을 아주 느리게 자동 증가시켜 항상 전진감 유지.
3. **밝기 맥동** — 전역 노출을 `0.95 + 0.05*sin(uTime)`처럼 은은히 호흡.
4. **상시 시차** — 마우스가 멈춰도 카메라가 목표로 damp 중이라 미끄러지듯 정착.

```js
// 자동 드리프트: 사용자가 스크롤 안 해도 천천히 전진
scroll.target += autoDriftSpeed * dt;        // 예: 0.02/초
// (사용자 입력이 들어오면 그쪽 델타가 지배하도록 가중치만 조절)
```

## A.8 프레임레이트 독립 감쇠(damp)와 이징

`lerp(a, b, 0.08)`는 **프레임레이트에 의존**합니다(120Hz에선 2배 빨리 수렴). 카메라·스크롤처럼 "목표를 부드럽게 좇는" 값은 **지수 감쇠(damp)**로 바꿔야 어느 기기에서든 동일한 감으로 움직입니다.

```js
const now = () => performance.now() / 1000;
let prev = now();
// exp 기반: dt가 커도(프레임 드롭) 결과 일관
const damp = (a, b, lambda, dt) => b + (a - b) * Math.exp(-lambda * dt);
// 인트로/전환용 이징
const expoOut  = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
const cubicIO  = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
```

## A.9 3D 인터랙션 — 호버·클릭 판정 (레이캐스팅 없이도 가능)

패널이 WebGL 오브젝트라 DOM 히트테스트가 안 됩니다. 두 가지 방법:

- **정확한 방법(레이-평면 교차)**: 마우스 NDC → 역투영으로 광선 생성 → 각 패널 평면과 교차 검사 → 가장 가까운 히트. 정확하지만 회전 패널엔 계산이 늘어남.
- **실용적 방법(스크린 공간 근사, 권장)**: 각 인스턴스 **중심을 화면 좌표로 투영**해 마우스와의 픽셀 거리를 재고, 투영된 패널 크기 반경 안에 들어오면 히트. 90개 정도는 CPU로 매 프레임 검사해도 저렴합니다.

```js
// 스크린 공간 근사 픽킹 (매 프레임 또는 pointermove에서)
function pick(mx, my, viewProj) {
  let best = -1, bestD = Infinity;
  for (let i = 0; i < instances.length; i++) {
    const p = projectToScreen(instances[i].worldPos, viewProj); // → {x,y,depth,size}
    if (p.depth <= 0) continue;                                  // 카메라 뒤
    const d = Math.hypot(p.x - mx, p.y - my);
    if (d < p.size * 0.5 && p.depth < bestD) { bestD = p.depth; best = i; }
  }
  return best; // 히트한 인스턴스 index (없으면 -1)
}
```

히트가 잡히면: (1) 셰이더에 `uHoverId`를 넘겨 해당 패널만 **scale/밝기 부스트**, (2) **커스텀 커서 라벨**을 "OPEN" 등으로 전환, (3) 클릭 시 그 패널로 **dolly-in 전환**.

```glsl
// 버텍스 셰이더에 추가: 호버 패널 강조
uniform int uHoverId; uniform float uInstanceId; // (gl_InstanceID 사용 가능)
float hovered = (gl_InstanceID == uHoverId) ? 1.0 : 0.0;
local *= (1.0 + hovered * 0.12);   // 살짝 커지고
// 프래그먼트에서 col *= (1.0 + hovered*0.4);  // 밝아지게
```

## A.10 인트로·클릭 전환 연출

- **로더 → 씬(인트로)**: `uIntro`를 `expoOut`으로 0→1(약 1.5~2초). A.5에서 패널이 far에서 모여들며 `vFade`로 서서히 밝아짐 → "우주가 켜지는" 느낌.
- **패널 클릭 → 프로젝트**: 선택 패널의 z까지 `uScroll`을 `cubicIO`로 밀어 **카메라가 그 패널로 빨려들어가듯 전진(dolly-in)**, 패널이 화면을 꽉 채우면 프로젝트 상세 DOM으로 크로스페이드. 뒤로가기는 역재생.

```js
async function flyTo(index) {
  const targetScroll = computeScrollToCenter(index);
  await tween(scroll, { target: targetScroll }, 1.1, cubicIO); // 자체 트윈(요청 시 제공)
  crossfadeToProject(index);   // 오버레이 DOM 교체 (§7.8)
}
```

## A.11 모듈 구조와 메인 루프

라이브러리가 없을수록 **책임 분리**가 유지보수를 좌우합니다. 권장 모듈:

```
Renderer  — gl 컨텍스트·프로그램·유니폼·draw
Scene     — 인스턴스 버퍼·텍스처 배열
Camera    — proj/view 행렬·시차
Scroll    — 가상 스크롤(휠/터치→target, damp)
Input     — pointer/wheel/touch 정규화
Picker    — 스크린 공간 히트테스트
Cursor    — 커스텀 커서 라벨
Audio     — 언락·배경음·AnalyserNode
Router    — History API·오버레이 교체
```

```js
function frame() {
  const t = now(), dt = Math.min(t - prev, 0.05); prev = t;   // dt 상한(탭 복귀 튐 방지)
  Input.flush();
  Scroll.update(dt);                 // target ← 입력, current ← damp(current,target)
  Camera.update(dt);                 // 시차 damp, 행렬 갱신
  const hit = Picker.pick(Input.mx, Input.my, Camera.viewProj);
  Cursor.update(hit);
  Renderer.setUniforms({ uScroll: Scroll.current, uTime: t, uIntro, uHoverId: hit,
                         uProj: Camera.proj, uView: Camera.view });
  Renderer.draw();                   // drawArraysInstanced 1회
  requestAnimationFrame(frame);
}
```

## A.12 성능 체크리스트 (공간 씬 특화)

- **draw call 1회**(인스턴싱) + **텍스처 바인딩 최소화**(`TEXTURE_2D_ARRAY`).
- **DPR 상한**: `canvas.width = innerWidth * Math.min(devicePixelRatio, 2)`. 레티나에서 픽셀 4배 폭증 방지.
- **투명 정렬 회피**: 검정 배경으로 페이드하므로 **불투명 렌더 + `DEPTH_TEST`**로 처리 → 알파 블렌딩 정렬 문제 자체를 제거(이 어두운 톤에서 쓸 수 있는 강력한 단순화).
- **탭 비활성 정지**: `visibilitychange`에서 `cancelAnimationFrame`, 복귀 시 `prev` 리셋.
- **오버드로 관리**: far plane을 `uDepth`에 맞춰 짧게 잡고 far에서 이미 페이드아웃되게.
- **텍스처 메모리**: 썸네일을 실제 표시 크기(예: 512px)로 다운스케일, WebP/AVIF, 이상적으로 KTX2/Basis 압축 텍스처.
- **버퍼 불변**: 인스턴스 속성은 1회 업로드 후 고정. 매 프레임 바뀌는 건 uniform 몇 개뿐.

## A.13 저사양·모바일 폴백 (WebGL 없이도 "공간감"만은)

WebGL2 미지원/저성능 기기에선 **CSS 3D 변환**으로 축소 재현할 수 있습니다. `perspective` + `translate3d` + `rotateY`로 DOM `<img>`를 공간 배치하고, 동일한 가상 스크롤 값으로 `--z`를 밀면 됩니다. 인스턴싱·셰이더 톤은 못 따라오지만 원근·시차·전진감(①②)은 살아납니다.

```css
.scene  { perspective: 900px; transform-style: preserve-3d; }
.panel  {
  position: absolute; left: 50%; top: 50%;
  transform: translate(-50%,-50%)
             translate3d(var(--x), var(--y), var(--z))
             rotateY(var(--r));
  opacity: var(--fade);                 /* JS가 z로 계산해 near/far 페이드 */
  transition: none;                      /* 위치는 매 프레임 JS가 직접 갱신 */
}
```
```js
// 스크롤 값으로 각 패널 --z를 밀고, 거리로 --fade 계산 (WebGL A.5의 CSS판)
for (const el of panels) {
  const z = -DEPTH + mod(el._z + scroll.current * SPEED, DEPTH);
  el.style.setProperty('--z', z.toFixed(1) + 'px');
  el.style.setProperty('--fade', fadeByDistance(-z).toFixed(3));
}
```

## A.14 구현 순서 (이 씬만 떼어낸 서브 로드맵)

1. 검정 캔버스 + rAF + dt + 가상 스크롤(damp) + DPR 리사이즈.
2. 유닛 quad **1장**을 원근 투영으로 화면에 그리기(행렬 파이프라인 검증).
3. **인스턴싱**으로 N장 배치(A.1 분포) — 아직 정적.
4. `uScroll` 무한 z-루프(A.2) → 전진감 확보.
5. `vFade`(A.6) 거리 페이드 → 공간감·톤 급상승.
6. 상시 `drift` + 마우스 시차(A.7) → "살아있음".
7. 스크린 공간 픽킹 + 호버 강조 + 커스텀 커서(A.9).
8. 인트로 `uIntro` + 클릭 dolly-in 전환(A.10).
9. 성능·폴백 마감(A.12·A.13).

각 단계가 화면에서 눈에 보이는 진전을 주도록 쪼갠 순서입니다. **2~5단계까지만 가도 "우주를 나는" 핵심 인상이 완성**되고, 6단계에서 비로소 레퍼런스의 "고급스러운 생명감"에 근접합니다.

> 참고: 여기 스니펫들은 골격입니다. 실제로 돌아가는 단일 파일 바닐라 프로토타입(WebGL2 + 가상 스크롤 + 인스턴싱 + 페이드)이 필요하면 만들어 드릴 수 있습니다.
