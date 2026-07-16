export function deepClone(value) {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(value);
    } catch {
      /* structuredClone이 함수/DOM 노드 등을 만나 실패하면 JSON 기반으로 폴백 */
    }
  }
  return JSON.parse(JSON.stringify(value));
}

export function deepMerge(target, source) {
  const result = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value) && typeof result[key] === "object") {
      result[key] = deepMerge(result[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function pick(obj, keys) {
  return Object.fromEntries(keys.filter((key) => key in obj).map((key) => [key, obj[key]]));
}

export function omit(obj, keys) {
  const excluded = new Set(keys);
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !excluded.has(key)));
}

export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value) || typeof value === "string") return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

export function deepFreeze(obj) {
  Object.values(obj).forEach((value) => {
    if (value && typeof value === "object" && !Object.isFrozen(value)) deepFreeze(value);
  });
  return Object.freeze(obj);
}

export function getPath(obj, path, fallback) {
  const value = path.split(".").reduce((acc, key) => (acc === null || acc === undefined ? undefined : acc[key]), obj);
  return value === undefined ? fallback : value;
}

export function setPath(obj, path, value) {
  const keys = path.split(".");
  const result = deepClone(obj);
  let cursor = result;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cursor[key] = value;
    } else {
      if (typeof cursor[key] !== "object" || cursor[key] === null) cursor[key] = {};
      cursor = cursor[key];
    }
  });
  return result;
}

/** 두 평면 객체의 변경된 키만 뽑아낸다(간단한 diff, 중첩 객체는 참조 비교) */
export function diffObjects(before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const diff = {};
  for (const key of keys) {
    if (!Object.is(before[key], after[key])) diff[key] = { before: before[key], after: after[key] };
  }
  return diff;
}
