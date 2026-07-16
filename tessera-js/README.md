# TesseraJS

외부 JavaScript 라이브러리·프레임워크·npm 패키지·CDN 스크립트를 전혀 사용하지 않고, **HTML5 · CSS3 · Vanilla JavaScript(ES Module)** 만으로 만든 재사용 가능한 프론트엔드 라이브러리와, 그 라이브러리를 실제로 사용하는 11개 데모 페이지입니다.

> **`aurora-ui/`와의 관계**: 이 저장소에는 순수 CSS 디자인 시스템인 `aurora-ui/`가 형제 폴더로 이미 존재합니다. TesseraJS는 그 CSS와는 별개로, **JavaScript 동작**(상태 관리, 통신, 저장소, 파일 처리, 이벤트, Worker, Canvas 차트 등)에만 집중한 라이브러리입니다. 지금은 TesseraJS가 자체 최소 CSS(`css/`)로 독립적으로 동작하며, `aurora-ui`와의 결합은 다음 단계 작업입니다.

---

## 1. 프로젝트 목적

자기소개/포트폴리오, 개인 블로그, 회원가입·로그인, 수업/여행/개인 일정, 여행 후기, 방문자 통계, 댓글, 외부 API 연동, 파일 입출력, 사용자 설정 저장 — 이 12개 주제를 **하나하나 별도 스크립트로 짜지 않고**, 공통 기능을 라이브러리 모듈로 뽑아 여러 페이지에서 재사용하는 것이 목적입니다. 평가 포인트는 "페이지가 몇 개 동작하느냐"가 아니라 "JavaScript 문법·브라우저 API·비동기 처리·저장소·파일 처리·이벤트·Observer·Worker·Canvas·네트워크 장애 대응을 얼마나 폭넓고 실제로 동작하게 엮었느냐"입니다.

## 2. 라이브러리 이름

**TesseraJS** — 모자이크를 이루는 낱장 타일(tessera)처럼, 자기소개·블로그·일정·여행·방문자라는 서로 다른 조각(도메인)을 하나의 라이브러리로 짜맞춘다는 의미입니다.

- 네임스페이스: `Tessera` (`window.Tessera`로도 노출되지만, 기본 사용법은 ES Module import입니다)
- 전역 오염 최소화: 브라우저 전역에는 `window.Tessera` **하나만** 등록됩니다. 나머지는 전부 그 객체 아래(`Tessera.http`, `Tessera.blog` …) 있거나, ES Module import로만 접근합니다.

```js
// 권장 방식: ES Module
import { http, storage, blog, travel } from "./js/library/index.js";

// 대안: 단일 전역 객체 (모듈을 안 쓰는 페이지/콘솔 실험용)
window.Tessera.http.get("/api/posts");
```

## 3. 폴더 구조

```text
tessera-js/
├── index.html                 메인 데모 페이지
├── pages/                      나머지 10개 데모 페이지
│   ├── profile.html  blog.html  blog-detail.html
│   ├── signup.html   login.html
│   ├── schedule.html travel.html travel-detail.html
│   ├── visitors.html playground.html
├── css/  reset.css  common.css  components.css  pages.css
├── data/ profile.json  blog-posts.json  schedules.json  travel-posts.json  mock-users.json
├── media/ (여행/프로필용 SVG 이미지 — 이 프로젝트 자체 폴더에 자체 보관)
├── js/
│   ├── app.js                 모든 페이지 공통 부트스트랩(네비/테마/토스트/오프라인 배너/단축키/세션워처/방문자추적)
│   ├── config/  constants.js  api-config.example.js
│   ├── core/    namespace.js  event-bus.js  state-store.js  router.js  logger.js  errors.js  lifecycle.js
│   ├── network/ http-client.js  xhr-client.js  api-client.js  request-cache.js
│   │            retry-policy.js  rate-limiter.js  request-queue.js  mock-server.js
│   ├── storage/ local-storage.js  session-storage.js  indexed-db.js  cookie-manager.js  cache-manager.js
│   ├── dom/     selector.js  renderer.js  template.js  animation.js  observers.js  accessibility.js  canvas-charts.js
│   ├── events/  mouse.js  keyboard.js  scroll.js  drag-drop.js  touch.js  shortcuts.js
│   ├── utils/   date.js  number.js  string.js  array.js  object.js  validation.js
│   │            debounce.js  throttle.js  timer.js  formatter.js  security.js
│   ├── files/   file-reader.js  file-exporter.js  csv.js  json.js  image.js  backup.js
│   ├── workers/ search-worker.js  analytics-worker.js  worker-client.js
│   ├── features/ profile.js  auth.js  blog.js  schedule.js  travel.js  visitor.js
│   │              comments.js  favorites.js  notifications.js  search.js
│   │              schedule-conflict.js  travel-scoring.js  visitor-analytics.js  search-scoring.js  (순수 함수, Worker와 공유)
│   ├── services/  weather-service.js  exchange-service.js  transport-service.js
│   │              flight-service.js  ferry-service.js  blog-feed-service.js  summarizer-service.js
│   │              provider-chain.js  (Remote→Cache→Local→Mock 공통 폴백 체인)
│   ├── testing/  test-framework.js  test-suites.js
│   ├── pages/    home.js  profile.js  signup.js  login.js  blog.js  blog-detail.js
│   │              schedule.js  travel.js  travel-detail.js  visitors.js  playground.js
│   └── library/ index.js   (ESM 배럴 + window.Tessera 노출)
└── README.md
```

`js/services/`와 `js/pages/`, 그리고 `features/` 안의 `*-conflict.js`/`*-scoring.js`/`*-analytics.js` 순수 함수 파일들은 과제 예시 트리에는 없지만, "Adapter/Service 모듈 분리"·"기능별 책임 분리" 원칙을 지키기 위해 추가한 구조입니다. 특히 `schedule-conflict.js`, `travel-scoring.js`, `visitor-analytics.js`, `search-scoring.js`는 DOM에 전혀 의존하지 않는 순수 함수라서 **메인 스레드와 Web Worker 양쪽에서 동일한 코드를 그대로 import**해 씁니다(Worker 미지원 환경의 폴백이 실제 로직과 100% 동일하게 동작함을 보장).

## 4. 실행 방법

```bash
cd tessera-js
python -m http.server 5500
# 브라우저에서 http://localhost:5500 접속
```

IDE의 Live Server(VS Code 확장 등) 같은 기본 로컬 서버 기능을 사용해도 됩니다. **Node.js 패키지 설치는 전혀 필요하지 않습니다.**

## 5. 로컬 서버가 필요한 이유

- ES Module(`<script type="module">`)은 `file://` 프로토콜에서 CORS 정책에 막혀 다른 모듈을 import하지 못합니다.
- `fetch()`로 `data/*.json`을 읽어오는 것도 `file://`에서는 브라우저에 따라 차단됩니다.
- Web Worker(`new Worker(url, { type: "module" })`)도 `file://`에서 생성이 막히는 브라우저가 많습니다.

즉 이 프로젝트는 `index.html`을 더블클릭해서 열면 안 되고, 반드시 `http://localhost:...`로 접속해야 합니다.

## 6. 모듈별 설명

| 폴더 | 역할 |
|---|---|
| `core/` | 이벤트 버스, 상태 관리, 라우터, 로거, 에러 클래스, lifecycle(정리) — 다른 모든 모듈이 기대는 기반 |
| `network/` | Fetch 기반 HTTP 클라이언트 + 캐시/재시도/큐/취소, XHR 비교 모듈, Mock 서버 |
| `storage/` | localStorage/sessionStorage/IndexedDB/Cookie/2단 캐시 래퍼 |
| `dom/` | 요소 생성·이벤트 위임·템플릿·애니메이션·Observer·접근성·Canvas 차트 |
| `events/` | 마우스/키보드/스크롤/드래그/터치·포인터/단축키 헬퍼(전부 이벤트 위임 기반) |
| `utils/` | 날짜, 숫자, 문자열, 배열, 객체, 유효성 검사, debounce/throttle, 타이머, 포매터, 보안 |
| `files/` | File/Blob API 래퍼(읽기·내보내기·CSV·JSON·이미지 처리·백업) |
| `workers/` | 검색/집계 전용 Web Worker + 요청-응답 매칭 클라이언트 |
| `features/` | 도메인 로직(프로필/인증/블로그/일정/여행/방문자/댓글/즐겨찾기/알림/검색) — DOM에 의존하지 않음 |
| `services/` | 외부 API Adapter(날씨/환율/교통/항공/페리/블로그피드/요약) + Provider 폴백 체인 |
| `js/pages/` | 각 HTML 페이지의 컨트롤러(DOM ↔ features/services 연결). **의존성 방향은 항상 pages → features/services → core/network/storage/utils**이며 반대 방향 참조는 없습니다(순환 참조 방지). |

## 7. 주요 API 사용법

```js
import { http, storage, events, blog, travel } from "./js/library/index.js";
```

또는 필요한 모듈만 직접 import(트리쉐이킹에 더 유리):

```js
import { createHttpClient } from "./js/network/http-client.js";
import { localStore } from "./js/storage/local-storage.js";
```

## 8. 이벤트 버스 사용법

```js
import { eventBus } from "./js/core/event-bus.js";

const off = eventBus.on("auth:login", (user) => console.log("로그인:", user));
eventBus.once("travel:loaded", () => console.log("여행 데이터 로드 완료"));
eventBus.on("blog:*", (payload, eventName) => console.log("블로그 관련 이벤트:", eventName)); // wildcard
eventBus.emit("auth:login", { username: "demo" });
off(); // 구독 해제
```

지원 기능: `on`/`once`/`off`/`emit`, 네임스페이스·와일드카드(`"blog:*"`) 이벤트, 리스너 우선순위(`{ priority }`), 리스너별 예외 격리(한 리스너가 던진 에러가 다른 리스너를 막지 않음), 이벤트 히스토리(`getHistory()`), 디버그 모드(`setDebug(true)`).

## 9. 상태 관리 사용법

```js
import { createStore } from "./js/core/state-store.js";

const store = createStore({ user: null, theme: "dark", favorites: [] });

store.subscribe(
  (state) => state.favorites,
  (favorites) => renderFavorites(favorites)
);

store.setState({ theme: "light" });   // immutable update
store.batch(() => {                    // 여러 변경을 하나의 알림으로
  store.setState({ user: { id: 1 } });
  store.setState((s) => ({ favorites: [...s.favorites, "a"] }));
});
store.undo();
store.redo();
```

`persistKey`/`storageAdapter` 옵션을 주면 localStorage와 자동 연동됩니다(블로그 초안 편집기 `js/pages/blog-detail.js`의 `createDraftSession`이 실제 사용 예).

## 10. HTTP Client 사용법

```js
import { createHttpClient } from "./js/network/http-client.js";

const client = createHttpClient({ baseURL: "https://example.com/api", timeout: 5000, retry: 3 });

const { data } = await client.get("/posts", {
  query: { page: 1, size: 10 },
  cache: { enabled: true, ttl: 60000, staleWhileRevalidate: 30000 },
});

const controller = new AbortController();
client.get("/slow", { signal: controller.signal });
controller.abort(); // 요청 취소
```

지원 기능: GET/POST/PUT/PATCH/DELETE, JSON/FormData 요청, Blob/text 응답, query 빌더, 공통 header/baseURL, request/response interceptor, 인증 토큰 자동 첨부(`setAuthTokenProvider`), 상태코드별 커스텀 에러(`NetworkError`/`TimeoutError`/`ApiError`), timeout, 취소(AbortController), exponential backoff + random jitter 재시도, offline 감지 후 즉시 캐시 폴백, 로딩 이벤트(`http:loading-start/end`), 동일 GET 요청 병합(dedup), 응답 캐시(TTL) + stale-while-revalidate, 요청 로그(민감정보 마스킹), 최대 동시 요청 수 제한(세마포어), 요청 우선순위 큐.

### XMLHttpRequest 비교(`js/network/xhr-client.js`)

| 항목 | Fetch(`http-client.js`) | XHR(`xhr-client.js`) |
|---|---|---|
| Promise 지원 | 네이티브 | 직접 Promise로 감쌈 |
| 진행률 확인 | 응답 스트림 reader 필요 | `xhr.upload.onprogress` 그대로 사용 |
| 요청 취소 | `AbortController` | `xhr.abort()` |
| 코드 가독성 | 짧고 선언적 | 콜백 등록이 많아 장황함 |
| 오류 처리 | `response.ok` 직접 검사 필요 | `onerror`/`onload` 분리 |
| 구형 브라우저 | 비교적 최신 브라우저 필요 | IE까지 포함해 폭넓게 지원 |

라이브러리의 **기본 통신 방식은 Fetch(`http-client.js`)** 이고, XHR 모듈은 비교 학습 목적의 제한적 용도로만 존재합니다.

## 11. Storage 사용법

```js
import { localStore } from "./js/storage/local-storage.js";
import { sessionStore } from "./js/storage/session-storage.js";
import { indexedDb } from "./js/storage/indexed-db.js";

localStore.set("theme", "dark", { ttl: 7 * 24 * 60 * 60 * 1000 }); // 7일 후 만료
localStore.get("theme", "system"); // fallback 포함

sessionStore.set("signup-draft", { name: "홍길동" });

await indexedDb.put("blogPosts", { id: "p1", title: "제목" });
const posts = await indexedDb.getAll("blogPosts");
```

- **localStorage**: 테마/accent, 최근 본 글, 북마크, 여행 설정, 로그인 유지, 마지막 방문일, 간단 캐시. namespace(`tessera:v1:`) + TTL + 버전 + migration + 손상 데이터 자동 복구 + quota 예외를 `StorageError`로 래핑.
- **sessionStorage**: 현재 세션, 회원가입 임시 입력, 현재 필터/스크롤 위치, 일회성 메시지, 로그인 리다이렉트 경로.
- **IndexedDB**: 블로그 글, 댓글, 여행, 일정, 방문자 이벤트, 파일 백업 정보. Promise 래퍼 + 스키마 버전(`DB_VERSION`) + 트랜잭션 rollback(`onabort`) 처리 + index/cursor/bulk insert.
- **Cookie**(`cookie-manager.js`): 학습용 최소 기능. `SameSite`/`Secure`를 설정할 수 있지만, **`HttpOnly`는 JavaScript로 절대 설정할 수 없습니다**(서버 응답 헤더에서만 가능) — 그래서 이 쿠키에는 절대 민감 정보를 담지 않습니다.

## 12. 파일 처리 사용법

```js
import { readAsJSON, validateFile } from "./js/files/file-reader.js";
import { downloadCSV, downloadJSON } from "./js/files/file-exporter.js";
import { resizeImage, createThumbnail, canvasToBlob } from "./js/files/image.js";

validateFile(file, { accept: [".json"], maxSize: 2 * 1024 * 1024 });
const data = await readAsJSON(file);

downloadCSV(rows, { prefix: "schedules" }); // UTF-8 BOM 포함, 날짜 기반 파일명
downloadJSON(data, "backup");

const img = await loadImageFromFile(file);
const thumbnail = createThumbnail(img, 96); // Canvas 기반, 외부 라이브러리 없음
```

이미지 미리보기에 쓴 Object URL은 사용 후 `URL.revokeObjectURL`로 반드시 해제합니다(`files/file-reader.js`의 `revokeObjectURL`, `files/image.js`의 로드 완료 즉시 해제 로직).

## 13. 일정 기능 사용법

```js
import * as schedule from "./js/features/schedule.js";

const item = await schedule.createSchedule({
  title: "알고리즘 스터디", kind: "class", startAt: "...", endAt: "...",
  recurrence: "specific-weekday", recurrenceWeekdays: [2, 4], notify: true,
});

const occurrences = schedule.expandAllOccurrences(allSchedules, rangeStart, rangeEnd); // 반복 일정 펼치기
const conflicts = schedule.findConflicts(occurrences); // 겹치는 일정 쌍
schedule.exportSchedulesICS(allSchedules); // 간단 ICS 내보내기
```

반복 유형 5종(매일/매주/평일/매월/특정 요일)을 지원하며, `pages/schedule.html`에서 월간(드래그로 날짜 이동)/시간표/일정목록(오늘·다음·지난, 카운트다운) 3가지 보기로 확인할 수 있습니다.

## 14. 여행 기능 사용법

```js
import * as travel from "./js/features/travel.js";
import { convertExpensesToBase } from "./js/services/exchange-service.js";

const trip = await travel.createTravel({ title: "홋카이도", startDate, endDate, baseCurrency: "KRW" });
await travel.addExpense(trip.id, { category: "food", amount: 3000, currency: "JPY" });
const converted = await convertExpensesToBase(trip.expenses, "KRW"); // 실시간 환율로 기준통화 환산
await travel.updateTravel(trip.id, { expenses: converted });

const summary = travel.computeBudgetSummary(trip, trip.budgetLimit); // 카테고리별/전체 합계 + 예산초과 여부
const ranked = travel.recommendTravels(candidates, { budget: 1000000, favoriteTags: ["nature"] }); // 점수 기반 추천
```

## 15. 블로그 기능 사용법

```js
import * as blog from "./js/features/blog.js";

const { html, toc } = blog.parseMarkdownSubset(markdownText); // #, **, *, `code`, [link](url), - 목록 → 안전한 HTML
const related = blog.findRelatedPosts(post, allPosts, { recentlyViewedIds, favoriteIds }); // 태그/카테고리/제목유사도/최근조회/즐겨찾기 조합
const draftStore = blog.createDraftSession(); // 자동저장 + undo/redo(core/state-store.js 재사용)
```

## 16. 방문자 기능 사용법

```js
import * as visitor from "./js/features/visitor.js";

visitor.recordVisitStart("blog");           // 방문 횟수/최초·재방문 구분
visitor.trackPageDuration("blog", lifecycle); // 체류 시간(beforeunload/visibilitychange 시점 기록)
await visitor.logEvent({ type: "click" });   // 동의(getConsent) 없으면 pageview 외 이벤트는 기록하지 않음
```

## 17. 외부 API 설정 방법

`js/config/api-config.example.js`에 provider/baseURL 같은 **비민감 상수**만 있습니다. 실제 API Key가 필요한 기능(항공/교통 실연동, AI 요약 등)은 `pages/playground.html`의 "API 키 설정" 패널에서 입력하면 `localStorage`(namespace 격리)에만 저장되고, 코드나 저장소 어디에도 평문으로 커밋되지 않습니다.

| 서비스 | 기본 Provider | API Key | 비고 |
|---|---|---|---|
| 날씨 | Open-Meteo | 불필요 | HTTPS, CORS 허용, 무료 |
| 환율 | Frankfurter | 불필요 | ECB 데이터, HTTPS, CORS 허용 |
| 교통/항공/페리 | Mock | (실연동 시 필요) | 국가별 인증/CORS 제약으로 기본은 Mock, Adapter 구조만 제공 |
| 블로그 피드(데모) | JSONPlaceholder | 불필요 | 메인 블로그 콘텐츠는 로컬 JSON을 사용하고, 이건 외부 JSON 연동 데모용 |
| 요약 | 규칙 기반(로컬) | 불필요 | AI Adapter는 인터페이스만 제공, 기본 비활성 |

## 18. API Key 보안 주의

- **절대로 클라이언트 코드에 실제 API Key를 하드코딩하지 마세요.** 브라우저에 도달한 모든 문자열은 최종 사용자가 열람/추출할 수 있습니다.
- AI 요약처럼 유료·비공개 API Key가 필요한 기능은 **반드시 여러분의 서버(백엔드)가 Key를 보관**하고, 브라우저는 그 서버 엔드포인트만 호출해야 합니다(`services/summarizer-service.js`의 `AiSummarizerAdapter`가 이 경계를 인터페이스로만 표시하고 실제로 호출하지 않는 이유입니다).
- 이 프로젝트에서 사용자가 입력하는 "API Key"는 전부 `localStorage`에만 남고 어떤 서버로도 전송되지 않습니다.

## 19. CORS 제한 설명

- Open-Meteo, Frankfurter, JSONPlaceholder는 모두 `Access-Control-Allow-Origin`을 허용해 브라우저에서 직접 `fetch` 가능합니다.
- **RSS 피드는 대부분 CORS를 허용하지 않아** 브라우저 단독으로는 직접 가져올 수 없습니다. 그래서 `services/blog-feed-service.js`의 `fetchRssViaProxy`는 실제로 호출하지 않는 "구조 예시"로만 남겨두었고, 진짜로 쓰려면 서버 프록시가 필요하다고 README(이 문서)와 코드 주석에 명시했습니다.
- 실시간 교통/항공 API도 다수가 CORS를 지원하지 않거나 서버 사이드 인증을 요구해, 기본은 Mock Provider로 대체했습니다.

## 20. 오프라인 동작 설명

- `network/api-client.js`가 `online`/`offline` 이벤트를 감지해 이벤트 버스로 전파 → `app.js`가 화면 상단에 오프라인 배너를 띄웁니다.
- `network/http-client.js`는 오프라인 상태에서 GET 요청 시 즉시 캐시된 마지막 값을 반환합니다(타임아웃까지 기다리지 않음).
- 날씨/환율 등 외부 API 서비스는 **Remote → Cached(로컬 캐시) → Local JSON → Mock** 순서로 폴백하며, 화면에 항상 `provider: open-meteo` 처럼 현재 사용 중인 provider를 표시합니다.
- 일정/여행/블로그/방문자 데이터는 IndexedDB에 저장되므로 네트워크가 끊겨도 마지막으로 동기화된 데이터를 그대로 열람할 수 있습니다.
- **한계**: 이 프로젝트는 Service Worker를 구현하지 않았습니다(스펙상 선택 사항). 따라서 정적 파일 자체를 오프라인 캐시하지는 않으며, "오프라인에서도 이미 열어본 페이지의 데이터를 본다"는 수준까지만 지원합니다. 재연결 시 서버와의 데이터 동기화는 이 프로젝트에 실제 백엔드가 없어 완전한 형태로 구현할 수 없고, `services/provider-chain.js`가 Remote 우선 재시도를 통해 그 역할의 일부만 흉내냅니다.

## 21. 브라우저 호환성

`utils`/`storage`/`workers` 각 모듈은 사용 전에 기능 지원 여부를 확인하고 폴백을 제공합니다.

| 기능 | 확인 위치 | 미지원 시 동작 |
|---|---|---|
| IndexedDB | `storage/indexed-db.js`의 `isIndexedDbSupported` | `StorageError` 발생, 호출부에서 처리 |
| Web Worker | `workers/worker-client.js` | 등록된 `fallback` 함수로 메인 스레드 처리 |
| IntersectionObserver | `dom/observers.js` | 즉시 `isIntersecting: true`로 콜백 |
| ResizeObserver | `dom/observers.js` | `window.resize` 리스너로 대체 |
| MutationObserver | `dom/observers.js` | 감시 없이 무시(치명적이지 않은 기능) |
| Notification API | `features/notifications.js` | 인앱 토스트로 대체 |
| Geolocation API | `services/weather-service.js` | 버튼 클릭 시에만 요청, 실패 시 도시 검색으로 대체 |
| Web Crypto API | `utils/security.js` | (필수 기능이라 폴백 없음, 모든 최신 브라우저가 지원) |
| AbortController | `network/http-client.js` | (필수 기능, 모든 최신 브라우저가 지원) |
| structuredClone | `utils/object.js`, `core/state-store.js` | `JSON.parse(JSON.stringify(...))`로 폴백 |
| requestIdleCallback | (미사용) | 이 프로젝트는 사용하지 않음 |
| File System Access API | (미사용, 선택 기능) | 기본 파일 처리는 `<input type="file">` + Blob 다운로드 방식만 사용 |

## 22. 적용한 디자인 패턴

| 패턴 | 적용 위치 | 이유 |
|---|---|---|
| Module Pattern | 모든 `js/*.js` | ES Module 자체가 캡슐화 단위 — 전역 변수 없이 필요한 것만 export |
| Factory Pattern | `createHttpClient`, `createStore`, `createEventBus`, `createRouter`, `createRequestQueue`, `createCacheManager` | 설정값에 따라 다른 인스턴스를 만들어야 해서 클래스 상속보다 함수형 팩토리가 더 단순함 |
| Observer Pattern | `core/event-bus.js`, `core/state-store.js`의 `subscribe`, IntersectionObserver 등 | 발행자와 구독자의 결합도를 낮추기 위함 |
| Mediator(Event Bus) | `core/event-bus.js` | auth/blog/schedule 등 서로 모르는 모듈이 이벤트로만 소통 |
| Strategy Pattern | `services/*-service.js`의 Provider 배열(`resolveWithFallback`) | Remote/Cache/Mock 전략을 배열로 갈아끼우며 순서대로 시도 |
| Adapter Pattern | `services/weather-service.js` 등 모든 외부 API 모듈 | 외부 응답 구조를 내부 표준 `{ provider, fetchedAt, data }`로 변환 |
| Repository Pattern | `features/blog.js`, `schedule.js`, `travel.js`, `comments.js`, `visitor.js`의 IndexedDB CRUD 함수들 | 저장소 접근 로직을 도메인 함수 뒤로 숨겨 페이지 코드가 IndexedDB API를 직접 몰라도 되게 함 |
| Command Pattern | `core/state-store.js`의 undo/redo 스택 | 각 상태 변경을 "되돌릴 수 있는 하나의 단위"로 취급 |
| State Pattern | `features/travel.js`의 `computeProgress`(upcoming/ongoing/completed), `blog.js`의 draft/scheduled/published | 상태별로 다르게 렌더링해야 하는 값을 명시적 상태 값으로 표현 |
| Dependency Injection | `createStore(initial, { storageAdapter })`, `createHttpClient({ ... })`, `workers/worker-client.js`의 `fallback` 옵션 | 구체 구현을 생성자 인자로 주입해 테스트/교체가 쉬움 |
| Iterator | `utils/array.js`, IndexedDB `iterate` cursor, `for...of` 전반 | 컬렉션 순회를 일관된 방식으로 |
| Singleton(제한적) | `core/event-bus.js`의 `eventBus`, `network/api-client.js`의 `apiClient` | 앱 전체가 공유해야 하는 단 하나의 통신 채널/버스에만 제한적으로 사용(테스트에서는 `createEventBus()`로 독립 인스턴스 생성 가능) |
| Proxy(선택적) | (미사용) | 캐시/검증 목적으로 고려했으나 `request-cache.js`의 명시적 함수 호출이 더 읽기 쉬워 채택하지 않음 |

패턴은 전부 "이미 있던 문제를 풀기 위해" 썼고, 패턴 그 자체를 보여주려고 코드를 억지로 복잡하게 만들지 않았습니다.

## 23. 적용한 JavaScript 문법

- **기본 문법**: `const`/`let`, optional chaining(`?.`), nullish coalescing(`??`), 삼항연산자, 단축평가, 템플릿 리터럴, 구조분해할당, spread/rest, 기본 매개변수 — 거의 모든 파일에서 사용.
- **함수**: 함수 선언문/표현식/화살표 함수(`utils/*.js` 전반), 콜백(`onTick`, `onRetry` 등), 고차함수(`debounce`, `throttle`, `withRetry`), 재귀 함수(`dom/template.js`의 `deepFreeze`류 순회, `files/csv.js`), 순수 함수(`features/travel-scoring.js`, `schedule-conflict.js`), 클로저(`debounce`/`throttle`/`createLifecycle`의 내부 상태).
- **객체지향**: 클래스(`Countdown`, `Stopwatch`, `PomodoroTimer`, `AiSummarizerAdapter`), private field(`#remainingMs` 등), getter(`get isRunning()`), static 대신 인스턴스 메서드 위주로 단순화, composition(`createLifecycle`가 `setTimeout`/`addEventListener`를 감싸 조합), dependency injection(위 표 참고), factory pattern(위 표 참고).
- **배열/컬렉션**: `map`/`filter`/`reduce`/`find`/`findIndex`/`some`/`every`/`sort`/`flat`/`flatMap`/`Array.from`(`utils/array.js`), `Set`(중복 제거, 방문 페이지 집합), `Map`(그룹핑, 댓글 트리 `buildReplyTree`).
- **객체 처리**: `Object.keys/values/entries`(`utils/object.js`, `travel.js`의 카테고리 합계), `Object.freeze`(`state-store.js`의 불변 상태), `structuredClone`(딥 클론, 폴백 포함).
- **비동기 처리**: Promise, `async`/`await`(거의 모든 IndexedDB/HTTP/파일 API), `Promise.all`(홈 화면의 병렬 데이터 로딩), AbortController(요청 취소), timeout, 재시도(exponential backoff + jitter), 동시 실행 개수 제한(세마포어, `network/rate-limiter.js`), 요청 큐(`network/request-queue.js`), Web Worker + `postMessage`(요청 ID 매칭).
- **동기/비동기 비교 데모**는 24번 항목 참고.

## 24. 동기와 비동기 처리 비교

`pages/playground.html`의 여러 패널이 이 차이를 실제로 보여줍니다.

- **동기처럼 보이는 함수 호출도 실제로는 마이크로태스크**라는 것을 `core/state-store.js`의 `batch()`가 보여줍니다: `store.batch(() => { store.setState(...); store.setState(...); })` 안에서 여러 `setState`를 동기적으로 호출해도, 구독자 알림(`notify`)은 큐에 쌓였다가 `batch` 블록이 끝난 뒤 **한 번만** 실행됩니다.
- **macrotask(setTimeout) vs microtask(Promise)** 순서: `js/pages/playground.js`의 "전역 오류 훅 테스트" 버튼은 `setTimeout(() => { throw ... }, 0)` 뒤에 곧바로 로그를 남기는데, 실행 순서를 보면 동기 코드 → microtask(Promise 체인이 있다면) → macrotask(setTimeout) 순서로 실행됨을 확인할 수 있습니다.
- **재시도(retry) 패널**은 순차적 비동기 처리(각 시도가 이전 시도의 실패를 기다린 뒤 지연 후 재시도)를 보여주고, **홈 화면의 여러 카드 로딩**(`Promise.all`은 아니지만 각 렌더 함수를 동시에 호출)은 병렬 비동기 처리를 보여줍니다.
- **Web Worker 검색**은 "메인 스레드를 막지 않는 비동기"의 극단적 예시로, 무거운 계산이 끝날 때까지 스크롤/클릭이 멈추지 않는다는 것을 체감할 수 있습니다.

## 25. 성능 최적화 방법

- **이벤트 위임**: `dom/selector.js`의 `delegate`와 `events/*.js` 대부분이 `document`/컨테이너 하나에만 리스너를 걸고 `event.target.closest()`로 실제 대상 판별 — 리스트 아이템마다 리스너를 안 답니다.
- **DocumentFragment**: `dom/renderer.js`의 `renderList`/`batchAppend`가 오프스크린에서 조립 후 한 번에 DOM에 붙여 reflow를 최소화합니다.
- **debounce/throttle**: 검색 입력(`debounce`), 스크롤 이벤트(`throttle`)에 각각 적용.
- **HTTP 캐시**: 동일 GET 요청 병합 + TTL 캐시 + stale-while-revalidate로 불필요한 네트워크 호출을 줄입니다.
- **Canvas 60fps 제한 없이 필요할 때만 재그리기**: `dom/canvas-charts.js`는 `ResizeObserver`가 실제로 크기 변화를 감지했을 때만 다시 그립니다.
- **content 무거운 연산은 Web Worker로 분리**: 검색/집계/CSV 파싱/일정 충돌 검사/추천 점수 계산.
- **타이머 정확도**: `performance.now()`/`Date.now()` 기준 재계산으로 탭이 백그라운드로 가도 누적 오차가 생기지 않습니다(`utils/timer.js` 주석 참고).

## 26. 보안 고려 사항

- **XSS 방지**: 사용자 입력은 `textContent` 또는 `dom/template.js`의 `html` 태그드 템플릿(자동 escape)으로만 삽입합니다. `innerHTML`은 `blog.js`의 `parseMarkdownSubset`처럼 **이 라이브러리가 직접 만들고 이미 escape를 거친** 고정 구조의 HTML에만 제한적으로 씁니다.
- **비밀번호**: 절대 평문 저장 안 함. `utils/security.js`의 `hashPassword`(Web Crypto `SHA-256` + salt)로 해시한 값만 `localStorage`에 저장합니다.
  - ⚠️ **클라이언트 해시는 실제 서버 인증을 대체하지 못합니다.** 진짜 서비스라면 HTTPS + 서버 측 인증(bcrypt/argon2 등)이 반드시 필요합니다. 이 프로젝트는 서버가 없는 학습 환경을 위한 **Mock 인증**입니다.
- **세션/토큰 저장 위치**: 이 프로젝트는 세션을 `sessionStorage`(탭 닫으면 소멸)에 두고, "로그인 상태 유지"를 체크하면 `localStorage`에도 TTL을 걸어 저장합니다. `localStorage`는 XSS에 취약하다는 잘 알려진 위험이 있고(스크립트가 실행되면 그대로 읽힘), `httpOnly` 쿠키가 이론적으로 더 안전하지만 JS로는 설정할 수 없어 이 프로젝트에서는 쓸 수 없습니다.
- **CSRF**: 이 프로젝트는 실제 서버가 없어 CSRF 공격이 성립하지 않지만, 개념은 README에 남깁니다 — CSRF는 사용자가 로그인된 다른 사이트로 브라우저가 자동으로 인증정보(쿠키)를 실어 요청을 보내게 만드는 공격이며, `SameSite=Strict/Lax` 쿠키 옵션과 서버측 CSRF 토큰 검증으로 막습니다.
- **개인정보 최소 수집**: `features/visitor.js`는 동의(consent) 전에는 pageview 외 이벤트를 기록하지 않고, 과도한 fingerprinting(캔버스 지문 등)을 하지 않습니다. 위치 정보는 버튼 클릭 후에만 요청합니다.

## 27. 테스트 실행 방법

1. `pages/playground.html`을 열고 맨 아래 "테스트 러너" 패널의 **"전체 테스트 실행"** 버튼을 클릭합니다.
2. 콘솔에도 `console.table`로 전체 결과가 출력됩니다.
3. 테스트 코드는 `js/testing/test-framework.js`(직접 만든 describe/test/expect 러너)와 `js/testing/test-suites.js`(문자열/날짜/validation/storage/event bus/state store/HTTP 재시도/debounce/throttle/일정 충돌/여행 예산/글 요약/추천 점수 테스트)에 있습니다.

```js
import { describe, test, expect, runAll } from "./js/testing/test-framework.js";

describe("내 기능", () => {
  test("동작해야 한다", () => {
    expect(1 + 1).toBe(2);
  });
});

const { passed, failed, total } = await runAll();
```

## 28. 새로운 기능을 추가하는 방법

1. **순수 로직**은 `js/features/` 또는 `js/services/`에 DOM 비의존 함수로 작성합니다(테스트하기 쉽고, 필요하면 Worker에서도 재사용 가능).
2. **저장이 필요하면** `storage/local-storage.js`(설정), `storage/session-storage.js`(임시), `storage/indexed-db.js`(대량 데이터) 중 알맞은 곳을 골라 `OBJECT_STORES`(필요하면 `config/constants.js`에 새 스토어 추가 후 `storage/indexed-db.js`의 `onupgradeneeded`에 `if (oldVersion < N)` 블록으로 마이그레이션 추가)를 씁니다.
3. **외부 API가 필요하면** `services/` 아래 새 파일을 만들고 `provider-chain.js`의 `resolveWithFallback`으로 Remote→Cache→Mock 순서를 따르게 합니다.
4. **화면 연결**은 `js/pages/`에 페이지 컨트롤러를 추가하고(또는 기존 컨트롤러에 이어 붙이고), `app.js`의 `initApp()`을 페이지 진입점에서 가장 먼저 호출합니다.
5. **테스트**는 `js/testing/test-suites.js`에 `describe` 블록을 추가합니다.
6. 새 모듈이 다른 모듈을 참조할 때는 항상 `pages → features/services → core/network/storage/dom/events/utils` 방향만 지키고, 하위 계층이 상위 계층(`pages/`, `features/`)을 다시 import하지 않도록 주의합니다(순환 참조 방지).

---

## 기능 목록(요약)

자기소개(프로필/프로젝트/타임라인/기술스택 차트/파일 import·export) · 회원가입·로그인(실시간 검증/비밀번호 강도/WebCrypto 해시/로그인 잠금/세션 타이머) · 블로그(목록/검색/태그/정렬/페이지네이션/무한스크롤/북마크/좋아요/댓글·대댓글/TOC/읽기진행률/요약/공유/인쇄/초안 자동저장/undo·redo/예약발행) · 일정(월간·시간표·목록 3뷰/드래그 이동/반복 5종/충돌검사/카운트다운/CSV·JSON·ICS export) · 여행(CRUD/날씨·환율·교통·항공·페리 연동/예산 도넛차트/체크리스트/추천/공유텍스트/백업) · 방문자(세션/체류시간/클릭/스크롤깊이/이벤트로그/차트/동의토글/삭제) · Playground(라이브러리 20여개 기능 개별 테스트 + 테스트 러너).

## 사용된 Browser API 목록

Fetch API, XMLHttpRequest, Web Storage(localStorage/sessionStorage), IndexedDB, File API, Blob API, URL API(`createObjectURL`/`revokeObjectURL`), History API, Web Worker, Intersection Observer, Mutation Observer, Resize Observer, AbortController, Canvas 2D API, Geolocation API, Notification API, Web Crypto API(`SubtleCrypto`), Clipboard API(`navigator.clipboard`), Pointer Events, Drag and Drop API, `structuredClone`, `Intl.DateTimeFormat`/`Intl.RelativeTimeFormat`, `performance.now`.

## 확장 아이디어(구현하지 않음)

- Service Worker 기반 정적 파일 캐시/오프라인 폴백(스펙상 선택 사항이라 생략)
- File System Access API를 이용한 로컬 파일 직접 저장(현재는 input + Blob 다운로드 방식만 지원)
- WebSocket/Server-Sent Events 기반 실시간 알림
- `aurora-ui`의 Glassmorphism/Spatial 레이어와 TesseraJS 데이터 바인딩 결합
