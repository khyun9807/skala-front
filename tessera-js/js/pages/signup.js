import { initApp, renderToast } from "../app.js";
import { qs } from "../dom/selector.js";
import { validators, validateForm, validateField, passwordStrength } from "../utils/validation.js";
import { debounce } from "../utils/debounce.js";
import { sessionStore } from "../storage/session-storage.js";
import { apiClient } from "../network/api-client.js";
import { signUp, isUsernameAvailable, seedUsersIfEmpty } from "../features/auth.js";
import { validateFile } from "../files/file-reader.js";
import { loadImageFromFile, createThumbnail, canvasToDataURL } from "../files/image.js";

initApp({ pageName: "signup" });

const DRAFT_KEY = "signup-draft";
const form = qs("#signup-form");
let avatarDataUrl = null;
let submitting = false;

const schema = {
  name: [validators.required("이름을 입력해주세요.")],
  username: [
    validators.required("아이디를 입력해주세요."),
    validators.minLength(3, "아이디는 3자 이상이어야 합니다."),
    validators.asyncValidator((value) => isUsernameAvailable(value), "이미 사용 중인 아이디입니다."),
  ],
  email: [validators.required("이메일을 입력해주세요."), validators.email()],
  password: [validators.required("비밀번호를 입력해주세요."), validators.password()],
  passwordConfirm: [validators.required("비밀번호 확인을 입력해주세요."), validators.passwordConfirmation("password")],
  birthDate: [validators.required("생년월일을 입력해주세요."), validators.date()],
  agreedToTerms: [validators.custom((value) => value === true, "약관에 동의해야 합니다.")],
};

function collectFormValues() {
  const formData = new FormData(form);
  return {
    name: formData.get("name") ?? "",
    username: formData.get("username") ?? "",
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
    passwordConfirm: formData.get("passwordConfirm") ?? "",
    birthDate: formData.get("birthDate") ?? "",
    interests: formData.getAll("interests"),
    travelPreferences: formData.getAll("travelPreferences"),
    agreedToTerms: form.agreedToTerms.checked,
  };
}

async function validateSingleField(field) {
  const values = collectFormValues();
  const errors = await validateField(values[field], schema[field], values);
  const errorEl = qs(`[data-error-for="${field}"]`);
  if (errorEl) errorEl.textContent = errors[0] ?? "";
  return errors.length === 0;
}

function restoreDraft() {
  const draft = sessionStore.get(DRAFT_KEY, null);
  if (!draft) return;
  form.name.value = draft.name ?? "";
  form.username.value = draft.username ?? "";
  form.email.value = draft.email ?? "";
  form.birthDate.value = draft.birthDate ?? "";
  (draft.interests ?? []).forEach((value) => {
    const checkbox = form.querySelector(`[name="interests"][value="${value}"]`);
    if (checkbox) checkbox.checked = true;
  });
  (draft.travelPreferences ?? []).forEach((value) => {
    const checkbox = form.querySelector(`[name="travelPreferences"][value="${value}"]`);
    if (checkbox) checkbox.checked = true;
  });
}

const saveDraft = debounce(() => {
  const { password, passwordConfirm, ...safeValues } = collectFormValues();
  sessionStore.set(DRAFT_KEY, safeValues);
}, 400);

function initUsernameCheck() {
  const status = qs("#signup-username-status");
  const check = debounce(async () => {
    const value = form.username.value.trim();
    if (value.length < 3) {
      status.textContent = "";
      return;
    }
    status.textContent = "확인 중...";
    try {
      const available = await isUsernameAvailable(value);
      status.textContent = available ? "사용 가능한 아이디입니다." : "이미 사용 중인 아이디입니다.";
    } catch (error) {
      status.textContent = "확인할 수 없습니다. 잠시 후 다시 입력해보세요.";
    }
  }, 400);
  form.username.addEventListener("input", check);
}

function initPasswordStrength() {
  form.password.addEventListener("input", () => {
    const { score, label } = passwordStrength(form.password.value);
    qs("#signup-password-strength-bar").style.width = `${(score / 5) * 100}%`;
    qs("#signup-password-strength-label").textContent = label;
    if (form.passwordConfirm.value) validateSingleField("passwordConfirm");
  });
}

function initAvatarPreview() {
  const input = qs("#signup-avatar-input");
  input.addEventListener("change", async () => {
    const file = input.files[0];
    if (!file) return;
    try {
      validateFile(file, { accept: ["image/png", "image/jpeg", "image/webp"], maxSize: 3 * 1024 * 1024 });
      const img = await loadImageFromFile(file);
      const thumbnail = createThumbnail(img, 96);
      const previewCanvas = qs("#signup-avatar-preview");
      previewCanvas.getContext("2d").drawImage(thumbnail, 0, 0);
      avatarDataUrl = canvasToDataURL(thumbnail);
    } catch (error) {
      renderToast({ message: error.message, type: "error" });
    }
  });
}

function initRealtimeValidation() {
  ["name", "email", "birthDate"].forEach((field) => form[field].addEventListener("blur", () => validateSingleField(field)));
  form.password.addEventListener("blur", () => validateSingleField("password"));
  form.passwordConfirm.addEventListener("blur", () => validateSingleField("passwordConfirm"));
  form.username.addEventListener("blur", () => validateSingleField("username"));
  form.addEventListener("input", saveDraft);
}

async function handleSubmit(event) {
  event.preventDefault();
  if (submitting) return;
  submitting = true;
  const submitBtn = qs("#signup-submit");
  submitBtn.disabled = true;
  submitBtn.textContent = "가입 처리 중...";
  let succeeded = false;

  try {
    const values = collectFormValues();
    // validateForm 자체도 실패할 수 있다(아이디 중복확인이 mock 서버 오류를 재시도 끝에 던지는 경우 등) —
    // 이 try 블록 안에 있어야 버튼이 "가입 처리 중..."에 영구히 멈추지 않는다.
    const { valid, errors } = await validateForm(values, schema);
    Object.keys(schema).forEach((field) => {
      const errorEl = qs(`[data-error-for="${field}"]`);
      if (errorEl) errorEl.textContent = errors[field]?.[0] ?? "";
    });

    if (!valid) {
      renderToast({ message: "입력값을 다시 확인해주세요.", type: "error" });
      return;
    }

    await signUp({ ...values, avatarDataUrl });
    sessionStore.remove(DRAFT_KEY);
    qs("#signup-result").textContent = "회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.";
    renderToast({ message: "회원가입 완료", type: "success" });
    succeeded = true;
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  } catch (error) {
    renderToast({ message: error.userMessage ?? error.message, type: "error" });
  } finally {
    submitting = false;
    if (!succeeded) {
      submitBtn.disabled = false;
      submitBtn.textContent = "가입하기";
    }
  }
}

async function init() {
  await seedUsersIfEmpty(async () => {
    const { data } = await apiClient.get("../data/mock-users.json");
    return data;
  });
  restoreDraft();
  initUsernameCheck();
  initPasswordStrength();
  initAvatarPreview();
  initRealtimeValidation();
  form.addEventListener("submit", handleSubmit);
}

init();
