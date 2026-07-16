import { matchCombo, isTypingContext } from "./keyboard.js";

/**
 * 전역 단축키 레지스트리. document에 리스너 하나만 등록하고(이벤트 위임과 같은 취지),
 * IME 조합 중(event.isComposing)이거나 입력창에 포커스가 있을 때는 allowInInputs가 아닌 한 무시한다.
 */
export function createShortcutManager() {
  const registry = [];

  function register(combo, handler, { description = "", allowInInputs = false } = {}) {
    const entry = { combo, handler, description, allowInInputs };
    registry.push(entry);
    return () => {
      const idx = registry.indexOf(entry);
      if (idx !== -1) registry.splice(idx, 1);
    };
  }

  function handleKeydown(event) {
    if (event.isComposing) return;
    const typing = isTypingContext(event.target);
    for (const entry of registry) {
      if (typing && !entry.allowInInputs) continue;
      if (matchCombo(event, entry.combo)) {
        event.preventDefault();
        entry.handler(event);
        break;
      }
    }
  }

  document.addEventListener("keydown", handleKeydown);

  return {
    register,
    list() {
      return registry.map(({ combo, description }) => ({ combo, description }));
    },
    destroy() {
      document.removeEventListener("keydown", handleKeydown);
    },
  };
}

/** 앱 전역에서 공유하는 단축키 매니저(페이지마다 새로 만들 필요 없이 register만 추가) */
export const globalShortcuts = createShortcutManager();
