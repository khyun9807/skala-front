/**
 * 외부 라이브러리 없는 최소 CSV 파서/직렬화기. 따옴표로 감싼 필드 안의 콤마/줄바꿈/이스케이프된
 * 따옴표("")를 처리한다.
 */
export function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

/** 헤더 행을 키로 사용해 객체 배열로 변환 */
export function csvToObjects(text) {
  const [header, ...rows] = parseCSV(text);
  if (!header) return [];
  return rows.map((row) => Object.fromEntries(header.map((key, i) => [key, row[i] ?? ""])));
}

function escapeCsvField(value) {
  const str = String(value ?? "");
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function objectsToCSV(rows, columns) {
  const cols = columns ?? (rows[0] ? Object.keys(rows[0]) : []);
  const lines = [cols.join(",")];
  for (const row of rows) {
    lines.push(cols.map((col) => escapeCsvField(row[col])).join(","));
  }
  return lines.join("\r\n");
}
