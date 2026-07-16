import { initApp, renderToast } from "../app.js";
import { qs, createElement } from "../dom/selector.js";
import { observeIntersection, observeMutation, observeResize } from "../dom/observers.js";
import { createChart } from "../dom/canvas-charts.js";
import { apiClient } from "../network/api-client.js";
import { createMockServer } from "../network/mock-server.js";
import { withRetry } from "../network/retry-policy.js";
import { localStore } from "../storage/local-storage.js";
import { sessionStore } from "../storage/session-storage.js";
import { indexedDb } from "../storage/indexed-db.js";
import { OBJECT_STORES } from "../config/constants.js";
import { generateId } from "../utils/security.js";
import { readAsText } from "../files/file-reader.js";
import { downloadCSV } from "../files/file-exporter.js";
import { Stopwatch } from "../utils/timer.js";
import { formatDurationClock } from "../utils/formatter.js";
import { debounce } from "../utils/debounce.js";
import { throttle } from "../utils/throttle.js";
import { createEventBus } from "../core/event-bus.js";
import { createStore } from "../core/state-store.js";
import { createRouter } from "../core/router.js";
import { logger } from "../core/logger.js";
import { ValidationError } from "../core/errors.js";
import { search } from "../features/search.js";
import { makeDraggable, makeDropzone } from "../events/drag-drop.js";
import { createContextMenu } from "../events/mouse.js";
import { matchCombo } from "../events/keyboard.js";
import { runAll } from "../testing/test-framework.js";
import "../testing/test-suites.js";

const { lifecycle } = initApp({ pageName: "playground" });

function log(elId, message) {
  const el = qs(`#${elId}`);
  el.textContent += `${new Date().toLocaleTimeString("ko-KR")} ${message}\n`;
  el.scrollTop = el.scrollHeight;
}

// ---------- HTTP / 타임아웃 / 취소 ----------
qs("#pg-http-get").addEventListener("click", async () => {
  try {
    const { data } = await apiClient.get("../data/profile.json", { cache: { enabled: true, ttl: 10_000 } });
    log("pg-http-log", `GET 성공: ${data.name}`);
  } catch (error) {
    log("pg-http-log", `GET 실패: ${error.message}`);
  }
});

qs("#pg-http-timeout").addEventListener("click", async () => {
  try {
    await apiClient.get("../data/travel-posts.json", { timeout: 1, retry: 0, cache: { enabled: false } });
    log("pg-http-log", "타임아웃이 발생하지 않았습니다(요청이 1ms보다 빨랐습니다).");
  } catch (error) {
    log("pg-http-log", `예상대로 타임아웃 발생: ${error.name} — ${error.message}`);
  }
});

let abortController = null;
qs("#pg-http-abort-start").addEventListener("click", async () => {
  abortController = new AbortController();
  log("pg-http-log", "요청을 시작합니다...");
  try {
    await apiClient.get("../data/schedules.json", { signal: abortController.signal, cache: { enabled: false } });
    log("pg-http-log", "요청이 완료되었습니다(취소되지 않음).");
  } catch (error) {
    log("pg-http-log", error.name === "AbortError" ? "사용자가 요청을 취소했습니다." : `오류: ${error.message}`);
  }
});
qs("#pg-http-abort-cancel").addEventListener("click", () => abortController?.abort());

// ---------- 캐시 ----------
qs("#pg-cache-run").addEventListener("click", async () => {
  qs("#pg-cache-log").textContent = "";
  await apiClient.get("../data/schedules.json", { cache: { enabled: true, ttl: 5000 } });
  log("pg-cache-log", "1차 요청 완료");
  await apiClient.get("../data/schedules.json", { cache: { enabled: true, ttl: 5000 } });
  log("pg-cache-log", "2차 요청 완료 — 브라우저 개발자도구 Network 탭을 보면 실제 요청은 한 번만 나갔을 수 있습니다.");
});

// ---------- 재시도 ----------
const unstableServer = createMockServer({ failureRate: 0.7, latencyRange: [50, 150] });
qs("#pg-retry-run").addEventListener("click", async () => {
  qs("#pg-retry-log").textContent = "";
  try {
    const result = await withRetry(() => unstableServer.echo("/unstable"), {
      retries: 3,
      onRetry: (error, attempt, delay) => log("pg-retry-log", `시도 ${attempt + 1} 실패(${error.message}) — ${delay}ms 후 재시도`),
    });
    log("pg-retry-log", `최종 성공: ${JSON.stringify(result)}`);
  } catch (error) {
    log("pg-retry-log", `모든 재시도 실패: ${error.message}`);
  }
});

// ---------- Storage ----------
qs("#pg-local-set").addEventListener("click", () => {
  localStore.set(qs("#pg-storage-key").value, qs("#pg-storage-value").value);
  log("pg-storage-log", `localStore.set("${qs("#pg-storage-key").value}")`);
});
qs("#pg-local-get").addEventListener("click", () => {
  log("pg-storage-log", `localStore.get -> ${JSON.stringify(localStore.get(qs("#pg-storage-key").value, null))}`);
});
qs("#pg-session-set").addEventListener("click", () => {
  sessionStore.set(qs("#pg-storage-key").value, qs("#pg-storage-value").value);
  log("pg-storage-log", `sessionStore.set("${qs("#pg-storage-key").value}")`);
});
qs("#pg-session-get").addEventListener("click", () => {
  log("pg-storage-log", `sessionStore.get -> ${JSON.stringify(sessionStore.get(qs("#pg-storage-key").value, null))}`);
});

// ---------- IndexedDB CRUD ----------
qs("#pg-idb-add").addEventListener("click", async () => {
  const item = { id: generateId("scratch"), label: qs("#pg-idb-label").value, createdAt: new Date().toISOString() };
  await indexedDb.put(OBJECT_STORES.FILE_BACKUPS, item);
  log("pg-idb-log", `추가됨: ${item.id}`);
});
qs("#pg-idb-list").addEventListener("click", async () => {
  const all = await indexedDb.getAll(OBJECT_STORES.FILE_BACKUPS);
  log("pg-idb-log", `총 ${all.length}개 — ${all.map((item) => item.label).join(", ")}`);
});
qs("#pg-idb-clear").addEventListener("click", async () => {
  await indexedDb.clear(OBJECT_STORES.FILE_BACKUPS);
  log("pg-idb-log", "전체 삭제 완료");
});

// ---------- 파일 읽기 / CSV ----------
qs("#pg-file-input").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const text = await readAsText(file);
    log("pg-file-log", `읽음(${file.name}, ${file.size}bytes): ${text.slice(0, 100)}`);
  } catch (error) {
    log("pg-file-log", `읽기 실패: ${error.message}`);
  }
});
qs("#pg-csv-export").addEventListener("click", () => {
  downloadCSV(
    [
      { name: "홍길동", score: 90 },
      { name: "김철수", score: 80 },
    ],
    { prefix: "playground-sample" }
  );
  log("pg-file-log", "샘플 CSV를 다운로드했습니다.");
});

// ---------- 타이머 ----------
const stopwatch = new Stopwatch({ onTick: (ms) => (qs("#pg-stopwatch-display").textContent = formatDurationClock(ms)) });
qs("#pg-stopwatch-start").addEventListener("click", () => stopwatch.start());
qs("#pg-stopwatch-pause").addEventListener("click", () => stopwatch.pause());
qs("#pg-stopwatch-reset").addEventListener("click", () => {
  stopwatch.reset();
  qs("#pg-stopwatch-display").textContent = "00:00";
});
lifecycle.onCleanup(() => stopwatch.pause());

// ---------- debounce / throttle ----------
let debounceCount = 0;
let throttleCount = 0;
const debouncedFn = debounce(() => {
  debounceCount += 1;
  qs("#pg-debounce-count").textContent = String(debounceCount);
}, 300);
const throttledFn = throttle(() => {
  throttleCount += 1;
  qs("#pg-throttle-count").textContent = String(throttleCount);
}, 300);
qs("#pg-debounce-input").addEventListener("input", () => {
  debouncedFn();
  throttledFn();
});

// ---------- Event Bus ----------
const demoBus = createEventBus();
let unsubscribeDemoBus = null;
qs("#pg-eventbus-subscribe").addEventListener("click", () => {
  unsubscribeDemoBus?.();
  unsubscribeDemoBus = demoBus.on("demo:ping", (payload) => log("pg-eventbus-log", `수신: ${JSON.stringify(payload)}`));
  log("pg-eventbus-log", "구독했습니다.");
});
qs("#pg-eventbus-emit").addEventListener("click", () => demoBus.emit("demo:ping", { at: new Date().toLocaleTimeString("ko-KR") }));

// ---------- State Store ----------
const demoStore = createStore({ count: 0 });
demoStore.subscribe(
  (state) => state.count,
  (value) => (qs("#pg-store-value").textContent = String(value))
);
qs("#pg-store-inc").addEventListener("click", () => demoStore.setState((state) => ({ count: state.count + 1 })));
qs("#pg-store-undo").addEventListener("click", () => demoStore.undo());
qs("#pg-store-redo").addEventListener("click", () => demoStore.redo());

// ---------- Web Worker 검색 ----------
qs("#pg-worker-run").addEventListener("click", async () => {
  const items = Array.from({ length: 1000 }, (_, i) => ({ id: i, title: `item ${i} ${i % 7 === 0 ? "apple" : "banana"}` }));
  const start = performance.now();
  const results = await search("apple", items, ["title"]);
  const elapsed = (performance.now() - start).toFixed(1);
  log("pg-worker-log", `검색 완료: ${results.length}건, ${elapsed}ms, Worker 지원: ${typeof Worker !== "undefined"}`);
});

// ---------- Observer API ----------
const ioTarget = qs("#pg-io-target");
const io = observeIntersection(
  ioTarget,
  (entries) => {
    entries.forEach((entry) => {
      ioTarget.style.background = entry.isIntersecting ? "#4fedb0" : "";
      log("pg-observer-log", `Intersection: ${entry.isIntersecting}`);
    });
  },
  { threshold: 0.5 }
);
lifecycle.onCleanup(() => io.disconnect());

qs("#pg-mutation-add").addEventListener("click", () => {
  qs("#pg-mutation-box").appendChild(createElement("span", { class: "tag" }, [`child ${Date.now()}`]));
});
const mutationObserver = observeMutation(qs("#pg-mutation-box"), (mutations) => log("pg-observer-log", `Mutation 감지: ${mutations.length}건`));
lifecycle.onCleanup(() => mutationObserver.disconnect());

const resizeObserver = observeResize(qs("#pg-resize-box"), (entries) => log("pg-observer-log", `Resize 감지: width=${Math.round(entries[0].contentRect.width)}px`));
lifecycle.onCleanup(() => resizeObserver.disconnect());

// ---------- 마우스 이벤트 ----------
const mouseArea = qs("#pg-mouse-area");
mouseArea.addEventListener("mousemove", (event) => {
  const rect = mouseArea.getBoundingClientRect();
  qs("#pg-mouse-coords").textContent = `x:${Math.round(event.clientX - rect.left)}, y:${Math.round(event.clientY - rect.top)}`;
});
createContextMenu(document.body, "#pg-mouse-area", () => [
  { label: "인사하기", onSelect: () => renderToast({ message: "안녕하세요!", type: "info" }) },
  { label: "로그 남기기", onSelect: () => log("pg-observer-log", "우클릭 메뉴에서 항목을 선택했습니다.") },
]);

// ---------- 키보드 단축키 ----------
const demoCombos = ["ctrl+k", "/", "escape", "?"];
document.addEventListener("keydown", (event) => {
  const matched = demoCombos.find((combo) => matchCombo(event, combo));
  if (matched) qs("#pg-keyboard-last").textContent = matched;
});

// ---------- 드래그 앤 드롭 ----------
makeDraggable(qs("#pg-drag-source"), () => ({ payload: "hello" }));
makeDropzone(qs("#pg-drop-target"), (data) => {
  qs("#pg-drop-target").textContent = `받음: ${JSON.stringify(data)}`;
});

// ---------- Canvas 차트 ----------
function randomChartData() {
  return { labels: ["A", "B", "C", "D"], values: [1, 2, 3, 4].map(() => Math.round(Math.random() * 100)) };
}
const pgChart = createChart(qs("#pg-chart"), { type: "bar", ...randomChartData() });
qs("#pg-chart-random").addEventListener("click", () => pgChart.update(randomChartData()));
qs("#pg-chart-export").addEventListener("click", () => pgChart.exportPNG("playground-chart.png"));
lifecycle.onCleanup(() => pgChart.destroy());

// ---------- 오류 처리 ----------
qs("#pg-error-validation").addEventListener("click", () => {
  try {
    throw new ValidationError("샘플 검증 오류", { field: "email" });
  } catch (error) {
    log("pg-error-log", `${error.name}: ${error.userMessage} (code=${error.code})`);
  }
});
qs("#pg-error-unhandled").addEventListener("click", () => {
  setTimeout(() => {
    throw new Error("의도적으로 발생시킨 전역 오류");
  }, 0);
  log("pg-error-log", "0.1초 후 전역 오류 훅이 기록한 로그를 확인합니다...");
  setTimeout(() => {
    const last = logger.getEntries().at(-1);
    log("pg-error-log", `전역 훅 기록: ${last?.message ?? "(없음)"}`);
  }, 100);
});

// ---------- 오프라인 / 네트워크 상태 ----------
function updateNetworkStatus() {
  const el = qs("#pg-network-status");
  el.textContent = navigator.onLine ? "온라인" : "오프라인";
  el.className = `badge ${navigator.onLine ? "badge--success" : "badge--danger"}`;
}
updateNetworkStatus();
window.addEventListener("online", updateNetworkStatus);
window.addEventListener("offline", updateNetworkStatus);
lifecycle.onCleanup(() => {
  window.removeEventListener("online", updateNetworkStatus);
  window.removeEventListener("offline", updateNetworkStatus);
});

// ---------- API 키 설정 ----------
const API_KEY_STORAGE = "playground-api-key";
qs("#pg-api-key-input").value = localStore.get(API_KEY_STORAGE, "");
qs("#pg-api-key-save").addEventListener("click", () => {
  localStore.set(API_KEY_STORAGE, qs("#pg-api-key-input").value);
  qs("#pg-api-key-status").textContent = "localStorage에 저장되었습니다(서버로 전송되지 않습니다).";
});

// ---------- 미니 SPA 라우터 데모 ----------
const demoRouter = createRouter({ root: "" });
const outlet = qs("#pg-router-outlet");
demoRouter.register("/playground/demo", () => {
  outlet.textContent = "홈 라우트입니다.";
});
demoRouter.register("/playground/demo/item/:id", ({ params }) => {
  outlet.textContent = `아이템 상세 — id: ${params.id}`;
});
demoRouter.setNotFound(() => {
  outlet.textContent = "일치하는 라우트가 없습니다.";
});
qs("#pg-router-home").addEventListener("click", () => demoRouter.navigate("/playground/demo"));
qs("#pg-router-item").addEventListener("click", () => demoRouter.navigate("/playground/demo/item/42"));
qs("#pg-router-back").addEventListener("click", () => window.history.back());
lifecycle.onCleanup(() => demoRouter.destroy());
outlet.textContent = "버튼을 눌러 라우트를 이동해보세요.";

// ---------- 테스트 러너 ----------
qs("#pg-test-run").addEventListener("click", async () => {
  const resultsEl = qs("#pg-test-results");
  resultsEl.textContent = "";
  const { passed, failed, total } = await runAll({
    onProgress: (result) => {
      resultsEl.appendChild(
        createElement("div", { class: "text-sm", style: `color:${result.passed ? "var(--color-success)" : "var(--color-danger)"}` }, [
          `${result.passed ? "✅" : "❌"} [${result.suite}] ${result.test}${result.message ? ` — ${result.message}` : ""}`,
        ])
      );
    },
  });
  qs("#pg-test-summary").textContent = `총 ${total}개 중 ${passed}개 성공, ${failed}개 실패`;
});
