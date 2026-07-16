/* ─────────────────────────────────────────────────────────────
   script/folio/holiday.js — holiday.html 배선
   정적 휴일 일과(아침/오후/저녁, mark)는 그대로 두고, "이번 휴일에 하고 싶은 일"
   체크리스트를 TesseraJS 저장소/내보내기 모듈로 구동(라이브러리 소스는 안 건드림).
   localStorage 키 'holiday-plans'는 html/*.v4.html의 체크리스트와 공유한다
   (같은 오리진·같은 라이브러리 재사용 → 의도된 데이터 공유). (참조: script/v4/myHoliday.js)
   ───────────────────────────────────────────────────────────── */
import './toast.js';
import { initPage } from './page.js';
import { showToast } from '../../tessera-js/js/features/notifications.js';
import { localStore } from '../../tessera-js/js/storage/local-storage.js';
import { downloadJSON } from '../../tessera-js/js/files/file-exporter.js';

initPage();

const STORAGE_KEY = 'holiday-plans';
const SEED_PLANS = [
  { id: 'seed-1', text: '수육 맛집 다녀오기', done: false },
  { id: 'seed-2', text: '코딩 테스트 2문제 풀기', done: true },
  { id: 'seed-3', text: '아르헨티나 항공권 값 알아보기', done: false },
];

let plans = [];

/** 저장된 적이 없으면(null) 샘플로 시드. 빈 배열은 유효한 저장 상태라 재시드하지 않음. */
function loadPlans() {
  const stored = localStore.get(STORAGE_KEY, null);
  if (stored === null) {
    localStore.set(STORAGE_KEY, SEED_PLANS);
    return SEED_PLANS.map((p) => ({ ...p }));
  }
  return Array.isArray(stored) ? stored : [];
}

function savePlans() {
  try {
    localStore.set(STORAGE_KEY, plans);
  } catch (error) {
    showToast(error.message || '저장에 실패했습니다.', { type: 'error' });
  }
}

/* ── 순수 상태 조작 ── */
function addPlan(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  const id = (crypto.randomUUID && crypto.randomUUID()) || `plan-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  plans = [...plans, { id, text: trimmed, done: false }];
  savePlans();
  return true;
}
function togglePlan(id) {
  plans = plans.map((p) => (p.id === id ? { ...p, done: !p.done } : p));
  savePlans();
}
function removePlan(id) {
  plans = plans.filter((p) => p.id !== id);
  savePlans();
}

/* ── 렌더 ── */
function renderItem(plan) {
  const li = document.createElement('li');
  li.dataset.id = plan.id;
  if (plan.done) li.classList.add('is-done');

  const label = document.createElement('label');
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.checked = plan.done;
  cb.dataset.action = 'toggle';
  const text = document.createElement('span');
  text.textContent = plan.text;
  label.append(cb, text);

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'folio-holiday-checklist__del';
  del.dataset.action = 'remove';
  del.dataset.cursor = 'delete';
  del.setAttribute('aria-label', `"${plan.text}" 삭제`);
  del.textContent = '×';

  li.append(label, del);
  return li;
}

function render() {
  const list = document.getElementById('plan-list');
  list.textContent = '';
  if (!plans.length) {
    const empty = document.createElement('li');
    empty.className = 'folio-holiday-empty';
    empty.textContent = '아직 계획이 없습니다. 하고 싶은 일을 추가해보세요.';
    list.appendChild(empty);
  } else {
    plans.forEach((plan) => list.appendChild(renderItem(plan)));
  }
  const done = plans.filter((p) => p.done).length;
  document.getElementById('plan-done').textContent = String(done);
  document.getElementById('plan-total').textContent = String(plans.length);
  document.getElementById('plan-remaining').textContent = String(plans.length - done);
}

/* ── 이벤트 배선 ── */
const form = document.getElementById('holiday-plan-form');
const input = document.getElementById('plan-input');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (addPlan(input.value)) {
    input.value = '';
    render();
    showToast('휴일 계획을 추가했습니다.', { type: 'success' });
  }
  input.focus();
});

document.getElementById('plan-export').addEventListener('click', () => {
  downloadJSON(plans, 'holiday-plans');
  showToast('휴일 계획을 JSON으로 내보냈습니다.', { type: 'info' });
});

const list = document.getElementById('plan-list');
list.addEventListener('change', (event) => {
  const cb = event.target.closest('input[data-action="toggle"]');
  if (!cb) return;
  const id = cb.closest('[data-id]')?.dataset.id;
  if (id) { togglePlan(id); render(); }
});
list.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-action="remove"]');
  if (!btn) return;
  const id = btn.closest('[data-id]')?.dataset.id;
  if (id) { removePlan(id); render(); showToast('계획을 삭제했습니다.', { type: 'info' }); }
});

plans = loadPlans();
render();
