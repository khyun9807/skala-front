당신은 세계적인 수준의 프론트엔드 UI 엔지니어이자 인터랙션 디자이너입니다.

외부 CSS 라이브러리, UI 프레임워크, 아이콘 라이브러리, 애니메이션 라이브러리를 전혀 사용하지 않고, 순수 HTML, CSS, Vanilla JavaScript만으로 재사용 가능한 나만의 CSS 라이브러리를 제작해주세요.

## 1. 프로젝트 목표

이 프로젝트는 CSS 활용 능력을 평가하는 웹 페이지 제작 과제에 사용됩니다.

평가에서 높은 점수를 받을 수 있도록 다음 특성을 모두 만족해야 합니다.

* 시각적으로 화려하고 예술적인 디자인
* 모던하고 세련된 UI
* 다양한 CSS 속성과 표현 기법 활용
* 반응형 웹 디자인
* 동적인 인터랙션
* 재사용 가능한 컴포넌트 구조
* 여러 형태의 레이아웃 지원
* 창의적이고 혁신적인 시각 효과
* 실제 웹 프로젝트에서도 활용 가능한 코드 품질
* 단순히 장식적인 페이지가 아니라 기능적으로도 풍부한 UI

결과물은 Bootstrap이나 Tailwind CSS처럼 여러 페이지에서 재사용할 수 있는 작은 규모의 독자적인 CSS 라이브러리여야 합니다.

## 2. 절대적인 제한 사항

다음 외부 요소는 절대 사용하지 마세요.

* Bootstrap
* Tailwind CSS
* Material UI
* Bulma
* Foundation
* Animate.css
* Font Awesome
* Google Material Icons
* GSAP
* Three.js
* jQuery
* React, Vue, Svelte 등의 프레임워크
* CDN으로 불러오는 모든 CSS 및 JavaScript 라이브러리
* 외부 폰트
* 외부 아이콘 파일
* 외부 SVG 파일
* 외부 이미지 URL
* npm 패키지
* 인터넷 연결이 필요한 모든 리소스

반드시 다음 기술만 사용해주세요.

* HTML5
* CSS3
* Vanilla JavaScript
* CSS만으로 직접 만든 도형과 아이콘
* 직접 작성한 inline SVG
* CSS gradient 및 pattern
* 필요한 경우 로컬 이미지로 쉽게 교체할 수 있는 placeholder

외부 라이브러리를 흉내 낸 코드를 복사하지 말고, 처음부터 독창적인 구조로 설계해주세요.

## 3. 전체 디자인 콘셉트

기본 디자인 콘셉트는 다음 요소를 조합해주세요.

* 미래지향적 디자인
* 고급스러운 SaaS 대시보드
* Glassmorphism
* Neumorphism 일부 활용
* Aurora gradient
* Holographic effect
* Bento grid
* Layered card
* 유리 질감
* 빛 번짐 효과
* 부드러운 그림자
* 입체적인 깊이감
* 반투명 레이어
* 미세한 노이즈 또는 패턴
* 빛에 따라 변하는 듯한 테두리
* 깔끔한 여백과 정돈된 타이포그래피
* 강한 시각 효과와 높은 가독성의 균형

한 가지 효과만 반복하지 말고, 컴포넌트마다 다른 표현 방식을 사용해주세요.

디자인이 지나치게 산만하거나 촌스럽지 않도록 색상, 여백, 계층 구조, 대비를 체계적으로 관리해주세요.

## 4. CSS 라이브러리 설계 원칙

CSS 코드는 하나의 거대한 파일로 무작정 작성하지 말고, 디자인 시스템처럼 체계적으로 구성해주세요.

다음 구조를 포함해주세요.

### CSS 변수

`:root`에 다음 디자인 토큰을 정의해주세요.

* 주요 색상
* 보조 색상
* 강조 색상
* 성공, 경고, 위험, 정보 색상
* 배경 색상
* 표면 색상
* 텍스트 색상
* 테두리 색상
* 그라디언트
* 그림자 단계
* 여백 단계
* 글자 크기 단계
* border-radius 단계
* transition 속도
* z-index 단계
* 컨테이너 너비
* 반응형 breakpoint 기준

색상과 크기는 컴포넌트 내부에 반복적으로 하드코딩하지 말고 가능한 한 CSS 변수로 관리해주세요.

### 기본 초기화

다음 내용을 포함해주세요.

* box-sizing 초기화
* margin, padding 초기화
* 이미지 및 미디어 반응형 처리
* 버튼과 입력 요소 기본 스타일 초기화
* 접근성을 고려한 focus 스타일
* 부드러운 스크롤
* 선택 영역 스타일
* 스크롤바 커스터마이징
* 기본 타이포그래피 설정

### 클래스 네이밍

모든 클래스 이름 앞에 고유 prefix를 사용해주세요.

예시:

* `nova-btn`
* `nova-card`
* `nova-grid`
* `nova-modal`
* `nova-input`

단, `nova`라는 이름보다 라이브러리의 디자인 콘셉트에 맞는 더 창의적인 이름을 직접 정해도 됩니다.

클래스 이름은 역할을 쉽게 이해할 수 있도록 명확하게 작성해주세요.

## 5. 반드시 구현해야 하는 레이아웃 시스템

다음 레이아웃 기능을 구현해주세요.

* 반응형 container
* 12단계 grid system
* CSS Grid 기반 레이아웃
* Flexbox utility
* row, column 구조
* 자동 너비 grid
* 반응형 column 클래스
* gap utility
* 정렬 utility
* display utility
* spacing utility
* width, height utility
* position utility
* overflow utility
* text alignment utility
* visibility utility
* aspect-ratio utility
* sticky layout
* masonry처럼 보이는 카드 레이아웃
* Bento grid 레이아웃
* sidebar와 main content 레이아웃
* 모바일에서 sidebar가 drawer로 변경되는 구조

반응형 breakpoint는 최소 다음 단계를 지원해주세요.

* mobile
* large mobile
* tablet
* laptop
* desktop
* wide desktop

각 breakpoint에서 레이아웃이 자연스럽게 변화해야 합니다.

## 6. 반드시 구현해야 하는 컴포넌트

최소한 다음 컴포넌트를 모두 구현해주세요.

### 내비게이션

* 반응형 navbar
* 로고 영역
* 메뉴
* dropdown menu
* mega menu
* 모바일 hamburger menu
* sticky navbar
* scroll 시 형태가 변하는 navbar
* breadcrumb
* sidebar navigation
* bottom mobile navigation

### 버튼

* 기본 버튼
* outline 버튼
* gradient 버튼
* glass 버튼
* neon 버튼
* icon 버튼
* floating action button
* loading 버튼
* disabled 버튼
* ripple 또는 유사한 클릭 효과
* hover 시 빛이 지나가는 버튼
* 크기별 버튼
* 원형 버튼
* 버튼 그룹

### 카드

* 기본 카드
* glass card
* gradient card
* profile card
* product card
* pricing card
* statistics card
* notification card
* image overlay card
* expandable card
* tilt hover card
* spotlight hover card
* holographic card
* flip card
* Bento card
* 카드 내부 progress와 badge 표현

### 폼

* text input
* password input
* textarea
* select
* checkbox
* radio button
* toggle switch
* range slider
* search input
* floating label input
* validation 상태
* success, warning, error 상태
* 파일 업로드 영역
* drag and drop 형태의 업로드 UI
* OTP 입력 UI
* 태그 입력 UI
* 날짜 선택기를 연상시키는 UI
* 입력값에 따라 변화하는 progress UI

실제 입력 동작이 필요한 부분은 Vanilla JavaScript로 구현해주세요.

### 정보 표시

* badge
* tag
* chip
* tooltip
* popover
* alert
* toast
* progress bar
* circular progress
* skeleton loading
* spinner
* timeline
* stepper
* accordion
* tabs
* pagination
* avatar
* avatar group
* status indicator
* rating
* empty state
* quote block
* code block
* keyboard key 표현
* metric widget
* countdown UI

### 오버레이

* modal
* confirmation modal
* image modal
* drawer
* offcanvas menu
* tooltip
* popover
* command palette
* notification panel
* context menu

ESC 키, 바깥 영역 클릭, 닫기 버튼 등을 통해 닫을 수 있도록 구현해주세요.

### 데이터 표현

* 반응형 table
* striped table
* hover table
* sortable table UI
* filter UI
* responsive card table
* bar chart
* line chart
* donut chart
* radar 또는 gauge 형태의 시각화
* sparkline
* heatmap 형태의 UI

차트 라이브러리는 사용하지 마세요.

차트는 CSS, inline SVG, Canvas API 중 적절한 방식을 이용해 직접 구현해주세요.

### 콘텐츠 영역

* hero section
* feature section
* statistics section
* gallery
* portfolio section
* testimonial
* pricing section
* FAQ
* newsletter form
* contact section
* footer
* call-to-action
* dashboard
* user profile
* activity feed
* kanban board UI
* calendar UI
* chat UI
* notification center
* settings panel

## 7. 애니메이션과 인터랙션

다음 효과를 적절히 사용해주세요.

* fade in
* fade up
* slide in
* scale in
* stagger animation
* floating animation
* pulse animation
* glow animation
* shimmer animation
* gradient animation
* rotating border
* animated background
* animated blob
* text reveal
* typing effect
* number counter
* parallax 느낌의 효과
* mouse 위치에 반응하는 spotlight
* hover tilt
* magnetic button 느낌의 이동
* card flip
* accordion transition
* modal transition
* dropdown transition
* progress animation
* skeleton shimmer
* scroll reveal
* sticky section transition
* background particle 느낌의 CSS 애니메이션
* SVG path drawing animation
* loading screen
* page transition을 연상시키는 효과

가능한 효과는 CSS만으로 구현하고, 상태 관리나 마우스 좌표가 필요한 경우에만 Vanilla JavaScript를 사용해주세요.

애니메이션은 화려해야 하지만 사용성을 해치지 않도록 해주세요.

`prefers-reduced-motion`을 지원해 사용자가 모션 감소를 설정한 경우 애니메이션을 최소화해주세요.

## 8. CSS 기술 다양성

과제에서 CSS 활용 범위를 잘 보여줄 수 있도록 다음 기술을 가능한 한 많이 자연스럽게 활용해주세요.

* CSS custom properties
* calc()
* clamp()
* min()
* max()
* minmax()
* repeat()
* auto-fit
* auto-fill
* CSS Grid
* Flexbox
* pseudo-class
* pseudo-element
* linear-gradient
* radial-gradient
* conic-gradient
* multiple background
* background-blend-mode
* mix-blend-mode
* backdrop-filter
* filter
* box-shadow
* text-shadow
* inset shadow
* mask
* clip-path
* transform
* transform-style
* perspective
* isolation
* object-fit
* aspect-ratio
* writing-mode
* text-overflow
* line-clamp
* scroll-snap
* sticky positioning
* CSS counters
* custom scrollbar
* keyframes
* transition
* cubic-bezier
* container query
* media query
* logical properties
* accent-color
* appearance
* caret-color
* user-select
* pointer-events
* place-items
* grid-template-areas
* subgrid는 브라우저 호환성을 고려해 선택적으로 활용
* `:has()`는 점진적 향상 방식으로 활용
* `@supports`
* `@layer`
* `@property`는 지원되지 않는 브라우저를 고려해 선택적으로 활용

단순히 기술을 사용했다는 흔적만 만들지 말고, 각 속성이 실제 UI 품질 향상에 기여하도록 구현해주세요.

## 9. 테마 기능

다음 테마 기능을 구현해주세요.

* Light mode
* Dark mode
* 사용자가 선택한 테마를 localStorage에 저장
* 운영체제 테마 자동 감지
* 테마 변경 버튼
* 테마 변경 시 부드러운 전환
* 최소 2개의 accent color 선택 기능
* accent color 선택값도 localStorage에 저장

가능하다면 다음 테마도 추가해주세요.

* Aurora theme
* Monochrome theme
* Cyber theme

테마마다 전체 CSS를 중복 작성하지 말고 CSS 변수만 교체하는 구조로 작성해주세요.

## 10. 접근성과 사용성

화려한 디자인뿐 아니라 다음 접근성 기준도 지켜주세요.

* 충분한 텍스트 대비
* 키보드만으로 주요 기능 조작 가능
* `:focus-visible` 스타일
* semantic HTML 사용
* button과 link 역할 구분
* modal focus 처리
* aria 속성 활용
* form label 연결
* disabled 상태 표현
* hover뿐 아니라 focus 상태 제공
* 모바일 터치 영역 확보
* `prefers-reduced-motion` 지원
* 색상에만 의존하지 않는 상태 표현

## 11. 성능과 유지보수성

다음 원칙을 지켜주세요.

* 지나치게 깊은 selector 금지
* `!important` 사용 최소화
* 중복 코드 최소화
* CSS 변수 적극 활용
* 컴포넌트별 주석 작성
* JavaScript 전역 변수 최소화
* 이벤트 위임 활용
* 불필요한 DOM 생성 최소화
* 애니메이션에는 가능한 한 transform과 opacity 활용
* 모바일에서도 성능이 떨어지지 않도록 효과의 복잡도 조정
* JavaScript가 비활성화되어도 기본 콘텐츠는 확인 가능
* 최신 문법을 사용하되 기본적인 fallback 제공

## 12. 파일 구성

다음과 같이 파일을 분리해주세요.

```text
project/
├── index.html
├── css/
│   ├── reset.css
│   ├── tokens.css
│   ├── layout.css
│   ├── utilities.css
│   ├── components.css
│   ├── animations.css
│   ├── themes.css
│   └── main.css
├── js/
│   ├── theme.js
│   ├── components.js
│   ├── interactions.js
│   └── main.js
└── README.md
```

각 파일이 어떤 역할을 담당하는지 README에 설명해주세요.

HTML 파일에서 외부 CDN을 절대 연결하지 마세요.

## 13. 데모 페이지 요구 사항

`index.html`은 단순히 컴포넌트를 나열하는 문서가 아니라, 하나의 완성도 높은 미래형 디지털 서비스 소개 페이지이자 대시보드처럼 구성해주세요.

페이지에는 다음 구역이 포함되어야 합니다.

1. 애니메이션 로딩 화면
2. 반응형 navbar
3. 미래지향적인 hero section
4. animated headline
5. 통계 counter
6. Bento grid feature section
7. 인터랙티브 카드 모음
8. 대시보드 미리보기
9. 직접 구현한 차트
10. 다양한 form 컴포넌트
11. Kanban 또는 calendar UI
12. pricing card
13. timeline
14. testimonial
15. FAQ accordion
16. gallery
17. modal, toast, drawer 시연 버튼
18. 테마 및 accent color 설정 패널
19. footer
20. 모바일 bottom navigation

페이지를 스크롤할수록 새로운 시각 효과와 레이아웃이 등장하도록 구성해주세요.

모든 컴포넌트는 실제로 상호작용할 수 있어야 합니다.

예를 들면 다음 기능이 실제로 동작해야 합니다.

* 메뉴 열기와 닫기
* modal 열기와 닫기
* toast 생성
* accordion 펼치기
* tab 전환
* drawer 열기
* 테마 변경
* accent color 변경
* dropdown 작동
* tooltip 표시
* progress 변화
* 숫자 카운터
* sortable table
* form validation
* password 표시 전환
* responsive sidebar
* command palette
* scroll reveal

## 14. 창의적인 추가 기능

일반적인 CSS 라이브러리에서 보기 어려운 독창적인 기능도 추가해주세요.

예시:

* 마우스 위치에 반응하는 카드 조명
* 화면 배경을 따라 이동하는 aurora 효과
* 클릭 위치에서 발생하는 ripple
* 버튼 주변을 움직이는 빛
* 카드 모서리를 따라 회전하는 gradient border
* 커서에 반응하는 hero 배경
* CSS만으로 만든 작은 행성 또는 궤도 애니메이션
* 스크롤 위치에 따라 채워지는 progress indicator
* 현재 section을 보여주는 navigation indicator
* hover 시 여러 레이어가 분리되는 카드
* 마우스를 따라 약하게 움직이는 depth effect
* 텍스트가 gradient mask로 나타나는 효과
* 이미지 없이 CSS gradient로 만든 추상 예술 배경
* 사용자가 선택한 테마에 따라 배경 패턴이 달라지는 기능

단, 모든 기능을 한 영역에 몰아넣지 말고 페이지 전체에 적절하게 분산해주세요.

## 15. 결과물 출력 방식

코드를 생략하거나 일부만 예시로 보여주지 마세요.

다음 순서로 완전한 코드를 제공해주세요.

1. 전체 프로젝트 구조
2. 디자인 콘셉트 설명
3. 각 파일의 전체 코드
4. 실행 방법
5. 구현된 컴포넌트 목록
6. 사용된 CSS 기술 목록
7. 라이브러리 사용 방법
8. 새로운 페이지에서 컴포넌트를 재사용하는 예시
9. 브라우저 호환성 설명
10. 향후 확장할 수 있는 기능

코드가 길어질 경우 파일 단위로 나누어 출력하되, 각 파일의 코드를 절대 생략하지 마세요.

`나머지는 동일`, `생략`, `필요에 따라 추가`, `예시 코드` 같은 표현을 사용하지 마세요.

모든 코드가 복사 후 바로 실행될 수 있어야 합니다.

## 16. 코드 검증

최종 코드를 제공하기 전에 다음 항목을 스스로 점검해주세요.

* 외부 라이브러리를 사용하지 않았는가?
* 외부 CDN이 포함되지 않았는가?
* 존재하지 않는 파일을 참조하지 않는가?
* 모든 HTML 태그가 정상적으로 닫혔는가?
* CSS selector와 HTML class가 서로 일치하는가?
* JavaScript에서 조회하는 DOM 요소가 실제 HTML에 존재하는가?
* 모바일 메뉴가 정상적으로 작동하는가?
* modal과 drawer가 닫히는가?
* 테마 변경이 정상적으로 작동하는가?
* localStorage 오류 가능성을 처리했는가?
* 키보드 접근성을 고려했는가?
* 작은 화면에서 가로 스크롤이 발생하지 않는가?
* 애니메이션이 과도한 CPU 사용을 유발하지 않는가?
* 코드에 문법 오류가 없는가?

오류 가능성이 있는 코드를 제공하지 말고, 각 기능 간 충돌도 확인해주세요.

## 17. 가장 중요한 우선순위

우선순위는 다음과 같습니다.

1. 외부 라이브러리 완전 미사용
2. 복사 후 즉시 실행 가능한 완전한 코드
3. CSS 기술의 다양성
4. 시각적인 완성도와 화려함
5. 반응형 디자인
6. 실제로 동작하는 인터랙션
7. 재사용 가능한 CSS 라이브러리 구조
8. 접근성
9. 유지보수성
10. 성능

단순한 템플릿 수준으로 끝내지 말고, CSS 과제 평가자가 보았을 때 “직접 만든 디자인 시스템과 인터랙션 라이브러리를 활용해 하나의 완성된 웹 애플리케이션을 제작했다”고 느낄 수 있는 수준으로 만들어주세요.
