/**
 * 학습용 최소 Cookie 유틸리티.
 *
 * 주의할 점(README에도 동일하게 설명):
 * - SameSite: "Lax"(기본)는 크로스사이트 top-level 네비게이션에만 쿠키를 보내 CSRF 위험을 줄인다.
 *   "Strict"는 더 엄격하고, "None"은 반드시 Secure와 함께 써야 크로스사이트 요청에도 전송된다.
 * - Secure: HTTPS 연결에서만 쿠키를 전송하게 강제한다. `file://`나 http에서 개발할 때는 빠질 수 있다.
 * - HttpOnly: 자바스크립트(document.cookie)로는 절대 설정할 수 없다. 반드시 서버 응답 헤더에서만
 *   설정 가능하며, 그래야 XSS로 스크립트가 탈취해도 쿠키 값을 읽을 수 없다. 이 모듈로 만드는 쿠키는
 *   전부 HttpOnly가 아니므로 절대 비밀번호나 세션 토큰 같은 민감 정보를 담지 않는다.
 */
export function setCookie(name, value, { days = 7, path = "/", sameSite = "Lax", secure = false } = {}) {
  const expires = new Date(Date.now() + days * 86_400_000).toUTCString();
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=${path}; SameSite=${sameSite}`;
  if (secure) cookie += "; Secure";
  document.cookie = cookie;
}

export function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${encodeURIComponent(name)}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function removeCookie(name, { path = "/" } = {}) {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
}

export function getAllCookies() {
  if (!document.cookie) return {};
  return Object.fromEntries(
    document.cookie.split("; ").map((pair) => {
      const [k, ...rest] = pair.split("=");
      return [decodeURIComponent(k), decodeURIComponent(rest.join("="))];
    })
  );
}
