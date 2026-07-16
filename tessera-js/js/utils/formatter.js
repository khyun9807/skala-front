const FILE_UNITS = ["B", "KB", "MB", "GB"];

export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) return "-";
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < FILE_UNITS.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)}${FILE_UNITS[unitIndex]}`;
}

/** ms를 mm:ss(또는 hh:mm:ss)로 표시. 스톱워치/뽀모도로/카운트다운 UI에 사용 */
export function formatDurationClock(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

export function truncateMiddle(text = "", maxLength = 24) {
  if (text.length <= maxLength) return text;
  const keep = Math.floor((maxLength - 3) / 2);
  return `${text.slice(0, keep)}...${text.slice(text.length - keep)}`;
}

export function formatReadingTime(wordCount, wordsPerMinute = 350) {
  const minutes = Math.max(1, Math.round(wordCount / wordsPerMinute));
  return `약 ${minutes}분`;
}
