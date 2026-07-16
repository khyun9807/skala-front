# folio 콘텐츠 적용 계획서 — portfolio-source → folio

> **목표**: `advanced/portfolio-source/`에 모아둔 **진짜 내 정보**를, 이미 완성·검증된 awwwards 사이트 `folio/`에 **이쁘고 적절하게** 적용한다.
> 작성일 2026-07-16. 이 문서는 *계획*이며, 실행은 별도(맨 아래 '실행 프롬프트' 사용).
>
> - **콘텐츠 원본** = [`portfolio-source/`](portfolio-source/README.md) (이 문서가 소비할 재료)
> - **적용 대상** = `folio/` (8페이지 + 자체 엔진, 현재 **데모/예시 콘텐츠** 상태)
> - **연출 기준** = [`cipher-benchmark-report.md`](cipher-benchmark-report.md) · [`michael-gatt-folio-조사보고서.md`](michael-gatt-folio-조사보고서.md)

---

## 0. 대원칙 (이게 "이쁘고 적절하게"의 정의)

1. **큐레이션 > 덤프.** 재료가 많다고 다 넣지 않는다. payper 슬라이드 35장 중 3~5장만, 영상 6개는 대부분 버린다. folio는 포트폴리오지 아카이브가 아니다.
2. **시네마틱 톤을 깨지 않는다.** Cipher/Michael Gatt 톤 = 절제된 타이포 + 여백 + 큰 숫자 + 스크롤 연출. 내용이 늘어난다고 카드/표를 마구 늘리지 말 것.
3. **수치가 주인공.** 이 포트폴리오의 무기는 `2,000ms→60ms` `910→157ms` `1.3s→217ms` `3.5만→5.8만건/분` `이중이체 0건` `P99 7s→87ms`. 큰 타이포로 한 화면에 하나씩.
4. **정직하게.** 팀 프로젝트는 팀이라고, 내가 한 것만 내 성과로. (payper 트러블슈팅은 **TS3·TS4만 내 것**, TS1/TS2/TS5는 팀원 — `payper/troubleshooting-extracted.md` 상단 배너 참고.)
5. **출처 표기.** 여행 사진 3장은 **CC BY-SA 4.0** → 저작자·라이선스 표기 필수(안 하면 라이선스 위반).
6. **초안은 초안으로.** 아직 사용자 확인 안 된 문구(프로필 한줄소개/자기소개/인생목표, 여행 후기·예산, 휴일 루틴)는 적용 전 한 번 확인받는다.

---

## 1. 현재 상태

**folio/ (적용 대상 — 이미 완성됨, 건드릴 건 "내용"뿐)**
```
folio/{index,profile,class,trip,holiday,blog,signup,signup-result}.html
folio/css/{tokens,engine,pages,fonts}.css   folio/engine/*.js (11개)   folio/fonts/*.woff2
script/folio/*.js   ← 글루(HERO_ITEMS 등 콘텐츠가 여기 일부 있음)
```
- 데이터는 **`tessera-js/data/*.json`** 시드를 ES 모듈로 읽어 folio 뷰로 렌더.
- 지금 내용은 전부 **예시**(리장/세부/홋카이도 여행, 가짜 강의, 데모 블로그 글).

**portfolio-source/ (재료 — 347MB)**
| 재료 | 위치 | folio에서 쓸 곳 |
|---|---|---|
| 경력 마스터 | `CAREER-SUMMARY.md` | 전 페이지의 사실 근거(기간·팀·역할·성과) |
| 프로젝트 4종 | `bridge-bank/` `payper-community/` `payper/` `team-polaris-remind-lamia/` | profile 프로젝트 + 히어로 타일 |
| 개선일지 9편 | `velog-backend-improvements/extracted-content.md` + `images/<NN>/` | blog 글 + 프로젝트 성과 상세 |
| 페이지 개인정보 | `profile/{profile,class,trip,holiday}-page-content.md` | profile/class/trip/holiday 페이지 |
| 이미지 | `profile/images/avatar.jpeg`, `profile/images/trip/*.jpg`(CC), `payper/images/slides/*`(35), `team-polaris-remind-lamia/images/*`(14) | 커버·상세 |
| 영상 | `team-polaris-remind-lamia/videos/*.mp4` (303MB, 6개) | **대부분 미사용**(3절 참고) |

---

## 2. 콘텐츠 매핑 (핵심)

### 2-1. `tessera-js/data/profile.json`
스키마: `name, title, tagline, bio, avatar, location, contact, skills, traits[{label,score,description}], projects[{id,title,description,stack,url,startDate,endDate}], timeline[{date,title,description}]`

| 필드 | 채울 값 | 출처 |
|---|---|---|
| name / title | 권경현 / 백엔드 개발자 | profile-page-content |
| tagline / bio | ✍️ **초안 상태 — 확인 후 적용** | profile-page-content |
| avatar | `profile/images/avatar.jpeg` (복사 후 folio 경로) | 사용자 업로드 |
| contact | khyun980729@gmail.com · github/velog `khyun9807` | 기존 확인 |
| skills | Java · Spring · JPA · MyBatis · Redis · Kafka · MySQL · AWS | CAREER-SUMMARY |
| traits | 책임감 9 · 취업의지 10 · 외향형 7 (+설명) | profile-page-content |
| **projects** | Bridge Bank / Payper Community / Payper / Remind Lamia | 각 `profile.md`의 `title·one_liner·tech·period·source_links` |
| timeline | 2023.09 KVS → 2024.03 xv6 → 2025.07 Payper → 2025.07~2026.01 Community → 2026.02 Bridge Bank → 2026.07 SKALA | CAREER-SUMMARY(부록 포함) |

### 2-2. `tessera-js/data/travel-posts.json` (3건)
스키마: `id,title,startDate,endDate,cities,cover,status,baseCurrency,budgetLimit,estimatedBudget,durationDays,activities,bestSeasons,tags,accommodation,transportInfo,mapLink,notes,checklist,expenses`
- **오사카**(다녀옴) / **라스베가스**(다녀옴) / **아르헨티나**(버킷리스트 — 고기 파티)
- `cover` → `profile/images/trip/{osaka,lasvegas,argentina}.jpg`
- `expenses`/`checklist` → `trip-page-content.md`의 예산표·체크리스트 그대로
- ⚠️ `expenses`에 **`amountBase`** 넣기(없으면 환산 버그 — CLAUDE.md TesseraJS 함정 4번)
- `status`로 다녀옴 vs 버킷리스트 구분(아르헨티나 배지)

### 2-3. `tessera-js/data/schedules.json`
- SKALA **5주 커리큘럼**(2026-07-14~08-14)을 일정으로. `class-page-content.md` 표가 소스.
- 전부 넣지 말고 **대표 일정 + 오늘/다가오는 것 위주**(현재 1주차). `kind`로 수업/개인 구분, `color`는 계열(FE/데이터AI/백엔드/특강).

### 2-4. `tessera-js/data/blog-posts.json`
- **velog 개선일지 = 최고의 블로그 재료.** `extracted-content.md`의 항목을 글로.
- 추천 5편: 쿼리 최적화(2,000→60ms) · 캐시 스탬피드(1.3s→217ms) · Circuit Breaker · MyBatis bulk(3.5만→5.8만) · Union-Find 데드락.
- `category`=프로젝트명, `tags`=기술, `author`=권경현, `content`=상황/해결/결과 요약(원문 링크 포함).

### 2-5. `script/folio/index.js` — `HERO_ITEMS` (히어로 링 13타일)
현재 예시(홋카이도/세부/리장…) → 실제로 교체:
| cat | 타일 | href | 커버 |
|---|---|---|---|
| PORTFOLIO | Bridge Bank / Payper Community / Payper / Remind Lamia | profile.html(또는 상세) | Remind Lamia는 실사진, 백엔드 3종은 다이어그램/생성커버 |
| PORTFOLIO | 나를 소개합니다 | profile.html | avatar |
| ACTIVITY | 오사카 / 라스베가스 / 아르헨티나 | trip.html | CC 여행사진 3장 |
| ACTIVITY | SKALA 커리큘럼 / 느긋한 휴일 / 회원 온보딩 | class·holiday·signup | 생성커버 |
| BLOG | 개선일지 3편 | blog.html | 개선일지 이미지 |

### 2-6. 페이지 HTML 에디토리얼(정적 텍스트)
- `folio/profile.html` — 음식(수육·피자·갈비), 올해 할 일(금융권 취업·여행·제모), 성향 3, **좌우명 “욕망은 정의다 — 이시가미 센쿠”**
- `folio/class.html` — SKALA 커리큘럼(표 rowspan/colspan 시맨틱 유지)
- `folio/trip.html` — 3여행지 캡션·후기 + **CC 크레딧** + audio/picture/img/video 시맨틱 유지
- `folio/holiday.html` — 아침/오후/저녁 루틴 + 규칙 3 + 좌우명

---

## 3. 이미지·미디어 전략

- **folio 전용 경량 사본**을 만든다: `folio/media/`(신규)에 **실제 쓰는 것만** 복사. portfolio-source 원본은 아카이브로 남긴다.
- 무거운 원본 주의: `main.png`(4.7MB), `BusMan.png`(5.9MB), 슬라이드 PNG(장당 0.3~1.1MB). → 리사이즈(폭 1600 이하) 권장, `loading="lazy"`.
- **payper 슬라이드 35장 → 3~5장만**: `01-title`, `16-tech-stack-architecture`, `29-key-results`, (선택) `08` UI, `24` TS4 결과. **TS1/TS2/TS5 슬라이드는 내 성과가 아니므로 성과 근거로 쓰지 말 것.**
- **Remind Lamia**: `main.png`(히어로) + 캐릭터 2~3 + 스테이지 2~3 정도만.
- **게임 영상 303MB → 웹에 그대로 올리지 않는다.** 선택지: (a) 전부 제외(권장), (b) 1개만 짧게 잘라 사용, (c) 포스터 이미지만. *이 환경엔 ffmpeg 없음* → 자르기/포스터 필요하면 도구 먼저 확보.
- **CC 크레딧(필수)**: 여행 사진 3장은 trip 페이지에 저작자+CC BY-SA 4.0 링크 표기. 문구는 `trip-page-content.md` '사진 출처' 표 그대로.

---

## 4. 반드시 지킬 제약 (folio 기존 설계 — 깨면 회귀)

1. **외부 의존성 0** (과제 채점 조건). 폰트는 `folio/fonts/*.woff2` 자체호스팅. **CDN/외부 URL 추가 금지** — 새 이미지도 반드시 로컬 파일로.
2. **aurora-ui는 `@layer`라서 folio의 unlayered CSS가 이긴다.** 이 구조 덕에 시네마틱 룩이 유지됨. aurora `interactions.js`/`spatial.js`는 **절대 로드/init 금지**(folio 엔진과 충돌).
3. **페이지별 시맨틱 유지**: profile `ul/ol/dl`, class `<table>` rowspan/colspan, trip `audio/picture/img/video`, signup 네이티브 GET → `signup-result`가 `location.search` 파싱.
4. **커서**: `.folio-cursor`는 고정 `background: var(--color-light)` 유지(`--fg`로 바꾸면 light 섹션에서 사라짐).
5. 히어로 링 타일 `pointer-events`/`.is-faded` 규칙, 패널 오빗 회전 규칙 유지.
6. TesseraJS 소스는 건드리지 않는다 — **데이터(`data/*.json`)와 folio 글루만** 수정.

---

## 5. 작업 순서 (단계별, 각 단계 후 검증)

- **P0. 확인받기** — 초안 문구(프로필 한줄소개/자기소개/인생목표, 여행 후기·예산, 휴일 루틴) + 영상 처리 방침 + 여행 연·월.
- **P1. 데이터 교체** — `tessera-js/data/{profile,travel-posts,schedules,blog-posts}.json` 실제 값으로. (스키마 유지, `amountBase` 주의.)
- **P2. 이미지 배치** — `folio/media/`에 선별 사본 + 경로 정리.
- **P3. 히어로 링** — `script/folio/index.js` `HERO_ITEMS` 13타일 실제화.
- **P4. 페이지 에디토리얼** — profile → class → trip → holiday 순으로 HTML 텍스트 교체(시맨틱 유지 + CC 크레딧).
- **P5. 검증** — 정적 서버(`.claude/launch.json` static-preview, 4173)로 8페이지 전부: 콘솔 0 에러, 링 타일 클릭, 스크롤 테마 반전, 예산 차트, 일정 카운트다운, signup GET 흐름, 모바일 375px.
  - ⚠️ 자동화 브라우저는 `document.hidden===true`라 rAF/트랜지션이 멈춤 → `core.js`의 **`debugTick(steps)`** 로 프레임 강제 진행 후 스크린샷(메모리 기법).

---

## 6. 리스크 / 주의

| 리스크 | 대응 |
|---|---|
| 팀 성과를 내 성과로 오표기 | payper TS3·TS4만 내 것. 프로젝트별 역할(팀장/팀원) 명시 |
| CC 라이선스 위반 | trip 페이지에 저작자·라이선스 반드시 표기 |
| 무거운 자산으로 성능 저하 | 선별 + 리사이즈 + lazy. 영상 303MB 웹 반입 금지 |
| 초안을 사실처럼 게시 | P0에서 확인받고 진행 |
| 콘텐츠 과다로 톤 붕괴 | 0절 원칙 1·2 재확인. 섹션 늘리기 전에 덜어내기 |
| 상대경로 실수 | Bash는 **절대경로**로 (이전에 `cd` 지속으로 중첩폴더 생성 사고 있었음) |

---

## 7. 실행 프롬프트 (새 세션에 복붙)

```
advanced/portfolio-source/ 의 실제 내 정보를 folio/ 사이트에 적용해줘.
계획서: advanced/folio-content-application-plan.md 를 먼저 읽고 그대로 따라라.

핵심:
- 먼저 계획서 5절 P0의 "확인받을 것"을 나에게 물어보고 시작해.
- 콘텐츠는 advanced/portfolio-source/ (마스터: CAREER-SUMMARY.md), 연출은 기존 folio 톤 유지.
- 큐레이션 우선: 슬라이드 35장/영상 303MB 다 넣지 말고 계획서 3절대로 선별.
- 수치(2,000ms→60ms 등)를 큰 타이포로 주인공 삼기.
- 정직성: payper는 TS3·TS4만 내 성과. 팀 프로젝트는 역할 명시.
- 여행 사진 3장은 CC BY-SA 4.0 → 크레딧 표기 필수.
- 제약(계획서 4절): 외부 의존성 0, aurora interactions/spatial 로드 금지, 페이지별 시맨틱 유지, TesseraJS 소스 불변(데이터만 수정).
- 단계마다 정적 서버(4173)로 검증. 자동화 브라우저는 document.hidden 때문에 debugTick 사용.
```

---

## 8. 결정 완료 ✅ (2026-07-16 사용자 확정 — 이대로 실행)

1. **초안 그대로 진행.** 프로필 한줄소개/자기소개/인생목표, 여행 후기·예산, 휴일 루틴 = `portfolio-source/profile/*-page-content.md`에 쓴 내용 확정.
2. **게임 영상 = 몇 개 + 포스터 사용.** 가벼운 3개 선별: `OP_1`(31MB, 오프닝) · `drawpuzzle_1`(30MB, 그리기퍼즐) · `bullethell_3`(53MB, 탄막) ≈ 114MB. 나머지 3개(jumpmap/pannelpuzzle/runandgun, 189MB) 제외. **필수**: `poster` 이미지 + `preload="none"` + lazy. (ffmpeg 없음 → macOS `qlmanage -t`로 썸네일 추출.)
3. **여행 시기 확정**: 오사카 **2024년 7월** · 라스베가스 **2016년 여름** · 아르헨티나 = 미래(버킷리스트).
4. **프로젝트는 profile + blog 양쪽.** profile엔 요약(카드/모달), **blog 영역에 프로젝트별 상세 심층 글**. → `blog-posts.json`이 심층 서술의 주 무대(프로젝트 4종 + 개선일지). blog가 이 사이트의 "읽을거리" 축.
5. **아바타 = 강아지 사진 그대로, 대비를 의도로 연출.** 절제된 시네마틱 타이포/여백 속에 유머러스한 초상 하나 → 의도된 위트로 읽히게 배치(캡션·여백으로 톤을 잡아줄 것. 사고처럼 보이면 실패).
