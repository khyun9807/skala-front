import { escapeHtml, stripHtmlTags } from "./security.js";

export { escapeHtml, stripHtmlTags };

export function truncate(text = "", maxLength = 80, suffix = "…") {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - suffix.length)}${suffix}`;
}

export function slugify(text = "") {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s가-힣-]/g, "")
    .replace(/\s+/g, "-");
}

export function capitalize(text = "") {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

export function toCamelCase(text = "") {
  return text.replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""));
}

export function toKebabCase(text = "") {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

export function countWords(text = "") {
  const trimmed = stripHtmlTags(text).trim();
  if (!trimmed) return 0;
  // 한글은 공백 단위, 영문은 단어 단위로 대략 집계(완벽한 형태소 분석 대신 실용적 근사)
  return trimmed.split(/\s+/).filter(Boolean).length;
}

/**
 * 검색어와 일치하는 부분을 { text, matched } 세그먼트 배열로 쪼갠다.
 * 렌더링할 때 matched=true인 세그먼트만 <mark>로 감싸면 안전하게 하이라이트할 수 있다.
 */
export function splitByMatch(text = "", query = "") {
  if (!query) return [{ text, matched: false }];
  const lower = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const segments = [];
  let cursor = 0;
  let idx = lower.indexOf(lowerQuery, cursor);
  while (idx !== -1) {
    if (idx > cursor) segments.push({ text: text.slice(cursor, idx), matched: false });
    segments.push({ text: text.slice(idx, idx + query.length), matched: true });
    cursor = idx + query.length;
    idx = lower.indexOf(lowerQuery, cursor);
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), matched: false });
  return segments;
}

export function normalizeSearchTerm(text = "") {
  return text.trim().toLowerCase().normalize("NFC");
}

/** 간단한 문자열 해시(FNV-1a 변형). Mock 데이터를 입력값에 따라 "그럴듯하게 일관되게" 만들 때 사용 */
export function hashString(text = "") {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
