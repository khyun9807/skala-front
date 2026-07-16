/**
 * DocumentFragment 기반 일괄 렌더링 유틸. 리스트를 새로 그릴 때마다 DOM에 한 번씩
 * 붙였다 떼지 않고, 오프스크린 fragment에서 전부 조립한 뒤 한 번만 교체해 reflow를 줄인다.
 */
export function renderList(root, items, renderItem, { keyAttr = "data-key", keyFn = (_item, idx) => idx } = {}) {
  const fragment = document.createDocumentFragment();
  items.forEach((item, idx) => {
    const el = renderItem(item, idx);
    if (!el) return;
    el.setAttribute(keyAttr, String(keyFn(item, idx)));
    fragment.appendChild(el);
  });
  root.textContent = "";
  root.appendChild(fragment);
}

export function batchAppend(root, buildFragment) {
  const fragment = document.createDocumentFragment();
  buildFragment(fragment);
  root.appendChild(fragment);
}

export function replaceChildren(root, ...nodes) {
  root.textContent = "";
  for (const node of nodes) root.appendChild(node);
}
