import { initApp, renderToast } from "../app.js";
import { qs } from "../dom/selector.js";
import { apiClient } from "../network/api-client.js";
import { login, seedUsersIfEmpty, consumeRedirectPath, isLoggedIn } from "../features/auth.js";

initApp({ pageName: "login" });

const form = qs("#login-form");
let submitting = false;

async function handleSubmit(event) {
  event.preventDefault();
  if (submitting) return;
  submitting = true;
  const submitBtn = qs("#login-submit");
  submitBtn.disabled = true;
  submitBtn.textContent = "로그인 중...";
  const errorEl = qs("#login-error");
  errorEl.textContent = "";

  const formData = new FormData(form);
  try {
    await login(formData.get("identifier"), formData.get("password"), { keepLoggedIn: form.keepLoggedIn.checked });
    renderToast({ message: "로그인되었습니다.", type: "success" });
    window.location.href = consumeRedirectPath("../index.html");
  } catch (error) {
    errorEl.textContent = error.userMessage ?? error.message;
    submitting = false;
    submitBtn.disabled = false;
    submitBtn.textContent = "로그인";
  }
}

async function init() {
  await seedUsersIfEmpty(async () => (await apiClient.get("../data/mock-users.json")).data);
  if (isLoggedIn()) {
    window.location.href = consumeRedirectPath("../index.html");
    return;
  }
  form.addEventListener("submit", handleSubmit);
}

init();
