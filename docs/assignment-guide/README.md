# SKALA-FRONT 과제 정리

> 원본: `2-3일차 스칼라 과제-복사.pdf` (SK AX Full-Stack Engineering - HTML, CSS, JavaScript 과정)
> 이 문서는 PDF에서 추출한 과제 요구사항을 정리한 것입니다. 각 과제의 참고 스크린샷은 `pages/` 폴더에 있습니다 (예: `pages/page-01.png`).
> 현재 프로젝트 구조와 대조해 실제 파일명을 확인했습니다 (`html/`, `css/`, `script/`, `media/`).

---

## 1. Web 개요

### [과제] Project 구성과 index.html 생성 — `pages/page-01.png`
- Project Name: `SKALA-FRONT`
- Folder: `html` / File: `index.html`
- `<title>`: "Welcome SKALA"
- `<h1>`: "환영 인사"
- `<p>`: "스칼라에 오신 것을 환영합니다."
- Live Server로 확인

---

## 2. HTML 기초

### [실습] 나의 휴일 일과 — `pages/page-02.png`
- File: `html/myHoliday.html`
- 필수 사용 Element: `<h1>`, `<h2>`, `<br>`, `<p>`, `<mark>`
- 내용 예시: 시간대별 휴일 일과 (느긋한 아침 / 오후 활동 / 저녁과 밤), 하이라이트(`<mark>`)로 강조 표시

### [과제] 나의 소개 — `pages/page-03.png`
- File: `html/myProfile.html`
- 필수 사용 Element: `<ul>`(좋아하는 음식), `<ol>`(올해 할 일), `<dl>`(나를 설명하는 단어들)
- **CSS는 사용하지 말 것**

### [과제] 나의 강의 일정 — `pages/page-04.png`
- File: `html/myClass.html`
- 필수 사용 Element: `<table>`, `<thead>`(시간/요일), `<tbody>`, `<td>`(2시간 이상 강의나 점심시간은 셀 합쳐서 표시 — rowspan/colspan)
- **CSS는 사용하지 말 것**

### [과제] 바로가기 — `pages/page-05.png`
- File: `html/index.html` (수정)
- index.html에 myClass / myHoliday / myProfile로 이동하는 `<a>` 바로가기 목록 추가
- **CSS는 사용하지 말 것**

---

## 3. HTML Form

### [과제] 회원가입 — `pages/page-06.png`
- File: `html/signUp.html`
- 필수 사용 Element:
  - `<form>` — action=`signUpResult.html`, method=`get`
  - `<fieldset>` `<legend>` `<label>`
  - `<input>` — placeholder, required 등 속성 사용
  - `<select>` `<option>` `<textarea>`
  - `<submit>` `<reset>` 버튼
- 구성: 계정 정보(아이디/비밀번호/이메일), 개인 프로필 정보(이름/생년월일/성별/관심분야 체크박스/가입경로), 자기소개(textarea)

### [과제] 회원가입결과 — `pages/page-07.png`
- File: `html/signUpResult.html`
- signUp.html에서 "회원가입" 버튼 클릭 시 이동
- 안내 사항 + 이전에 만든 페이지(프로필/수업/휴일)로 가는 링크 포함

---

## 4. HTML 심화

### [과제] 나의 여행지 — `pages/page-08.png`
- File: `html/myTrip.html`
- Media Resource Folder: `media`
- 필수 사용 Element: `<audio><source>`, `<img>`, `<video><source>`
- 여행 앨범(사진 여러 장) + 여행 브이로그(동영상) 구성

### [과제] 포털 사이트형 메인 Hub 만들기 — `pages/page-09.png`
- File: `html/index.html` (수정) — myClass/myHoliday/myProfile/myTrip/signUp을 모아보는 개인 포털로 재구성
- 필수 사용 Element:
  - `<nav>` — 다른 파일로 이동하는 바로가기 메뉴
  - `<main>` — 본문 영역 (오늘의 주요 소식 등)
  - `<aside>` — 사이드바 (실시간 정보 등 부가 정보)

---

## 5. CSS 기초

### CSS Code Challenge (w3schools 실습) — `pages/page-10.png`
1. CSS Colors — https://www.w3schools.com/css/css_challenges_colors.asp
2. CSS Fonts — https://www.w3schools.com/css/css_challenges_font.asp
3. CSS Text — https://www.w3schools.com/css/css_challenges_text.asp
4. CSS Backgrounds — https://www.w3schools.com/css/css_challenges_background.asp
5. CSS Position — https://www.w3schools.com/css/css_challenges_position.asp
6. CSS Inheritance — https://www.w3schools.com/css/css_challenges_inheritance.asp

### [과제] 미션1 - 전체 테마 및 텍스트 Styling — `pages/page-11.png`
- CSS 파일: `css/style.css` (신규 생성)
1. 구글 폰트에서 선택해 `body` 태그 선택자로 전체 폰트 적용
2. 전체 줄간격, Color, 배경색 적용
3. 제목 강조: `h1`, `h2`에 색/크기/padding/border 등
4. 링크 스타일: 링크 컬러, decoration 지정
5. 모든 HTML에서 `style.css`를 적용할 수 있도록 `<link>` 추가

### [과제] 미션2 - 박스 모델의 이해 — `pages/page-12.png`
- 가장 중요한 박스 모델(width, padding, margin, border)을 시각적으로 이해
1. `body` 태그 아래 `<div class="container">` 추가 후 스타일링 (모든 콘텐츠 가운데 정렬)
2. `myTrip.html`: 여행지 각 단락에 `<p class="trip-card">` 클래스 추가 — 배경색/테두리/패딩/마진으로 리뷰 카드 형태로 디자인
3. `myClass.html`: table, th, td를 꾸며 깔끔한 테이블로 완성

### [과제] 미션3 - 가독성 높은 회원가입 폼 — `pages/page-13.png`
- 스타일링하기 까다로운 폼(signUp.html) 스타일링
1. 입력창 크기 키우기
2. Fieldset 그룹 테두리 다듬기
3. 버튼 꾸미기

---

## 6. CSS 심화

### CSS Code Challenge (w3schools 실습) — `pages/page-14.png`
1. 2D Transforms — https://www.w3schools.com/css/css_challenges_css3_transforms.asp
2. 3D Transforms — https://www.w3schools.com/css/css_challenges_css3_3dtransforms.asp
3. Transition — https://www.w3schools.com/css/css_challenges_css3_transitions.asp
4. Animations — https://www.w3schools.com/css/css_challenges_css3_animations.asp
5. RWD Intro — https://www.w3schools.com/css/css_challenges_rwd_intro.asp
6. RWD Viewport — https://www.w3schools.com/css/css_challenges_rwd_viewport.asp
7. RWD Grid View — https://www.w3schools.com/css/css_challenges_rwd_grid.asp
8. RWD Media Queries — https://www.w3schools.com/css/css_challenges_rwd_grid.asp (원문 그대로, Grid View와 동일 링크로 표기됨)
9. CSS Variables — https://www.w3schools.com/css/css_challenges_css3_variables.asp

### [실습] 미션4 - Flex와 Grid로 레이아웃 잡기 — `pages/page-15.png`
1. `index.html`: 바로가기에 Flexbox 적용, `main`과 `aside`를 가로 배치
2. `myTrip.html`: 여행지 카드를 Grid로 3열 바둑판 배치

### [실습] 미션5 - 스마트폰에서 보기 (반응형 웹 디자인) — `pages/page-16.png`
1. `index.html`: 화면 폭 786px 이하로 줄면 본문/사이드바 구조를 세로 1열로 변경, 바로가기도 1열 정렬
2. `myTrip.html`: 3열 배열을 1열로 조정

### [실습] 미션6 - 생동감을 불어넣는 애니메이션 — `pages/page-17.png`
1. 내비게이션 메뉴나 회원가입 버튼 hover 시 배경색/글자색이 부드럽게 전환 (transition)
2. 여행 앨범 카드에 hover 시 위로 떠오르고(translateY) 그림자가 진해지는 효과
3. `index.html`을 처음 열었을 때 상단 헤더 타이틀이 페이드인(fade-in)되는 등장 애니메이션 (`@keyframes`)

---

## 7. JavaScript 기초

### [과제] Up-Down 숫자 맞추기 게임 — `pages/page-19.png`
- File: `script/upDown.js`
- 컴퓨터가 1~50 사이 무작위 숫자 생성: `var computerNum = Math.floor(Math.random() * 50) + 1;`
- `prompt()`로 사용자에게 입력받고, 맞출 때까지 반복 (`while` 또는 `for`)
- 큰 값 입력 시 `alert("Down!")`, 작은 값 입력 시 `alert("Up!")`
- 정답 시 `alert("축하합니다! X번 만에 맞추셨습니다.")` 후 종료
- `index.html`의 원하는 위치(예: `<aside>` 안 새 `<section>`)에 게임 시작 버튼 추가하여 실행

### [과제] 성적 계산기 — `pages/page-20.png`
- File: `script/grade.js`
- 과목 배열: `var subjects = ["HTML", "CSS", "JavaScript"];`
- 총점 변수: `var total = 0;`
- `for`문으로 배열 길이만큼 반복, 각 과목 점수를 `prompt(subjects[i] + " 점수를 입력하세요.")`로 입력받아 total에 합산
- 반복 종료 후 평균 계산 (60점 이상 합격 / 미만 불합격)
- 결과를 `alert()`로 출력 (예: "총점: 240점, 평균: 80, 결과: 합격입니다!")

### [과제] 내 가방 보기 — `pages/page-21.png`
- File: `script/bag.js`, 함수: `showMyBag()`
- `myBag` 배열에 소지품 객체(소지품명, 소지품 수)를 임의로 여러 개 생성
- 반복문으로 소지품 객체 내용을 출력 (alert)

---

## 8. JavaScript 심화

### [과제] 실시간 날씨 - DOM/이벤트 — `pages/page-23.png`
- `index.html`: 사이드바에 도시를 고를 수 있는 `<select>` 태그 + 결과를 보여줄 `<div id="weather-box">`
- `script/weather.js`: 사용자가 도시를 바꿀 때마다(`change` 이벤트), 선택된 도시의 이름과 위도/경도 좌표를 DOM 조작(`innerHTML`)으로 화면에 표시 (날씨는 아직 미구현)

### [과제] 실시간 날씨 - 비동기 호출 — `pages/page-24.png`
- Open-Meteo 무료 API로 날씨 데이터를 비동기로 가져오기
- `weather.js`: 도시 변경 시 `fetch()` + `async/await`로 Open-Meteo에 날씨 데이터 요청
  - API 예: `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`
- 로딩 중 "실시간 날씨 로딩 중... ⏳" 메시지 표시 → 완료되면 실제 온도/습도 표시

### [과제] 실시간 날씨 - 모듈분리 — `pages/page-25.png`
- `weather.js`를 데이터 담당 `script/weatherAPI.js`와 화면 담당 `script/realtimeInfo.js`로 분리
- `index.html`: `<script type="module" src="realtimeInfo.js"></script>`
- `weatherAPI.js`: `export async function`으로 함수 분리
- `realtimeInfo.js`: `weatherAPI`에서 함수를 `import`하여 화면 처리

---

## 참고 - 현재 프로젝트 파일 매핑

| 과제 | 실제 파일 경로 |
|---|---|
| index.html | `html/index.html` (루트 `index.html`은 구버전으로 보임) |
| myHoliday | `html/myHoliday.html` |
| myProfile | `html/myProfile.html` |
| myClass | `html/myClass.html` |
| myTrip | `html/myTrip.html` |
| signUp / signUpResult | `html/signUp.html`, `html/signUpResult.html` |
| style.css | `css/style.css` |
| upDown / grade / bag | `script/upDown.js`, `script/grade.js`, `script/bag.js` |
| weather 관련 | `script/weatherAPI.js`, `script/realtimeInfo.js` (weather.js는 모듈 분리 후 이 두 파일로 대체된 상태로 보임) |
| media | `media/` (cebu.svg, hokkaido.svg, lijiang.svg 등) |
