import { logger } from "./logger.js";

function clone(value) {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(value);
    } catch {
      /* fall through to JSON clone below for non-cloneable values (e.g. functions) */
    }
  }
  return JSON.parse(JSON.stringify(value));
}

function shallowEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => Object.is(a[key], b[key]));
}

/**
 * 외부 상태 관리 라이브러리 없이 만든 최소 store.
 * - selector 기반 구독, derived state, middleware 파이프라인
 * - undo/redo 히스토리, localStorage 영속화, batch update(microtask)
 */
export function createStore(initialState, { middlewares = [], persistKey = null, storageAdapter = null, historyLimit = 50 } = {}) {
  let state = Object.freeze(clone(initialState));
  const subscribers = new Set(); // { selector, listener, lastValue }
  const undoStack = [];
  const redoStack = [];
  let pendingListeners = null; // batch 모드일 때 microtask flush 대기 집합
  let isRestoring = false;

  if (persistKey && storageAdapter) {
    const saved = storageAdapter.get(persistKey);
    if (saved && typeof saved === "object") {
      state = Object.freeze({ ...state, ...saved });
    }
  }

  function persist() {
    if (persistKey && storageAdapter && !isRestoring) {
      storageAdapter.set(persistKey, state);
    }
  }

  function notify(prevState) {
    for (const sub of subscribers) {
      const nextValue = sub.selector(state);
      if (!shallowEqual(nextValue, sub.lastValue)) {
        sub.lastValue = nextValue;
        try {
          sub.listener(nextValue, state, prevState);
        } catch (error) {
          logger.error("state-store", "subscriber threw", { message: error.message });
        }
      }
    }
  }

  function applyPatch(patch, { recordHistory = true } = {}) {
    let nextPatch = typeof patch === "function" ? patch(state) : patch;
    for (const middleware of middlewares) {
      nextPatch = middleware(nextPatch, state) ?? nextPatch;
    }
    const prevState = state;
    state = Object.freeze(clone({ ...state, ...nextPatch }));

    if (recordHistory) {
      undoStack.push(prevState);
      if (undoStack.length > historyLimit) undoStack.shift();
      redoStack.length = 0;
    }
    persist();

    if (pendingListeners) {
      pendingListeners.push(prevState);
    } else {
      notify(prevState);
    }
  }

  return {
    getState() {
      return state;
    },

    setState(patch, options) {
      applyPatch(patch, options);
    },

    /** 여러 setState 호출을 하나의 알림으로 묶는다(마이크로태스크 flush) */
    batch(fn) {
      const isOutermost = pendingListeners === null;
      if (isOutermost) pendingListeners = [];
      try {
        fn();
      } finally {
        if (isOutermost) {
          const firstPrev = pendingListeners[0];
          pendingListeners = null;
          if (firstPrev !== undefined) notify(firstPrev);
        }
      }
    },

    subscribe(selector, listener) {
      const sub = { selector, listener, lastValue: selector(state) };
      subscribers.add(sub);
      return () => subscribers.delete(sub);
    },

    /** 여러 selector 를 조합한 derived state를 만든다 */
    derive(selectors, combiner) {
      return combiner(...selectors.map((sel) => sel(state)));
    },

    undo() {
      const prev = undoStack.pop();
      if (!prev) return false;
      redoStack.push(state);
      state = Object.freeze(clone(prev));
      persist();
      notify(state);
      return true;
    },

    redo() {
      const next = redoStack.pop();
      if (!next) return false;
      undoStack.push(state);
      state = Object.freeze(clone(next));
      persist();
      notify(state);
      return true;
    },

    canUndo() {
      return undoStack.length > 0;
    },

    canRedo() {
      return redoStack.length > 0;
    },

    /** 저장된 값으로 조용히 복원(히스토리에 남기지 않음) */
    hydrate(nextState) {
      isRestoring = true;
      state = Object.freeze(clone(nextState));
      notify(state);
      isRestoring = false;
    },
  };
}
