/* ─────────────────────────────────────────────────────────────
   script/folio/signup-result.js — signup-result.html 배선
   signup.html의 네이티브 GET 제출로 넘어온 location.search를 읽어 개인화 환영을
   그리고, 방금 생성된 계정이 실제로 저장됐는지 auth.isUsernameAvailable로 확인한다.
   (참조: script/v4/signUpResult.js)
   ───────────────────────────────────────────────────────────── */
import { initPage } from './page.js';
import { isUsernameAvailable } from '../../tessera-js/js/features/auth.js';

initPage();

const INTEREST_LABELS = {
  frontend: '웹 프론트엔드', uiux: 'UI/UX 디자인', backend: '백엔드 & 데이터베이스', cloud: '클라우드 & 인프라',
};

function buildRow(label, value) {
  const tr = document.createElement('tr');
  const th = document.createElement('th'); th.scope = 'row'; th.textContent = label;
  const td = document.createElement('td'); td.textContent = value || '-';
  tr.append(th, td);
  return tr;
}

(async function init() {
  const params = new URLSearchParams(window.location.search);
  const userName = params.get('userName');
  const userId = params.get('userId');
  const userEmailId = params.get('userEmailId');
  const emailDomain = params.get('emailDomainInput');
  const interests = params.getAll('interest').map((v) => INTEREST_LABELS[v] ?? v);
  const introduce = params.get('introduce');
  const displayName = userName || userId || '회원';

  document.getElementById('welcome-title').textContent = `${displayName}님,\n환영합니다`;
  document.getElementById('welcome-sub').textContent = userId
    ? `아이디 "${userId}"로 SKALA-FRONT 회원이 되신 것을 환영합니다.`
    : 'SKALA-FRONT 회원이 되신 것을 환영합니다.';

  const table = document.getElementById('submitted-table');
  table.append(
    buildRow('이름', userName),
    buildRow('아이디', userId),
    buildRow('이메일', userEmailId ? `${userEmailId}@${emailDomain || 'example.com'}` : ''),
    buildRow('관심 분야', interests.join(', ')),
    buildRow('가입 인사', introduce),
  );

  const statusEl = document.getElementById('account-status');
  if (!userId) { statusEl.hidden = true; return; }
  try {
    const stillAvailable = await isUsernameAvailable(userId);
    statusEl.hidden = false;
    if (!stillAvailable) {
      statusEl.textContent = '✅ 계정이 안전하게 생성되었습니다 (WebCrypto SHA-256 해시 저장)';
      statusEl.classList.add('aur-badge--success');
    } else {
      statusEl.textContent = '⚠ 계정 생성 확인 실패 (이 페이지로 직접 접속한 경우일 수 있어요)';
      statusEl.classList.add('aur-badge--warning');
    }
  } catch { statusEl.hidden = true; }
})();
