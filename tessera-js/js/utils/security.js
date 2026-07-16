/**
 * XSS 방지를 위한 최소 유틸리티.
 * 원칙: 사용자 입력은 항상 textContent로 넣거나, HTML로 꼭 넣어야 한다면 반드시 escapeHtml을 거친다.
 * innerHTML은 이 라이브러리가 직접 만든 고정 템플릿에만 제한적으로 쓴다(js/dom/template.js 참고).
 */
const ESCAPE_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function escapeHtml(input = "") {
  return String(input).replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
}

/** 아주 단순한 태그 제거(요약/미리보기용). 신뢰할 수 없는 HTML을 렌더링용으로 정화하는 용도는 아님 */
export function stripHtmlTags(html = "") {
  return String(html).replace(/<[^>]*>/g, "");
}

export function maskEmail(email = "") {
  const [local, domain] = String(email).split("@");
  if (!domain) return "***";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(1, local.length - visible.length))}@${domain}`;
}

export function maskString(value = "", visibleStart = 2, visibleEnd = 0) {
  const str = String(value);
  if (str.length <= visibleStart + visibleEnd) return "*".repeat(str.length);
  const start = str.slice(0, visibleStart);
  const end = visibleEnd ? str.slice(-visibleEnd) : "";
  return `${start}${"*".repeat(str.length - visibleStart - visibleEnd)}${end}`;
}

/** crypto.getRandomValues 기반 랜덤 ID(비밀번호/토큰이 아닌 일반 식별자용) */
export function generateId(prefix = "id") {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${prefix}_${Date.now().toString(36)}${hex}`;
}

/**
 * 비밀번호를 Web Crypto API(SHA-256)로 해시한다. salt를 붙여 레인보우 테이블 공격을 어렵게 한다.
 * 주의: 이것은 학습용 클라이언트 해시로, 실제 서비스의 서버 측 인증(bcrypt/argon2 등 + HTTPS)을
 * 대체하지 못한다. README의 "보안 고려 사항"에 상세 설명이 있다.
 */
export async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
