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

## 📊 과제 요구사항 상세 체크리스트

> `docs/assignment-guide/` 이미지 25장(page-01 ~ page-25)에서 추출한 **전체 요구사항을 세부 항목 단위로** 검증한 결과입니다.
> 각 페이지는 v1~v4가 모두 존재하며, v5(folio)에서 한 번 더 재해석했습니다.

### 달성 통계

```
과제 ████████████████████████████████████ 17/17  100%
실습 ████████████████████████████████████  6/6   100%
합계 ████████████████████████████████████ 23/23  100%
```

| 구분 | 항목 수 | 충족 | 세부 요구사항 | 세부 충족 | 달성률 |
|---|---|---|---|---|---|
| [과제] | 17개 | 17개 | 78개 | 78개 | **100%** |
| [실습] | 6개 | 6개 | 25개 | 25개 | **100%** |
| **합계** | **23개** | **23개** | **103개** | **103개** | **100%** |

---

### 1. Web 개요

<details>
<summary><b>[과제] Project 구성과 index.html 생성</b> — ✅ 6/6</summary>

| # | 요구사항 | 충족 | 산출물 |
|---|---|---|---|
| 1 | Project Name: SKALA-FRONT | ✅ | 저장소 이름 |
| 2 | Folder: html | ✅ | `html/` |
| 3 | File: index.html | ✅ | [`html/index.html`](html/index.html) |
| 4 | 브라우저 타이틀(title): "Welcome SKALA" | ✅ | v1에서 구현, 이후 확장 |
| 5 | 본문 타이틀(h1): "환영 인사" | ✅ | v1에서 구현 |
| 6 | 본문(p): "스칼라에 오신 것을 환영합니다." | ✅ | v1에서 구현 |

</details>

### 2. HTML 기초

<details>
<summary><b>[실습] 나의 휴일 일과</b> — ✅ 6/6</summary>

| # | 요구사항 | 충족 | 산출물 |
|---|---|---|---|
| 1 | File: html/myHoliday.html | ✅ | [`html/myHoliday.html`](html/myHoliday.html) `.v2` `.v3` `.v4` · [v5](folio/holiday.html) |
| 2 | `<h1>` 사용 | ✅ | 페이지 타이틀 |
| 3 | `<h2>` 사용 | ✅ | 시간대별 섹션 구분 |
| 4 | `<br>` 사용 | ✅ | 줄바꿈 |
| 5 | `<p>` 사용 | ✅ | 본문 단락 |
| 6 | `<mark>` 사용 | ✅ | 강조 표시 |

</details>

<details>
<summary><b>[과제] 나의 소개</b> — ✅ 5/5</summary>

| # | 요구사항 | 충족 | 산출물 |
|---|---|---|---|
| 1 | File: html/myProfile.html | ✅ | [`html/myProfile.html`](html/myProfile.html) `.v2` `.v3` `.v4` · [v5](folio/profile.html) |
| 2 | `<ul>` — 내가 좋아하는 음식 | ✅ | 비순서 목록 |
| 3 | `<ol>` — 올 해 할 일 | ✅ | 순서 목록 |
| 4 | `<dl>` — 나를 설명하는 단어들 | ✅ | 정의 목록 |
| 5 | CSS 미사용 (v1) | ✅ | v1은 순수 HTML |

</details>

<details>
<summary><b>[과제] 나의 강의 일정</b> — ✅ 5/5</summary>

| # | 요구사항 | 충족 | 산출물 |
|---|---|---|---|
| 1 | File: html/myClass.html | ✅ | [`html/myClass.html`](html/myClass.html) `.v2` `.v3` `.v4` · [v5](folio/class.html) |
| 2 | `<table>` 사용 | ✅ | 시간표 테이블 |
| 3 | `<thead>` — 시간, 요일 | ✅ | 헤더 행 |
| 4 | `<tbody>` 사용 | ✅ | 본문 행 |
| 5 | `<td>` — 2시간 이상 강의나 점심시간은 셀을 합쳐서 표시 | ✅ | rowspan/colspan 적용 |

</details>

<details>
<summary><b>[과제] 바로가기</b> — ✅ 3/3</summary>

| # | 요구사항 | 충족 | 산출물 |
|---|---|---|---|
| 1 | index.html에 나의 수업, 휴일, 프로필 바로가기를 추가 | ✅ | [`html/index.html`](html/index.html) |
| 2 | `<a>` 사용 | ✅ | 하이퍼링크 |
| 3 | CSS 미사용 (v1) | ✅ | v1은 순수 HTML |

</details>

### 3. HTML Form

<details>
<summary><b>[과제] 회원가입</b> — ✅ 7/7</summary>

| # | 요구사항 | 충족 | 산출물 |
|---|---|---|---|
| 1 | File: html/signUp.html | ✅ | [`html/signUp.html`](html/signUp.html) `.v2` `.v3` `.v4` · [v5](folio/signup.html) |
| 2 | `<form>` — action은 signUpResult.html, method는 get | ✅ | 폼 제출 설정 |
| 3 | `<fieldset>` `<legend>` `<label>` | ✅ | 계정 정보 / 개인 프로필 정보 / 자기소개 그룹 |
| 4 | `<input>` — placeholder, required 등 속성 사용 | ✅ | 아이디, 비밀번호, 이메일, 이름, 생년월일 등 |
| 5 | `<select>` `<option>` `<textarea>` | ✅ | 가입 경로 선택, 자기소개 입력 |
| 6 | `<submit>` `<reset>` 버튼 | ✅ | 동의하고 회원가입 / 다시 작성 |
| 7 | 계정 정보 + 개인 프로필 정보 + 자기소개 섹션 구분 | ✅ | fieldset으로 구분 |

</details>

<details>
<summary><b>[과제] 회원가입결과</b> — ✅ 2/2</summary>

| # | 요구사항 | 충족 | 산출물 |
|---|---|---|---|
| 1 | File: html/signUpResult.html | ✅ | [`html/signUpResult.html`](html/signUpResult.html) `.v2` `.v3` `.v4` · [v5](folio/signup-result.html) |
| 2 | 회원가입에서 회원가입 버튼 클릭 시 회원가입결과 페이지로 이동 | ✅ | form action 연동 |

</details>

### 4. HTML 심화

<details>
<summary><b>[과제] 나의 여행지</b> — ✅ 5/5</summary>

| # | 요구사항 | 충족 | 산출물 |
|---|---|---|---|
| 1 | File: html/myTrip.html | ✅ | [`html/myTrip.html`](html/myTrip.html) `.v2` `.v3` `.v4` · [v5](folio/trip.html) |
| 2 | Media Resource Folder: media | ✅ | `media/` 디렉토리 |
| 3 | `<audio>` `<source>` 사용 | ✅ | 여행 음악 재생 |
| 4 | `<img>` 사용 | ✅ | 여행 사진 3장 |
| 5 | `<video>` `<source>` 사용 | ✅ | 여행 브이로그 영상 |

</details>

<details>
<summary><b>[과제] 포털 사이트형 메인 Hub 만들기</b> — ✅ 4/4</summary>

| # | 요구사항 | 충족 | 산출물 |
|---|---|---|---|
| 1 | 기존 myClass, myHoliday, myProfile, myTrip, signUp을 한 곳에 모아 볼 수 있는 개인 메인 포털 | ✅ | [`html/index.v2~v4.html`](html/index.v4.html) · [v5 허브](folio/index.html) |
| 2 | `<nav>` — 다른 파일로 이동하는 메뉴 링크 넣기 | ✅ | 바로가기 메뉴 |
| 3 | `<main>` — 본문 영역을 선언하고 컨텐츠 넣기 | ✅ | 메인 컨텐츠 영역 |
| 4 | `<aside>` — 사이드바 넣고 부가 정보 넣기 | ✅ | 실시간 정보 사이드바 |

</details>

### 5. CSS 기초

<details>
<summary><b>[실습] CSS Code Challenge (w3schools 기초)</b> — ✅ 6/6</summary>

| # | 항목 | 충족 |
|---|---|---|
| 1 | CSS Colors | ✅ 수행 |
| 2 | CSS Fonts | ✅ 수행 |
| 3 | CSS Text | ✅ 수행 |
| 4 | CSS Backgrounds | ✅ 수행 |
| 5 | CSS Position | ✅ 수행 |
| 6 | CSS Inheritance | ✅ 수행 |

> w3schools 사이트 내 실습 (저장소 외부 산출물)

</details>

<details>
<summary><b>[과제] 미션1 — 전체 테마 및 텍스트 Styling</b> — ✅ 6/6</summary>

CSS는 페이지마다 따로 쓰지 않고 **직접 만든 디자인 시스템 [`aurora-ui`](aurora-ui/)** 로 통합했습니다.

| # | 요구사항 | 충족 | 산출물 |
|---|---|---|---|
| 1 | 별도 CSS 파일 생성 /css/style.css | ✅ | [`aurora-ui/css/tokens.css`](aurora-ui/css/tokens.css) · [`themes.css`](aurora-ui/css/themes.css) 등 체계 분리 |
| 2 | 전체 글꼴: body 태그 선택자로 전체 폰트 변경 | ✅ | 자체 호스팅 폰트(`folio/fonts/*.woff2`) 적용 |
| 3 | 전체 줄간격, Color, 배경색 적용 | ✅ | CSS 변수 기반 디자인 토큰 |
| 4 | h1, h2 태그에 색, 크기, Padding, Border 등 꾸미기 | ✅ | 타이포그래피 토큰 |
| 5 | 링크 스타일: 링크 컬러나 Decoration 지정 | ✅ | [`reset.css`](aurora-ui/css/reset.css) + [`components.css`](aurora-ui/css/components.css) |
| 6 | 모든 HTML에서 style.css를 적용할 수 있도록 `<link>` 추가 | ✅ | v2~v5 전부 `aurora-ui/css/main.css` 링크 |

</details>

<details>
<summary><b>[과제] 미션2 — 박스 모델의 이해</b> — ✅ 3/3</summary>

| # | 요구사항 | 충족 | 산출물 |
|---|---|---|---|
| 1 | body 아래에 `<div class="container">` 추가, 모든 컨텐츠 가운데 정렬 | ✅ | [`aurora-ui/css/layout.css`](aurora-ui/css/layout.css) |
| 2 | myTrip.html: 여행지 카드에 class="trip-card" — 배경색, 테두리, 패딩, 마진 조정하여 리뷰 카드 형태 | ✅ | trip-card 스타일 적용 |
| 3 | myClass.html: table, th, td를 꾸며 깔끔한 테이블 만들기 | ✅ | 테이블 컴포넌트 스타일 |

</details>

<details>
<summary><b>[과제] 미션3 — 가독성 높은 회원가입 폼</b> — ✅ 3/3</summary>

| # | 요구사항 | 충족 | 산출물 |
|---|---|---|---|
| 1 | 입력창 크기 키우기 | ✅ | [`signUp.v2.html`](html/signUp.v2.html) + `components.css` 폼 컴포넌트 |
| 2 | Fieldset 그룹 테두리 다듬기 | ✅ | fieldset 스타일링 |
| 3 | 버튼 꾸미기 | ✅ | 버튼 컴포넌트 (gradient, hover 효과) |

</details>

### 6. CSS 심화

<details>
<summary><b>[실습] CSS Code Challenge (w3schools 심화)</b> — ✅ 9/9</summary>

| # | 항목 | 충족 |
|---|---|---|
| 1 | 2D Transforms | ✅ 수행 |
| 2 | 3D Transforms | ✅ 수행 |
| 3 | Transition | ✅ 수행 |
| 4 | Animations | ✅ 수행 |
| 5 | RWD Intro | ✅ 수행 |
| 6 | RWD Viewport | ✅ 수행 |
| 7 | RWD Grid View | ✅ 수행 |
| 8 | RWD Media Queries | ✅ 수행 |
| 9 | CSS Variables | ✅ 수행 |

> w3schools 사이트 내 실습 (저장소 외부 산출물)

</details>

<details>
<summary><b>[실습] 미션4 — Flex와 Grid로 레이아웃 잡기</b> — ✅ 2/2</summary>

| # | 요구사항 | 충족 | 산출물 |
|---|---|---|---|
| 1 | Index.html: 바로가기에 Flexbox를 적용하고, main과 aside를 가로 배치 | ✅ | [`aurora-ui/css/layout.css`](aurora-ui/css/layout.css) — 12단 그리드 · bento · app shell |
| 2 | myTrip.html: 여행지 카드를 Grid를 사용하여 3열 바둑판 배치 | ✅ | CSS Grid 레이아웃 적용 |

</details>

<details>
<summary><b>[실습] 미션5 — 스마트폰에서 보기 (반응형 웹 디자인)</b> — ✅ 2/2</summary>

| # | 요구사항 | 충족 | 산출물 |
|---|---|---|---|
| 1 | Index.html: 화면 폭 786px 이하로 줄면 본문\|사이드바를 세로 1열로 변경, 바로가기 1열 정렬 | ✅ | `@media` 반응형 (375px까지 검증 완료) |
| 2 | myTrip.html: 3열 배열을 1열로 조정 | ✅ | `@media` 반응형 적용 |

</details>

<details>
<summary><b>[실습] 미션6 — 생동감을 불어넣는 애니메이션</b> — ✅ 3/3</summary>

| # | 요구사항 | 충족 | 산출물 |
|---|---|---|---|
| 1 | 내비게이션 메뉴나 회원가입 버튼 hover 시 배경색/글자색이 부드럽게 변하도록 처리 | ✅ | [`aurora-ui/css/animations.css`](aurora-ui/css/animations.css) |
| 2 | 여행 앨범 카드에 마우스를 올리면 박스가 위로 떠오르고 그림자가 진해지는 효과 | ✅ | hover 트랜지션 |
| 3 | index.html을 처음 열었을 때 상단 헤더 타이틀이 부드럽게 페이드인 등장 애니메이션 | ✅ | fade-in @keyframes · `prefers-reduced-motion` 대응 포함 |

</details>

### 7. JavaScript 기초

<details>
<summary><b>[과제] Up-Down 숫자 맞추기 게임</b> — ✅ 7/7</summary>

| # | 요구사항 | 충족 | 산출물 |
|---|---|---|---|
| 1 | /script/upDown.js 생성 | ✅ | [`script/upDown.js`](script/upDown.js) |
| 2 | 컴퓨터가 1~50 사이의 무작위 숫자 하나를 생성 | ✅ | `Math.floor(Math.random()*50)+1` |
| 3 | prompt() 창을 띄워 사용자에게 숫자를 입력받기 | ✅ | prompt 사용 |
| 4 | 사용자가 맞출 때까지 반복 (while 또는 for 반복문) | ✅ | 반복문 구현 |
| 5 | 정답보다 큰 값 → alert("Down!"), 작은 값 → alert("Up!") | ✅ | 조건 분기 |
| 6 | 정답 맞추면 alert("축하합니다! X번 만에 맞추셨습니다.") | ✅ | 축하 메시지 |
| 7 | index.html의 aside 영역에 게임 시작 버튼 태그를 추가하여 실행 | ✅ | 버튼 연결 |

> v5에서는 **인월드 UI**로 재해석하고, 원문 `prompt`/`alert` 방식도 토글로 남겨 요구된 동작을 보존했습니다.

</details>

<details>
<summary><b>[과제] 성적 계산기</b> — ✅ 6/6</summary>

| # | 요구사항 | 충족 | 산출물 |
|---|---|---|---|
| 1 | /script/grade.js 생성 | ✅ | [`script/grade.js`](script/grade.js) |
| 2 | 과목 배열: var subjects = ["HTML", "CSS", "JavaScript"] | ✅ | 배열 선언 |
| 3 | 총점 변수 (var total = 0) 만들기 | ✅ | 변수 선언 |
| 4 | for문으로 각 과목의 점수를 prompt()로 입력받아 total에 더함 | ✅ | 반복 입력 |
| 5 | 평균 점수 구하기 (60점 이상 합격, 미만 불합격) | ✅ | 조건 판정 |
| 6 | 결과를 alert창으로 보여주기 | ✅ | `alert("총점: 240점, 평균: 80, 결과: 합격입니다!")` 형식 |

</details>

<details>
<summary><b>[과제] 내 가방 보기</b> — ✅ 4/4</summary>

| # | 요구사항 | 충족 | 산출물 |
|---|---|---|---|
| 1 | /script/bag.js 생성 | ✅ | [`script/bag.js`](script/bag.js) |
| 2 | showMyBag() 함수 생성 | ✅ | 함수 구현 |
| 3 | myBag 배열에 소지품 객체 (소지품 명, 소지품 수)의 임의 데이터 | ✅ | 객체 배열 |
| 4 | 반복문을 통해 소지품 객체를 출력 | ✅ | for 반복 출력 |

</details>

### 8. JavaScript 심화

<details>
<summary><b>[과제] 실시간 날씨 — DOM/이벤트</b> — ✅ 2/2</summary>

| # | 요구사항 | 충족 | 산출물 |
|---|---|---|---|
| 1 | index.html 사이드바에 도시를 고를 수 있는 `<select>` 태그와 결과를 보여줄 `<div id="weather-box">` 만들기 | ✅ | HTML 구조 구현 |
| 2 | weather.js: 도시를 바꿀 때마다(change 이벤트) 선택된 도시의 이름과 위도/경도를 DOM 조작(innerHTML)으로 표시 | ✅ | [`script/realtimeInfo.js`](script/realtimeInfo.js) |

</details>

<details>
<summary><b>[과제] 실시간 날씨 — 비동기 호출</b> — ✅ 3/3</summary>

| # | 요구사항 | 충족 | 산출물 |
|---|---|---|---|
| 1 | Open-Meteo 무료 API로 fetch()/async-await를 사용해 날씨 데이터를 비동기 요청 | ✅ | [`script/weatherAPI.js`](script/weatherAPI.js) |
| 2 | 데이터를 받아오는 동안 화면에 "로딩 중..." 메시지 표시 | ✅ | 로딩 상태 구현 |
| 3 | 다운로드 완료 후 실시간 온도와 습도를 화면에 그리기 | ✅ | 온도·습도 표시 |

</details>

<details>
<summary><b>[과제] 실시간 날씨 — 모듈분리</b> — ✅ 4/4</summary>

| # | 요구사항 | 충족 | 산출물 |
|---|---|---|---|
| 1 | weather.js를 데이터 책임(weatherAPI.js)과 화면 책임(realtimeInfo.js)으로 분리 | ✅ | 2파일 분리 |
| 2 | index.html: `<script type="module" src="realtimeInfo.js"></script>` | ✅ | 모듈 스크립트 |
| 3 | weatherAPI.js: export async function 분리 | ✅ | [`script/weatherAPI.js`](script/weatherAPI.js) |
| 4 | realtimeInfo.js: weatherAPI로부터 함수를 import 하여 처리 | ✅ | [`script/realtimeInfo.js`](script/realtimeInfo.js) |

</details>

### 제한 사항 준수 (`docs/csslibrary.md` §2)

| 금지 항목 | 사용 여부 |
|---|---|
| Bootstrap · Tailwind · Material UI · Bulma · Foundation | ❌ 미사용 |
| Animate.css · Font Awesome · Material Icons · GSAP · Three.js · jQuery | ❌ 미사용 |
| React · Vue · Svelte 등 프레임워크 | ❌ 미사용 |
| CDN으로 불러오는 모든 CSS/JS | ❌ 미사용 — **폰트도 `folio/fonts/*.woff2`로 자체 호스팅** |
| 외부 폰트 · 아이콘 · SVG · 이미지 URL · npm 패키지 | ❌ 미사용 |

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
| 2026-07-18 | `README.md` 요구사항 충족 상황판을 **상세 체크리스트**로 교체 — `docs/assignment-guide/` 이미지 25장에서 추출한 과제 23개 · 세부 요구사항 103개를 항목별로 검증·통계 (달성률 100%). |

---

<sub>권경현 · [github.com/khyun9807](https://github.com/khyun9807) · [velog.io/@khyun9807](https://velog.io/@khyun9807)</sub>
