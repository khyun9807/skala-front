/**
 * 순수 함수: 여러 필드에 걸친 통합 검색 스코어링. DOM에 의존하지 않아
 * 메인 스레드(폴백)와 검색 Worker(js/workers/search-worker.js) 양쪽에서 재사용한다.
 */
function normalize(text) {
  return String(text ?? "")
    .toLowerCase()
    .trim()
    .normalize("NFC");
}

function scoreField(value, query) {
  if (!value) return 0;
  if (value === query) return 10;
  if (value.startsWith(query)) return 5;
  if (value.includes(query)) return 2;
  return 0;
}

export function scoreSearch({ query, items, fields }) {
  const q = normalize(query);
  if (!q) return [];
  return items
    .map((item) => ({
      item,
      score: fields.reduce((total, field) => total + scoreField(normalize(item[field]), q), 0),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);
}
