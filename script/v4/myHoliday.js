/**
 * [v4] myHoliday.v4.html 전용 배선. 정적 휴일 일과(아침/오후/저녁) 콘텐츠는 그대로 두고,
 * 그 아래 "이번 휴일에 하고 싶은 일" 체크리스트를 TesseraJS의 저장소/내보내기 모듈로 구동한다.
 * TesseraJS 라이브러리 소스는 건드리지 않고 기존 export만 재사용한다(다른 script/v4/*.js와 동일 원칙).
 */
import "./toast.js";
import { showToast } from "../../tessera-js/js/features/notifications.js";
import { localStore } from "../../tessera-js/js/storage/local-storage.js";
import { downloadJSON } from "../../tessera-js/js/files/file-exporter.js";

const STORAGE_KEY = "holiday-plans";

const SEED_PLANS = [
  { id: "seed-1", text: "동네 미술관 다녀오기", done: false },
  { id: "seed-2", text: "밀린 책 한 권 다 읽기", done: true },
  { id: "seed-3", text: "친구와 브런치 약속 잡기", done: false },
];

/** localStorage에서 계획 목록을 읽는다. 저장된 적이 없으면(null) 샘플로 시드한다. */
function loadPlans() {
  const stored = localStore.get(STORAGE_KEY, null);
  if (stored === null) {
    localStore.set(STORAGE_KEY, SEED_PLANS);
    return SEED_PLANS.map((p) => ({ ...p }));
  }
  return Array.isArray(stored) ? stored : [];
}

function savePlans(plans) {
  try {
    localStore.set(STORAGE_KEY, plans);
  } catch (error) {
    showToast(error.message || "저장에 실패했습니다.", { type: "error" });
  }
}

let plans = [];

/* ---- 순수 상태 조작 (DOM 비의존) ---- */
function addPlan(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  const id = (crypto.randomUUID && crypto.randomUUID()) || `plan-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  plans = [...plans, { id, text: trimmed, done: false }];
  savePlans(plans);
  return true;
}

function togglePlan(id) {
  plans = plans.map((p) => (p.id === id ? { ...p, done: !p.done } : p));
  savePlans(plans);
}

function removePlan(id) {
  plans = plans.filter((p) => p.id !== id);
  savePlans(plans);
}

/* ---- DOM 렌더 ---- */
function renderItem(plan) {
  const li = document.createElement("li");
  li.className = "v4-plan-item aur-flex aur-items-center aur-gap-2";
  li.dataset.id = plan.id;
  if (plan.done) li.classList.add("is-done");

  const label = document.createElement("label");
  label.className = "aur-checkbox";
  label.style.flex = "1";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = plan.done;
  checkbox.dataset.action = "toggle";

  const text = document.createElement("span");
  text.className = "v4-plan-text";
  text.textContent = plan.text;

  label.append(checkbox, text);

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "aur-btn aur-btn--icon aur-btn--sm";
  removeBtn.dataset.action = "remove";
  removeBtn.setAttribute("aria-label", `"${plan.text}" 삭제`);
  removeBtn.textContent = "✕";

  li.append(label, removeBtn);
  return li;
}

function render() {
  const list = document.getElementById("v4-plan-list");
  list.textContent = "";

  if (!plans.length) {
    const empty = document.createElement("li");
    empty.className = "aur-empty";
    empty.textContent = "아직 계획이 없습니다. 하고 싶은 일을 추가해보세요!";
    list.appendChild(empty);
  } else {
    plans.forEach((plan) => list.appendChild(renderItem(plan)));
  }

  const done = plans.filter((p) => p.done).length;
  document.getElementById("v4-plan-done").textContent = String(done);
  document.getElementById("v4-plan-total").textContent = String(plans.length);
  document.getElementById("v4-plan-remaining").textContent = String(plans.length - done);
}

/* ---- 이벤트 배선 ---- */
function initForm() {
  const form = document.getElementById("v4-plan-form");
  const input = document.getElementById("v4-plan-input");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (addPlan(input.value)) {
      input.value = "";
      render();
      showToast("휴일 계획을 추가했습니다.", { type: "success" });
    }
    input.focus();
  });

  document.getElementById("v4-plan-export").addEventListener("click", () => {
    downloadJSON(plans, "holiday-plans");
    showToast("휴일 계획을 JSON으로 내보냈습니다.", { type: "info" });
  });
}

function initListDelegation() {
  const list = document.getElementById("v4-plan-list");
  // 체크박스 토글
  list.addEventListener("change", (event) => {
    const checkbox = event.target.closest('input[data-action="toggle"]');
    if (!checkbox) return;
    const id = checkbox.closest("[data-id]")?.dataset.id;
    if (id) {
      togglePlan(id);
      render();
    }
  });
  // 삭제 버튼
  list.addEventListener("click", (event) => {
    const btn = event.target.closest('[data-action="remove"]');
    if (!btn) return;
    const id = btn.closest("[data-id]")?.dataset.id;
    if (id) {
      removePlan(id);
      render();
      showToast("계획을 삭제했습니다.", { type: "info" });
    }
  });
}

function init() {
  plans = loadPlans();
  render();
  initForm();
  initListDelegation();
}

init();
