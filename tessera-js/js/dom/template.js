import { escapeHtml } from "../utils/security.js";

/**
 * innerHTML을 안전하게 쓰기 위한 태그드 템플릿. 템플릿 문자열 자체는 개발자가 작성한
 * 고정 마크업이고, `${}`로 끼워 넣는 값은 기본적으로 escapeHtml을 거친다.
 * 정말로 이스케이프하지 않은 HTML을 넣어야 하면(신뢰된 고정 조각만) raw()로 명시적으로 감싼다.
 */
export function raw(value) {
  return { __raw: true, value: String(value) };
}

export function html(strings, ...values) {
  return strings.reduce((acc, str, i) => {
    if (i === 0) return str;
    const value = values[i - 1];
    let safe;
    if (value && typeof value === "object" && value.__raw) safe = value.value;
    else if (Array.isArray(value)) safe = value.map((v) => (v && v.__raw ? v.value : escapeHtml(String(v ?? "")))).join("");
    else safe = escapeHtml(String(value ?? ""));
    return acc + safe + str;
  }, strings[0]);
}

/** root.innerHTML을 html`` 결과로 교체한다(항상 escape된 안전한 문자열만 들어온다는 전제) */
export function renderTemplate(root, markup) {
  root.innerHTML = markup;
}
