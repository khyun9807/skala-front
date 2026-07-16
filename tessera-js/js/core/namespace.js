/**
 * TesseraJS는 ES Module을 기본으로 하지만, <script type="module">을 쓰지 않는 페이지나
 * 브라우저 콘솔에서 즉석으로 실험하고 싶을 때를 위해 단일 전역 객체도 노출한다.
 * 전역 오염을 최소화하기 위해 이 함수 하나만 window에 직접 등록되고, 나머지는 전부
 * 그 아래 네임스페이스에 모인다.
 */
export function exposeGlobalNamespace(name, api) {
  if (typeof window === "undefined") return;
  if (window[name]) {
    console.warn(`[namespace] window.${name} already exists — overwriting.`);
  }
  window[name] = Object.freeze({ ...api });
}
