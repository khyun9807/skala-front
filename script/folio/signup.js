/* ─────────────────────────────────────────────────────────────
   script/folio/signup.js — signup.html 배선
   폼 구조/action/method="get"은 그대로 두고, 실시간 검증 + WebCrypto(SHA-256)
   계정 생성을 얹은 뒤 원래의 네이티브 GET 제출을 이어간다.
   (참조: script/v4/signUp.js — handleSubmit 전체를 try/finally로 감싸 어디서 던져도
    제출 버튼 상태가 복구되게 한다 = tessera 함정 #2)
   ───────────────────────────────────────────────────────────── */
import './toast.js';
import { initPage } from './page.js';
import { showToast } from '../../tessera-js/js/features/notifications.js';
import { signUp, isUsernameAvailable, seedUsersIfEmpty } from '../../tessera-js/js/features/auth.js';
import { passwordStrength } from '../../tessera-js/js/utils/validation.js';
import { sessionStore } from '../../tessera-js/js/storage/session-storage.js';
import { apiClient } from '../../tessera-js/js/network/api-client.js';
import { debounce } from '../../tessera-js/js/utils/debounce.js';

initPage();

const DRAFT_KEY = 'folio-signup-draft';
const form = document.getElementById('signup-form');

async function fetchJSON(path) {
  const { data } = await apiClient.get(path, { cache: { enabled: true, ttl: 5 * 60_000 } });
  return data;
}

function restoreDraft() {
  const draft = sessionStore.get(DRAFT_KEY, null);
  if (!draft) return;
  ['userId', 'userName', 'userEmailId', 'emailDomainInput', 'birthDate', 'introduce'].forEach((k) => {
    if (draft[k] && form[k]) form[k].value = draft[k];
  });
}
const saveDraft = debounce(() => {
  sessionStore.set(DRAFT_KEY, {
    userId: form.userId.value, userName: form.userName.value, userEmailId: form.userEmailId.value,
    emailDomainInput: form.emailDomainInput.value, birthDate: form.birthDate.value, introduce: form.introduce.value,
  });
}, 400);

function initUsernameCheck() {
  const status = document.getElementById('userid-status');
  const check = debounce(async () => {
    const value = form.userId.value.trim();
    if (value.length < 4) { status.textContent = ''; return; }
    status.textContent = '확인 중…';
    try {
      const available = await isUsernameAvailable(value);
      status.textContent = available ? '✅ 사용 가능한 아이디입니다.' : '❌ 이미 사용 중인 아이디입니다.';
    } catch { status.textContent = '확인할 수 없습니다. 잠시 후 다시 시도하세요.'; }
  }, 400);
  form.userId.addEventListener('input', check);
}

function initPasswordStrength() {
  form.userPw.addEventListener('input', () => {
    const { score, label } = passwordStrength(form.userPw.value);
    document.getElementById('pw-strength-fill').style.setProperty('--val', `${(score / 5) * 100}%`);
    const meter = document.getElementById('pw-meter');
    if (meter) { meter.value = score; meter.textContent = `${score} / 5`; }
    document.getElementById('pw-strength-label').textContent = form.userPw.value ? `강도: ${label}` : '';
  });
}

async function handleSubmit(event) {
  event.preventDefault();
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalLabel = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = '아이디 확인 중…';
  let succeeded = false;
  try {
    const userId = form.userId.value.trim();
    const available = await isUsernameAvailable(userId);
    if (!available) {
      document.getElementById('userid-status').textContent = '❌ 이미 사용 중인 아이디입니다.';
      form.userId.focus();
      showToast('이미 사용 중인 아이디입니다. 다른 아이디를 입력해주세요.', { type: 'error' });
      return;
    }
    submitBtn.textContent = '계정 생성 중…';
    const domain = form.emailDomainInput.value.trim() || 'example.com';
    await signUp({
      name: form.userName.value.trim() || userId,
      username: userId,
      email: `${form.userEmailId.value.trim()}@${domain}`,
      password: form.userPw.value,
      birthDate: form.birthDate.value || '2000-01-01',
      interests: Array.from(form.querySelectorAll('input[name="interest"]:checked')).map((el) => el.value),
      travelPreferences: [],
      agreedToTerms: true,
    });
    sessionStore.remove(DRAFT_KEY);
    showToast('계정이 안전하게 생성되었습니다 (WebCrypto SHA-256)! 결과 페이지로 이동합니다.', { type: 'success' });
    succeeded = true;
    // 네이티브 GET 제출 이어가기 (form.submit()은 submit 이벤트를 다시 발생시키지 않음)
    setTimeout(() => form.submit(), 550);
  } catch (error) {
    showToast(error.userMessage ?? error.message, { type: 'error' });
  } finally {
    if (!succeeded) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
  }
}

(async function init() {
  await seedUsersIfEmpty(() => fetchJSON('../tessera-js/data/mock-users.json'));
  restoreDraft();
  initUsernameCheck();
  initPasswordStrength();
  form.addEventListener('input', saveDraft);
  form.addEventListener('submit', handleSubmit);
})();
