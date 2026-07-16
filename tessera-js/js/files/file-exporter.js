import { objectsToCSV } from "./csv.js";
import { stringifyJSON } from "./json.js";

const UTF8_BOM = "﻿";

export function buildDatedFilename(prefix, extension) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  return `${prefix}-${stamp}.${extension}`;
}

/** Blob + Object URL을 만들어 다운로드시키고, 다운로드가 시작된 뒤 즉시 URL을 해제한다 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadText(text, filename) {
  downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), filename);
}

export function downloadJSON(data, prefix = "export") {
  const blob = new Blob([stringifyJSON(data)], { type: "application/json;charset=utf-8" });
  downloadBlob(blob, buildDatedFilename(prefix, "json"));
}

/** 엑셀에서 한글이 깨지지 않도록 UTF-8 BOM을 붙인 CSV */
export function downloadCSV(rows, { columns, prefix = "export" } = {}) {
  const csvString = Array.isArray(rows) ? objectsToCSV(rows, columns) : rows;
  const blob = new Blob([UTF8_BOM + csvString], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, buildDatedFilename(prefix, "csv"));
}

/**
 * 아주 단순한 ICS(iCalendar) 내보내기. 표준의 일부만 구현하지만 대부분의 캘린더 앱에서
 * VEVENT 하나짜리 일정을 인식하기에는 충분하다.
 */
export function downloadICS(events, prefix = "schedule") {
  const toICSDate = (iso) => new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//TesseraJS//Schedule//KO"];
  for (const event of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.id}@tessera-js`,
      `DTSTAMP:${toICSDate(new Date().toISOString())}`,
      `DTSTART:${toICSDate(event.startAt)}`,
      `DTEND:${toICSDate(event.endAt)}`,
      `SUMMARY:${(event.title ?? "").replace(/\n/g, " ")}`,
      `DESCRIPTION:${(event.description ?? "").replace(/\n/g, "\\n")}`,
      `LOCATION:${event.location ?? ""}`,
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  downloadBlob(new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" }), buildDatedFilename(prefix, "ics"));
}
