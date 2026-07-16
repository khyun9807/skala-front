import { describe, test, expect } from "./test-framework.js";
import { slugify, truncate, countWords } from "../utils/string.js";
import { isSameDay, addDays, timeRangesOverlap } from "../utils/date.js";
import { validators, validateForm } from "../utils/validation.js";
import { localStore } from "../storage/local-storage.js";
import { createEventBus } from "../core/event-bus.js";
import { createStore } from "../core/state-store.js";
import { computeBackoffDelay } from "../network/retry-policy.js";
import { debounce } from "../utils/debounce.js";
import { throttle } from "../utils/throttle.js";
import { findConflicts } from "../features/schedule-conflict.js";
import { computeBudgetSummary } from "../features/travel.js";
import { computeRecommendationScore } from "../features/travel-scoring.js";
import { summarizeRuleBased } from "../services/summarizer-service.js";
import { parseJSON } from "../files/json.js";

describe("문자열 유틸", () => {
  test("slugify는 공백을 하이픈으로 바꾼다", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });
  test("truncate는 지정 길이로 자르고 말줄임표를 붙인다", () => {
    expect(truncate("abcdefghij", 5)).toBe("abcd…");
  });
  test("countWords는 HTML 태그를 무시하고 단어를 센다", () => {
    expect(countWords("<p>hello world</p>")).toBe(2);
  });
});

describe("날짜 유틸", () => {
  test("isSameDay는 같은 날짜면 true", () => {
    expect(isSameDay("2026-01-01T01:00:00", "2026-01-01T23:00:00")).toBeTruthy();
  });
  test("addDays는 날짜를 정확히 더한다", () => {
    expect(addDays("2026-01-01", 1).getDate()).toBe(2);
  });
  test("timeRangesOverlap은 겹치는 구간을 감지한다", () => {
    expect(timeRangesOverlap("2026-01-01T10:00", "2026-01-01T11:00", "2026-01-01T10:30", "2026-01-01T11:30")).toBeTruthy();
  });
  test("timeRangesOverlap은 겹치지 않으면 false", () => {
    expect(timeRangesOverlap("2026-01-01T10:00", "2026-01-01T11:00", "2026-01-01T11:00", "2026-01-01T12:00")).toBeFalsy();
  });
});

describe("validation", () => {
  test("required는 빈 문자열을 거부한다", async () => {
    const { valid } = await validateForm({ name: "" }, { name: [validators.required()] });
    expect(valid).toBe(false);
  });
  test("email validator는 올바른 이메일을 허용한다", async () => {
    const { valid } = await validateForm({ email: "a@b.com" }, { email: [validators.email()] });
    expect(valid).toBe(true);
  });
});

describe("storage", () => {
  test("localStore는 객체를 그대로 왕복 저장한다", () => {
    localStore.set("__test_key__", { a: 1 });
    expect(localStore.get("__test_key__")).toEqual({ a: 1 });
    localStore.remove("__test_key__");
  });
});

describe("Event Bus", () => {
  test("emit은 구독한 핸들러를 호출한다", () => {
    const bus = createEventBus();
    let received = null;
    bus.on("ping", (payload) => {
      received = payload;
    });
    bus.emit("ping", 42);
    expect(received).toBe(42);
  });
  test("once는 단 한 번만 실행된다", () => {
    const bus = createEventBus();
    let count = 0;
    bus.once("x", () => {
      count += 1;
    });
    bus.emit("x");
    bus.emit("x");
    expect(count).toBe(1);
  });
});

describe("State Store", () => {
  test("setState는 상태를 갱신하고 구독자에게 알린다", () => {
    const store = createStore({ count: 0 });
    let seen;
    store.subscribe(
      (state) => state.count,
      (value) => {
        seen = value;
      }
    );
    store.setState({ count: 1 });
    expect(seen).toBe(1);
  });
  test("undo는 이전 상태로 되돌린다", () => {
    const store = createStore({ count: 0 });
    store.setState({ count: 1 });
    store.undo();
    expect(store.getState().count).toBe(0);
  });
});

describe("HTTP 재시도", () => {
  test("computeBackoffDelay는 maxDelay를 넘지 않는다", () => {
    expect(computeBackoffDelay(10, { baseDelay: 300, maxDelay: 4000 }) <= 4000).toBeTruthy();
  });
});

describe("debounce/throttle", () => {
  test("debounce는 연속 호출 후 한 번만 실행된다", async () => {
    let count = 0;
    const debounced = debounce(() => {
      count += 1;
    }, 30);
    debounced();
    debounced();
    debounced();
    await new Promise((resolve) => setTimeout(resolve, 80));
    expect(count).toBe(1);
  });
  test("throttle는 짧은 시간 내 호출 빈도를 제한한다", () => {
    let count = 0;
    const throttled = throttle(() => {
      count += 1;
    }, 50);
    throttled();
    throttled();
    throttled();
    expect(count).toBe(1);
  });
});

describe("일정 충돌 검사", () => {
  test("겹치는 일정 쌍을 찾아낸다", () => {
    const conflicts = findConflicts([
      { id: "a", startAt: "2026-01-01T10:00", endAt: "2026-01-01T11:00" },
      { id: "b", startAt: "2026-01-01T10:30", endAt: "2026-01-01T11:30" },
    ]);
    expect(conflicts.length).toBe(1);
  });
  test("겹치지 않으면 빈 배열을 반환한다", () => {
    const conflicts = findConflicts([
      { id: "a", startAt: "2026-01-01T10:00", endAt: "2026-01-01T11:00" },
      { id: "b", startAt: "2026-01-01T12:00", endAt: "2026-01-01T13:00" },
    ]);
    expect(conflicts.length).toBe(0);
  });
});

describe("여행 예산 계산", () => {
  test("카테고리별 합계와 전체 합계를 정확히 계산한다", () => {
    const summary = computeBudgetSummary(
      {
        expenses: [
          { category: "food", amount: 10, amountBase: 10 },
          { category: "food", amount: 5, amountBase: 5 },
          { category: "transport", amount: 20, amountBase: 20 },
        ],
      },
      100
    );
    expect(summary.total).toBe(35);
    expect(summary.categoryTotals.food).toBe(15);
    expect(summary.overBudget).toBe(false);
  });
});

describe("글 요약", () => {
  test("summarizeRuleBased는 지정한 문장 수 이하로 줄인다", () => {
    const text = "첫 문장입니다. 두번째 문장입니다. 세번째 문장입니다. 네번째 문장입니다.";
    const summary = summarizeRuleBased(text, { sentenceCount: 2 });
    const sentenceCount = summary.split(/(?<=[.!?])\s+/).filter(Boolean).length;
    expect(sentenceCount <= 2).toBeTruthy();
  });
});

describe("추천 점수 계산", () => {
  test("예산 범위와 태그가 맞으면 점수가 0보다 크다", () => {
    const result = computeRecommendationScore({ id: "t1", estimatedBudget: 500, tags: ["nature"] }, { budget: 1000, favoriteTags: ["nature"] });
    expect(result.score > 0).toBeTruthy();
  });
});

describe("파일 처리", () => {
  test("parseJSON은 잘못된 JSON에 대해 예외를 던진다(fallback 없을 때)", async () => {
    await expect(() => parseJSON("{not valid json")).toThrow();
  });
});
