/**
 * 외부 날짜 라이브러리 없이 Date + Intl만으로 구현한 날짜 유틸리티.
 * 브라우저 로컬 타임존을 기준으로 계산하며, ISO 문자열을 받을 때도 Date 파싱에 맡긴다.
 */
const MS = { SECOND: 1000, MINUTE: 60_000, HOUR: 3_600_000, DAY: 86_400_000 };

export function parseDate(input) {
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input;
  if (input === null || input === undefined) return null;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(date, { locale = "ko-KR", ...rest } = {}) {
  const d = parseDate(date);
  if (!d) return "";
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "2-digit", day: "2-digit", ...rest }).format(d);
}

export function formatTime(date, { locale = "ko-KR", ...rest } = {}) {
  const d = parseDate(date);
  if (!d) return "";
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", ...rest }).format(d);
}

export function formatDateTime(date, options = {}) {
  const d = parseDate(date);
  if (!d) return "";
  return `${formatDate(d, options)} ${formatTime(d, options)}`;
}

export function isSameDay(a, b) {
  const da = parseDate(a);
  const db = parseDate(b);
  return Boolean(da && db && da.toDateString() === db.toDateString());
}

export function isToday(date) {
  return isSameDay(date, new Date());
}

export function addDays(date, amount) {
  const d = parseDate(date);
  const result = new Date(d);
  result.setDate(result.getDate() + amount);
  return result;
}

export function addMinutes(date, amount) {
  const d = parseDate(date);
  const result = new Date(d);
  result.setMinutes(result.getMinutes() + amount);
  return result;
}

export function addMonths(date, amount) {
  const d = parseDate(date);
  const result = new Date(d);
  result.setMonth(result.getMonth() + amount);
  return result;
}

export function diffInDays(a, b) {
  return Math.round((parseDate(a) - parseDate(b)) / MS.DAY);
}

export function diffInMinutes(a, b) {
  return Math.round((parseDate(a) - parseDate(b)) / MS.MINUTE);
}

export function startOfWeek(date, { weekStartsOn = 0 } = {}) {
  const d = parseDate(date);
  const day = d.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  const result = new Date(d);
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - diff);
  return result;
}

export function endOfWeek(date, options) {
  return addDays(startOfWeek(date, options), 6);
}

export function startOfMonth(date) {
  const d = parseDate(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(date) {
  const d = parseDate(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function dateRange(start, end) {
  const result = [];
  let cursor = parseDate(start);
  const last = parseDate(end);
  while (cursor <= last) {
    result.push(new Date(cursor));
    cursor = addDays(cursor, 1);
  }
  return result;
}

const RELATIVE_UNITS = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
  ["second", 1],
];

export function relativeTime(date, { locale = "ko-KR" } = {}) {
  const d = parseDate(date);
  if (!d) return "";
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const diffSec = Math.round((d.getTime() - Date.now()) / 1000);
  for (const [unit, secondsInUnit] of RELATIVE_UNITS) {
    if (Math.abs(diffSec) >= secondsInUnit || unit === "second") {
      return rtf.format(Math.round(diffSec / secondsInUnit), unit);
    }
  }
  return "";
}

/** [aStart,aEnd) 와 [bStart,bEnd) 두 구간이 겹치는지(일정 충돌 검사에 사용) */
export function timeRangesOverlap(aStart, aEnd, bStart, bEnd) {
  return parseDate(aStart) < parseDate(bEnd) && parseDate(bStart) < parseDate(aEnd);
}

export function getTimezoneLabel(date = new Date(), locale = "ko-KR") {
  const part = new Intl.DateTimeFormat(locale, { timeZoneName: "short" }).formatToParts(date).find((p) => p.type === "timeZoneName");
  return part?.value ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** getDateFn(item)의 날짜(YYYY-MM-DD 형식 키)로 그룹핑 */
export function groupByDate(items, getDateFn) {
  const map = new Map();
  for (const item of items) {
    const d = parseDate(getDateFn(item));
    const key = d ? d.toISOString().slice(0, 10) : "unknown";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return map;
}

export function remainingTime(targetDate) {
  const target = parseDate(targetDate);
  const diffMs = target ? target.getTime() - Date.now() : 0;
  const clamped = Math.max(0, diffMs);
  return {
    totalMs: diffMs,
    days: Math.floor(clamped / MS.DAY),
    hours: Math.floor((clamped % MS.DAY) / MS.HOUR),
    minutes: Math.floor((clamped % MS.HOUR) / MS.MINUTE),
    seconds: Math.floor((clamped % MS.MINUTE) / MS.SECOND),
    isPast: diffMs <= 0,
  };
}

export function durationBetween(start, end) {
  const ms = Math.max(0, parseDate(end) - parseDate(start));
  return {
    ms,
    days: Math.floor(ms / MS.DAY),
    hours: Math.floor((ms % MS.DAY) / MS.HOUR),
    minutes: Math.floor((ms % MS.HOUR) / MS.MINUTE),
  };
}

export function toInputDateValue(date) {
  const d = parseDate(date);
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export function toInputDateTimeValue(date) {
  const d = parseDate(date);
  if (!d) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
