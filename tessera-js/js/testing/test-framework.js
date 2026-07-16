/**
 * 외부 테스트 라이브러리 없이 만든 최소 테스트 러너.
 * describe/test로 스위트를 구성하고, expect(...).toBe/toEqual/toBeTruthy/toBeFalsy/toThrow로 단언한다.
 */
const registry = { suites: [], currentSuite: null };

export function describe(name, fn) {
  const suite = { name, tests: [] };
  registry.suites.push(suite);
  const previous = registry.currentSuite;
  registry.currentSuite = suite;
  fn();
  registry.currentSuite = previous;
}

export function test(name, fn) {
  if (!registry.currentSuite) throw new Error("test()는 반드시 describe() 콜백 안에서 호출해야 합니다.");
  registry.currentSuite.tests.push({ name, fn });
}

function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (typeof a === "object") {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => deepEqual(a[key], b[key]));
  }
  return false;
}

export function expect(actual) {
  return {
    toBe(expected) {
      if (!Object.is(actual, expected)) throw new Error(`expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
    },
    toEqual(expected) {
      if (!deepEqual(actual, expected)) throw new Error(`expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
    },
    toBeTruthy() {
      if (!actual) throw new Error(`expected ${JSON.stringify(actual)} to be truthy`);
    },
    toBeFalsy() {
      if (actual) throw new Error(`expected ${JSON.stringify(actual)} to be falsy`);
    },
    async toThrow() {
      let threw = false;
      try {
        await actual();
      } catch {
        threw = true;
      }
      if (!threw) throw new Error("expected function to throw, but it did not");
    },
  };
}

export async function runAll({ onProgress = () => {} } = {}) {
  const results = [];
  for (const suite of registry.suites) {
    for (const testCase of suite.tests) {
      try {
        await testCase.fn();
        results.push({ suite: suite.name, test: testCase.name, passed: true });
      } catch (error) {
        results.push({ suite: suite.name, test: testCase.name, passed: false, message: error.message });
      }
      onProgress(results.at(-1));
    }
  }
  const passed = results.filter((result) => result.passed).length;
  const failed = results.length - passed;
  if (console.table) console.table(results);
  return { results, passed, failed, total: results.length };
}

export function resetRegistry() {
  registry.suites = [];
  registry.currentSuite = null;
}
