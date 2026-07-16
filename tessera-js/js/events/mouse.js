import { delegate } from "../dom/selector.js";

export function onClick(root, selector, handler, options) {
  return delegate(root, "click", selector, handler, options);
}

export function onDblClick(root, selector, handler) {
  return delegate(root, "dblclick", selector, handler);
}

export function onMouseDown(root, selector, handler) {
  return delegate(root, "mousedown", selector, handler);
}

export function onWheel(root, selector, handler, options = { passive: true }) {
  return delegate(root, "wheel", selector, handler, options);
}

/** mouseenter/mouseleave는 버블링하지 않아 위임이 안 되므로 mouseover/mouseout + relatedTarget으로 대체 구현 */
export function onHover(root, selector, { onEnter, onLeave }) {
  function handleOver(event) {
    const matched = event.target.closest(selector);
    if (!matched || !root.contains(matched)) return;
    if (matched.contains(event.relatedTarget)) return;
    onEnter?.(event, matched);
  }
  function handleOut(event) {
    const matched = event.target.closest(selector);
    if (!matched || !root.contains(matched)) return;
    if (matched.contains(event.relatedTarget)) return;
    onLeave?.(event, matched);
  }
  root.addEventListener("mouseover", handleOver);
  root.addEventListener("mouseout", handleOut);
  return () => {
    root.removeEventListener("mouseover", handleOver);
    root.removeEventListener("mouseout", handleOut);
  };
}

export function trackMousePosition(onMove) {
  const handler = (event) => onMove({ x: event.clientX, y: event.clientY });
  document.addEventListener("mousemove", handler);
  return () => document.removeEventListener("mousemove", handler);
}

let activeMenu = null;
function closeContextMenu() {
  activeMenu?.remove();
  activeMenu = null;
}

/** 커스텀 우클릭 메뉴. items: [{ label, onSelect }] */
export function createContextMenu(root, selector, buildItems) {
  return delegate(root, "contextmenu", selector, (event, matchedEl) => {
    event.preventDefault();
    closeContextMenu();
    const menu = document.createElement("div");
    menu.className = "context-menu";
    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;
    for (const item of buildItems(matchedEl)) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "context-menu__item";
      btn.textContent = item.label;
      btn.addEventListener("click", () => {
        item.onSelect();
        closeContextMenu();
      });
      menu.appendChild(btn);
    }
    document.body.appendChild(menu);
    activeMenu = menu;
    setTimeout(() => document.addEventListener("click", closeContextMenu, { once: true }));
  });
}

/** hover preview 툴팁. getText(matchedEl)이 null을 반환하면 표시하지 않는다 */
export function attachTooltip(root, selector, getText) {
  let tooltipEl = null;
  function move(event) {
    if (!tooltipEl) return;
    tooltipEl.style.left = `${event.clientX + 12}px`;
    tooltipEl.style.top = `${event.clientY + 12}px`;
  }
  return onHover(root, selector, {
    onEnter: (event, matched) => {
      const text = getText(matched);
      if (!text) return;
      tooltipEl = document.createElement("div");
      tooltipEl.className = "tooltip";
      tooltipEl.textContent = text;
      tooltipEl.style.cssText =
        "position:fixed;pointer-events:none;background:#111;color:#fff;padding:4px 8px;border-radius:4px;font-size:12px;z-index:1000;";
      document.body.appendChild(tooltipEl);
      move(event);
      root.addEventListener("mousemove", move);
    },
    onLeave: () => {
      tooltipEl?.remove();
      tooltipEl = null;
      root.removeEventListener("mousemove", move);
    },
  });
}
