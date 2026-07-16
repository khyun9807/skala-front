export function isTypingContext(target) {
  const tag = target?.tagName;
  return Boolean(target?.isContentEditable) || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

/**
 * "ctrl+k", "meta+k", "shift+enter", "escape", "arrowdown" 같은 콤보 문자열이
 * 실제 keydown 이벤트와 일치하는지 검사한다. ctrl/cmd(meta)는 하나로 취급해 맥/윈도우를 함께 지원한다.
 */
export function matchCombo(event, combo) {
  const parts = combo.toLowerCase().split("+");
  const key = parts.pop();
  const needsCtrlOrMeta = parts.includes("ctrl") || parts.includes("cmd") || parts.includes("meta");
  const needsShift = parts.includes("shift");
  const needsAlt = parts.includes("alt");

  const eventKey = event.key.toLowerCase();
  const keyMatches = eventKey === key || (key === "esc" && eventKey === "escape") || (key === "?" && eventKey === "?");
  const ctrlMatches = needsCtrlOrMeta ? event.ctrlKey || event.metaKey : !(event.ctrlKey || event.metaKey);
  const shiftMatches = needsShift ? event.shiftKey : !event.shiftKey;
  const altMatches = needsAlt ? event.altKey : !event.altKey;

  return keyMatches && ctrlMatches && shiftMatches && altMatches;
}

export function onKeydown(handler, { target = document } = {}) {
  target.addEventListener("keydown", handler);
  return () => target.removeEventListener("keydown", handler);
}
