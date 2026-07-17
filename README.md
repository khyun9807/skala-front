# SKALA-FRONT

> **한 줄 요약 — SK AX Full-Stack Engineering 과제 23개를 전부 구현했고, 같은 과제를 v1→v5로 다섯 번 다시 만들며 "순수 HTML"에서 "Awwwards 벤치마킹 시네마틱 사이트"까지 끌어올렸습니다. 외부 라이브러리는 한 개도 쓰지 않았고, CSS 디자인 시스템과 JS 라이브러리를 직접 만들어 그 위에 얹었습니다.**

**결론부터 3가지**

1. **요구사항 23개 전부 충족 (원래는 6페이지에 js과제 n개지만 더 쪼갰습니다)** — [과제] 17 + [실습] 4 + CSS 챌린지 2. 아래 [상황판](#-요구사항-충족-상황판)에 항목별 산출물 경로까지 매핑.
2. **직접 만든 라이브러리 2개** — [`aurora-ui`](aurora-ui/) (CSS 디자인 시스템) · [`tessera-js`](tessera-js/) (JS 라이브러리). 외부 CSS/JS/CDN/폰트 **0개**(금지 조건 준수), 폰트까지 자체 호스팅.
3. **v5 folio는 실제 내 경력이 콘텐츠** — Bridge Bank·Payper·Payper Community·Remind Lamia 등 실제 프로젝트와 성능 개선 수치(2,000ms→60ms 등)가 들어있습니다.

### 구현 규모 한눈에 보기

| 항목 | 수치 |
|---|---|
| 인터랙티브 기능 | **35개** (검색, 통계, 환율, 날씨, 게임, 차트, CRUD, 내보내기 등) |
| 고유 HTML 태그 | **88개** (시맨틱, 폼, 테이블, 미디어, 인터랙티브 요소 망라) |
| CSS 컴포넌트 클래스 | **130+개** (네비게이션, 버튼, 카드, 폼, 오버레이, 차트 등) |
| CSS 커스텀 속성 | **150+개** (디자인 토큰 — 색상, 간격, 타이포, 모션 등) |
| CSS 애니메이션 | **30개** @keyframes (fade, slide, orbit, pulse, shimmer 등) |
| 고유 CSS 속성 | **98개** (backdrop-filter, @property, container queries 등 최신 기법 포함) |
| CSS 셀렉터 | **450+개** |
| 최신 CSS 기법 | @layer, @property, :has(), Container Queries, color-mix(), backdrop-filter, 3D Transforms, @supports |

## 🌐 라이브 데모 — 설치 없이 바로 보기

> ### **▶ [https://khyun9807.github.io/skala-front/](https://khyun9807.github.io/skala-front/)**
>
> 클론·빌드·서버 실행 없이 브라우저에서 바로 열립니다. 위 주소가 **모든 버전으로 가는 허브**입니다.

| 바로가기 | 주소 |
|---|---|
| 🏠 프로젝트 인덱스 (허브) | [khyun9807.github.io/skala-front/](https://khyun9807.github.io/skala-front/) |
| ✨ **v5 folio** (최신·추천) | [/folio/](https://khyun9807.github.io/skala-front/folio/index.html) |
| 📊 프로젝트 과정·상황판 | [/about.html](https://khyun9807.github.io/skala-front/about.html) |
| 🎨 aurora-ui 데모 | [/aurora-ui/](https://khyun9807.github.io/skala-front/aurora-ui/index.html) |
| 🧩 TesseraJS 데모 앱 | [/tessera-js/](https://khyun9807.github.io/skala-front/tessera-js/index.html) |

<details>
<summary><b>로컬에서 실행하려면</b> (선택)</summary>

```bash
# file:// 로 열면 @import·ES Module·fetch가 막힙니다. 반드시 정적 서버로.
git clone https://github.com/khyun9807/skala-front.git
cd skala-front
python3 -m http.server 4173      # 저장소 루트에서
# → http://localhost:4173
```
</details>

---

## 📊 요구사항 충족 상황판

`docs/assignment-guide/README.md` 기준 전 항목. 각 페이지는 v1~v4가 모두 존재하며, v5(folio)에서 한 번 더 재해석했습니다.

### 1. Web 개요 · HTML 기초 · Form · 심화

| # | 항목 | 구분 | 산출물 | 상태 |
|---|---|---|---|---|
| 01 | Project 구성과 index.html 생성 | 과제 | [`index.html`](index.html) — 전 버전 허브로 확장 | ✅ |
| 02 | 나의 휴일 일과 | 실습 | [`html/myHoliday.html`](html/myHoliday.html) `.v2` `.v3` `.v4` · [v5](folio/holiday.html) | ✅ |
| 03 | 나의 소개 | 과제 | [`html/myProfile.html`](html/myProfile.html) `.v2` `.v3` `.v4` · [v5](folio/profile.html) | ✅ |
| 04 | 나의 강의 일정 | 과제 | [`html/myClass.html`](html/myClass.html) `.v2` `.v3` `.v4` · [v5](folio/class.html) | ✅ |
| 05 | 바로가기 | 과제 | [`html/index.html`](html/index.html) `.v2` `.v3` `.v4` | ✅ |
| 06 | 회원가입 | 과제 | [`html/signUp.html`](html/signUp.html) `.v2` `.v3` `.v4` · [v5](folio/signup.html) | ✅ |
| 07 | 회원가입결과 | 과제 | [`html/signUpResult.html`](html/signUpResult.html) `.v2` `.v3` `.v4` · [v5](folio/signup-result.html) | ✅ |
| 08 | 나의 여행지 | 과제 | [`html/myTrip.html`](html/myTrip.html) `.v2` `.v3` `.v4` · [v5](folio/trip.html) | ✅ |
| 09 | 포털 사이트형 메인 Hub | 과제 | [`html/index.v2~v4.html`](html/index.v4.html) · [v5 허브](folio/index.html) | ✅ |

### 2. CSS 기초 · 심화

CSS는 페이지마다 따로 쓰지 않고 **직접 만든 디자인 시스템 [`aurora-ui`](aurora-ui/)** 로 통합했습니다. v2~v5가 모두 `aurora-ui/css/main.css` 하나만 링크합니다.

| # | 항목 | 구분 | 산출물 | 상태 |
|---|---|---|---|---|
| 10 | CSS Code Challenge (w3schools) | 실습 | w3schools 사이트 내 실습 (저장소 외부) | ✅ 수행 |
| 11 | 미션1 — 전체 테마 및 텍스트 Styling | 과제 | [`aurora-ui/css/tokens.css`](aurora-ui/css/tokens.css) · [`themes.css`](aurora-ui/css/themes.css) — 테마 5종 · accent 4종 | ✅ |
| 12 | 미션2 — 박스 모델의 이해 | 과제 | [`aurora-ui/css/reset.css`](aurora-ui/css/reset.css) · [`components.css`](aurora-ui/css/components.css) | ✅ |
| 13 | 미션3 — 가독성 높은 회원가입 폼 | 과제 | [`signUp.v2.html`](html/signUp.v2.html) + `components.css` 폼 컴포넌트 | ✅ |
| 14 | CSS Code Challenge (w3schools) | 실습 | w3schools 사이트 내 실습 (저장소 외부) | ✅ 수행 |
| 15 | 미션4 — Flex와 Grid로 레이아웃 | 실습 | [`aurora-ui/css/layout.css`](aurora-ui/css/layout.css) — 12단 그리드 · bento · app shell | ✅ |
| 16 | 미션5 — 반응형 웹 디자인 | 실습 | `layout.css` + 각 페이지 `@media` (375px 검증 완료) | ✅ |
| 17 | 미션6 — 생동감을 불어넣는 애니메이션 | 실습 | [`aurora-ui/css/animations.css`](aurora-ui/css/animations.css) — `prefers-reduced-motion` 대응 포함 | ✅ |

### 3. JavaScript 기초 · 심화

| # | 항목 | 구분 | 산출물 | 상태 |
|---|---|---|---|---|
| 19 | Up-Down 숫자 맞추기 게임 | 과제 | [`script/upDown.js`](script/upDown.js) → `index.v3/v4` · [v5 인월드 UI](folio/index.html) | ✅ |
| 20 | 성적 계산기 | 과제 | [`script/grade.js`](script/grade.js) → `index.v3/v4` · v5 | ✅ |
| 21 | 내 가방 보기 | 과제 | [`script/bag.js`](script/bag.js) → `index.v3/v4` · v5 | ✅ |
| 23 | 실시간 날씨 — DOM/이벤트 | 과제 | [`script/realtimeInfo.js`](script/realtimeInfo.js) | ✅ |
| 24 | 실시간 날씨 — 비동기 호출 | 과제 | [`script/weatherAPI.js`](script/weatherAPI.js) | ✅ |
| 25 | 실시간 날씨 — 모듈 분리 | 과제 | `weatherAPI.js`(API) ↔ `realtimeInfo.js`(DOM) 책임 분리 | ✅ |

> v5에서는 JS 게임 3종을 **인월드 UI**로 재해석하고, 원문 `prompt`/`alert` 방식도 토글로 남겨 요구된 동작을 보존했습니다.

### 4. 제한 사항 준수 (`docs/csslibrary.md` §2)

| 금지 항목 | 사용 여부 |
|---|---|
| Bootstrap · Tailwind · Material UI · Bulma · Foundation | ❌ 미사용 |
| Animate.css · Font Awesome · Material Icons · GSAP · Three.js · jQuery | ❌ 미사용 |
| React · Vue · Svelte 등 프레임워크 | ❌ 미사용 |
| CDN으로 불러오는 모든 CSS/JS | ❌ 미사용 — **폰트도 `folio/fonts/*.woff2`로 자체 호스팅** |

---

## 🧭 프로젝트 진행 과정 — v1 → v5

같은 과제를 **다섯 번** 다시 만들었습니다. 각 단계는 이전 단계를 지우지 않고 나란히 보존해, 발전 과정을 그대로 비교할 수 있습니다.

| 버전 | 무엇을 더했나 | 핵심 |
|---|---|---|
| **v1** `html/*.html` | 순수 HTML | 시맨틱 마크업만으로 구조 잡기. 표의 `rowspan/colspan`, 폼의 네이티브 검증 등 HTML 자체 기능에 집중 |
| **v2** `html/*.v2.html` | **+ CSS** | 페이지마다 CSS를 흩뿌리는 대신 **디자인 시스템 [`aurora-ui`](aurora-ui/)를 직접 만들어** 적용. 토큰·테마·레이아웃·컴포넌트 체계 |
| **v3** `html/*.v3.html` | **+ Vanilla JS** | Up-Down·성적계산기·내가방·실시간날씨 등 JS 과제를 배선. DOM/이벤트/비동기/모듈 분리 |
| **v4** `html/*.v4.html` | **+ JS 라이브러리** | **[`tessera-js`](tessera-js/)를 직접 만들어** 결합. HTTP 클라이언트·IndexedDB·Web Worker·상태관리를 실제 페이지에 |
| **v5** [`folio/`](folio/index.html) | **완전히 다른 형식** | Awwwards 노미네이트작(**Cipher** · **Michael Gatt**) 벤치마킹 → 자체 vanilla 엔진(스무스스크롤·커스텀커서·3D 오빗·회전 링)으로 시네마틱 재해석. 콘텐츠도 **실제 내 경력**으로 교체 |

**v5가 v4와 다른 점** — v1~v4가 "과제를 잘 하는 것"이었다면, v5는 *"이 과제를 포트폴리오로 만들면 어디까지 가나"* 입니다. 벤치마킹 대상을 [조사 보고서](advanced/)로 먼저 분석하고, 그 인터랙션을 라이브러리 없이 이식했습니다.

---

## 🗂️ 구조

```text
skala-front/
├── index.html          ← 프로젝트 인덱스 (모든 버전으로 가는 허브)
├── 404.html            ← GitHub Pages 404 페이지
├── .nojekyll           ← Pages에서 Jekyll 빌드 비활성화 (정적 파일 그대로 서빙)
├── README.md           ← 이 문서
├── html/               [v1~v4] 과제 페이지 7종 × 4버전 = 28개
├── script/             [v3] JS 과제 (upDown·grade·bag·weather) + v4/v5 글루
├── aurora-ui/          [직접 제작] CSS 디자인 시스템 — 20섹션 데모 포함
├── tessera-js/         [직접 제작] JS 라이브러리 — 11페이지 데모 앱 포함
├── folio/              [v5] 시네마틱 folio — 자체 엔진 + 8페이지
├── media/              이미지·영상 자산 (media/portfolio = v5 콘텐츠)
├── docs/               과제 안내서·요구사항 (참고 자료)
└── advanced/           벤치마킹 조사 보고서 + 포트폴리오 원본 자료 (참고 자료)
```

---

## 🔀 Git 형상 관리

**기능 단위 브랜치 → Pull Request → main 머지**를 반복했습니다. 커밋 24개, PR 6건, 기능 브랜치 6개.

### 브랜치 전략

```
main ──●────────●────────●────────●────────●────────●──→
        ↑        ↑        ↑        ↑        ↑        ↑
      PR#5     PR#6     PR#8     PR#9     PR#12    PR#14
     feat/#1  feat/#2  feat/#3  feat/#4  feat/#5  feat/#6
    aurora-ui   CSS    기초 JS   JS 라이브러리  folio  myHoliday
```

- `feat/#N` — 기능 단위 개발 브랜치 (이슈 번호와 1:1)
- `doc/#N` — 문서 작업 브랜치 (현재 브랜치: `doc/#2`)
- 모든 병합은 **PR을 거쳐** main으로 (직접 push 없음)

### 커밋 이력 (주요 마일스톤)

| 커밋 | 내용 | 규모 |
|---|---|---|
| `af8930c` | add gitignore | 초기 설정 |
| `15320b8` | basic features | HTML 기초 과제 |
| `15fdd88` | advanced htmls | HTML 심화 과제 |
| `492c974` | **add my css library aurora-ui** (PR #5) | CSS 디자인 시스템 |
| `c65c376` | add css (PR #6) | v2 — 페이지에 CSS 적용 |
| `72e0f4a` | add basic js (PR #8) | v3 — JS 과제 1,286줄 |
| `56897bf` | **add frontend js lib** (PR #9) | TesseraJS — 116파일 11,453줄 |
| `23e995f` | tessera.js + aurora-ui css | v4 — 라이브러리 결합 |
| `0ced89d` | **first look** | v5 folio 착수 — 36파일 3,331줄 |
| `8554284` | second look | v5 다듬기 |
| `1f440e0` | **add myHoliday** (PR #14) | 실습 페이지 + v1~v4 4종 |
| `d828203` | adjust info | 실제 경력 콘텐츠 반영 — 171파일 5,922줄 |

```bash
git log --oneline --graph --all      # 전체 이력 보기
git log --oneline --shortstat        # 커밋별 변경 규모
```

> **버전 보존 방식** — v1~v4를 브랜치가 아니라 **파일명 접미사(`.v2`/`.v3`/`.v4`)로 나란히 보존**했습니다. 브랜치로 나누면 한 시점에 한 버전만 볼 수 있지만, 이 방식은 **네 버전을 동시에 띄워 비교**할 수 있어 "발전 과정을 보여주는" 목적에 더 맞습니다. 각 단계의 실제 작업 이력은 위 커밋/PR에 남아 있습니다.

---

## ▶️ 실행

```bash
git clone https://github.com/khyun9807/skala-front.git
cd skala-front
python3 -m http.server 4173
open http://localhost:4173          # → 프로젝트 인덱스
```

- **빌드 불필요** — 번들러·패키지 매니저 없이 그대로 동작합니다.
- **`file://` 금지** — `@import`, ES Module, `fetch`가 CORS로 막힙니다.
- 권장 브라우저: 최신 Chrome / Firefox / Safari (WebGL·IndexedDB·Web Worker 사용)
- **v5 folio는 데스크톱 전용** — 모바일 접속 시 시네마틱 안내 화면을 거쳐 v4(모바일 최적화)로 자동 유도됩니다.
<img width="960" height="1360" alt="KakaoTalk_20260716_225455881" src="https://github.com/user-attachments/assets/31423b3d-ea77-4396-ab5f-1be083d60e1f" />

---

## 📎 더 읽을거리

- [`aurora-ui/README.md`](aurora-ui/README.md) — 디자인 컨셉 · 컴포넌트 전체 목록 · 사용된 CSS 기술
- [`tessera-js/README.md`](tessera-js/README.md) — 폴더 구조 · 28개 항목 사용법 · 설계 패턴
- [`CLAUDE.md`](CLAUDE.md) — 저장소 작업 규약과 실제로 겪은 함정 모음

---

## 📋 변경 이력

| 날짜 | 변경 내용 |
|---|---|
| 2026-07-17 | v4 페이지 콘텐츠 개인화 — 프로필(이름·음식·목표·좌우명·자기소개 키워드), Hub 페이지 환영 메시지·명언·푸터 정보를 실제 정보(권경현)로 교체. `about.html`에 기술 통계 섹션(HTML 88태그·CSS 130+컴포넌트·35기능 상세표) 추가. `README.md`에 구현 규모 요약표 추가. |

---

<sub>권경현 · [github.com/khyun9807](https://github.com/khyun9807) · [velog.io/@khyun9807](https://velog.io/@khyun9807)</sub>
