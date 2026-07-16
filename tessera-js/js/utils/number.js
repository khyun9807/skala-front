export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function roundTo(value, decimals = 0) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function formatNumber(value, { locale = "ko-KR", ...rest } = {}) {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat(locale, rest).format(value);
}

export function formatCurrency(value, currency = "KRW", { locale = "ko-KR" } = {}) {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: currency === "KRW" ? 0 : 2 }).format(value);
}

export function formatPercent(value, { locale = "ko-KR", digits = 1 } = {}) {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat(locale, { style: "percent", minimumFractionDigits: 0, maximumFractionDigits: digits }).format(value);
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function sum(numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

export function average(numbers) {
  return numbers.length ? sum(numbers) / numbers.length : 0;
}
