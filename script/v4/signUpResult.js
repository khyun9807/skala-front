/**
 * [v4] signUpResult.v4.html 전용 배선. signUp.v4.html의 네이티브 GET 제출로 넘어온
 * location.search를 읽어 실제로 개인화된 환영 메시지를 그리고, 방금 생성된 계정이
 * 정말로 저장되었는지 features/auth.js의 isUsernameAvailable로 확인한다.
 */
import { isUsernameAvailable } from "../../tessera-js/js/features/auth.js";

const INTEREST_LABELS = {
  frontend: "웹 프론트엔드",
  uiux: "UI/UX 디자인",
  backend: "백엔드 & 데이터베이스",
  cloud: "클라우드 & 인프라",
};

function buildRow(label, value) {
  const tr = document.createElement("tr");
  const th = document.createElement("th");
  th.scope = "row";
  th.textContent = label;
  const td = document.createElement("td");
  td.textContent = value || "-";
  tr.append(th, td);
  return tr;
}

async function init() {
  const params = new URLSearchParams(window.location.search);
  const userName = params.get("userName");
  const userId = params.get("userId");
  const userEmailId = params.get("userEmailId");
  const emailDomain = params.get("emailDomainInput");
  const interests = params.getAll("interest").map((value) => INTEREST_LABELS[value] ?? value);
  const introduce = params.get("introduce");

  const displayName = userName || userId || "회원";
  document.getElementById("v4-welcome-title").textContent = `🎉 ${displayName}님, 회원가입을 진심으로 축하합니다!`;
  document.getElementById("v4-welcome-sub").textContent = userId
    ? `아이디 "${userId}"로 SKALA-FRONT 회원이 되신 것을 환영합니다.`
    : "SKALA-FRONT 회원이 되신 것을 환영합니다.";
  document.getElementById("v4-modal-welcome").textContent = `${displayName}님, 회원가입이 정상적으로 처리되었습니다!`;

  const table = document.getElementById("v4-submitted-table");
  table.appendChild(buildRow("이름", userName));
  table.appendChild(buildRow("아이디", userId));
  table.appendChild(buildRow("이메일", userEmailId ? `${userEmailId}@${emailDomain || "example.com"}` : ""));
  table.appendChild(buildRow("관심 분야", interests.join(", ")));
  table.appendChild(buildRow("가입 인사", introduce));

  const statusEl = document.getElementById("v4-account-status");
  if (!userId) {
    statusEl.hidden = true;
    return;
  }
  try {
    const stillAvailable = await isUsernameAvailable(userId);
    if (!stillAvailable) {
      statusEl.textContent = "✅ 계정이 안전하게 생성되었습니다 (Web Crypto SHA-256 해시 저장)";
      statusEl.classList.add("aur-badge--success");
    } else {
      statusEl.textContent = "⚠ 계정 생성 확인에 실패했습니다 (이 페이지로 직접 접속한 경우일 수 있어요).";
      statusEl.classList.add("aur-badge--warning");
    }
  } catch (error) {
    statusEl.hidden = true;
  }
}

init();
