/* ─────────────────────────────────────────────────────────────
   script/folio/profile.js — profile.html 배선
   요구된 ul/ol/dl(정적 마크업)은 그대로 두고, 프로젝트 아카이브(그리드·검색·필터·
   모달·Canvas 스킬차트·즐겨찾기·JSON import/export·bio 임시저장)를 TesseraJS로 구동.
   (참조: script/v4/myProfile.js)
   ───────────────────────────────────────────────────────────── */
import './toast.js';
import { initPage } from './page.js';
import { showToast } from '../../tessera-js/js/features/notifications.js';
import {
  loadProfile, searchProjects, filterProjectsBySkill, computeSkillFrequency,
  saveProfileDraft, getProfileDraft, clearProfileDraft, exportProfileJSON, importProfileJSON,
  toggleFavoriteProject, getFavoriteProjects, recordRecentProject, getRecentProjects,
} from '../../tessera-js/js/features/profile.js';
import { runOnceForVersion } from './reseed.js';
import { createChart } from '../../tessera-js/js/dom/canvas-charts.js';
import { debounce } from '../../tessera-js/js/utils/debounce.js';

initPage();

let profileData = null;
let activeSkill = null;
let chartHandle = null;
const dialog = document.getElementById('project-modal');

function renderChips() {
  const wrap = document.getElementById('skill-chips');
  wrap.textContent = '';
  profileData.skills.forEach((skill) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'folio-chip';
    chip.dataset.cursor = 'filter';
    chip.textContent = skill;
    if (skill === activeSkill) chip.classList.add('is-active');
    chip.addEventListener('click', () => {
      activeSkill = activeSkill === skill ? null : skill;
      renderChips(); renderProjects();
    });
    wrap.appendChild(chip);
  });
}

function updateMeta() {
  document.getElementById('favorite-count').textContent = String(getFavoriteProjects().length);
  document.getElementById('recent-count').textContent = String(getRecentProjects().length);
}

function openModal(project) {
  recordRecentProject(project.id);
  updateMeta();
  document.getElementById('modal-title').textContent = project.title;
  document.getElementById('modal-desc').textContent = project.description;
  document.getElementById('modal-dates').textContent = `${project.startDate} ~ ${project.endDate}`;
  const stackWrap = document.getElementById('modal-stack');
  stackWrap.textContent = '';
  project.stack.forEach((skill) => { const t = document.createElement('span'); t.className = 'aur-tag'; t.textContent = skill; stackWrap.appendChild(t); });
  document.getElementById('modal-open-link').href = project.url;
  const favBtn = document.getElementById('modal-favorite');
  const refresh = () => { favBtn.textContent = getFavoriteProjects().includes(project.id) ? '★ 즐겨찾기 해제' : '☆ 즐겨찾기'; };
  refresh();
  favBtn.onclick = () => { toggleFavoriteProject(project.id); refresh(); renderProjects(); };
  dialog.showModal();
}

function renderProjects() {
  const grid = document.getElementById('project-grid');
  const query = document.getElementById('project-search').value;
  let projects = filterProjectsBySkill(profileData.projects, activeSkill);
  projects = searchProjects(projects, query);
  grid.textContent = '';
  if (!projects.length) { const e = document.createElement('p'); e.style.opacity = '.5'; e.textContent = '조건에 맞는 프로젝트가 없습니다.'; grid.appendChild(e); updateMeta(); return; }
  const favorites = getFavoriteProjects();
  projects.forEach((project) => {
    const card = document.createElement('article');
    card.className = 'folio-block folio-block--click';
    card.tabIndex = 0;
    card.dataset.cursor = 'open';
    if (favorites.includes(project.id)) { const s = document.createElement('span'); s.className = 'folio-star'; s.textContent = '★ 즐겨찾기'; card.appendChild(s); }
    const h = document.createElement('h3'); h.textContent = project.title;
    const d = document.createElement('p'); d.style.cssText = 'font-size:13px;opacity:.7;line-height:1.6'; d.textContent = project.description;
    const stack = document.createElement('div'); stack.className = 'folio-tags';
    project.stack.forEach((skill) => { const t = document.createElement('span'); t.className = 'aur-tag'; t.textContent = skill; stack.appendChild(t); });
    card.append(h, d, stack);
    card.addEventListener('click', () => openModal(project));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter') openModal(project); });
    grid.appendChild(card);
  });
  updateMeta();
}

function renderSkillChart() {
  const canvas = document.getElementById('skill-chart');
  const { labels, values } = computeSkillFrequency(profileData.projects);
  if (chartHandle) chartHandle.update({ labels, values });
  else chartHandle = createChart(canvas, { type: 'bar', labels, values });
}

function initEditForm() {
  const form = document.getElementById('profile-edit-form');
  // 데모 시절 임시저장 초안이 남아 있으면 실제 프로필(profile.json)을 덮어쓰므로 시드 버전당 1회 정리
  runOnceForVersion('profile-draft', clearProfileDraft);
  const draft = getProfileDraft(null);
  document.getElementById('edit-tagline').value = draft?.tagline ?? profileData.tagline ?? '';
  document.getElementById('edit-bio').value = draft?.bio ?? profileData.bio ?? '';
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveProfileDraft({ tagline: document.getElementById('edit-tagline').value, bio: document.getElementById('edit-bio').value });
    document.getElementById('draft-status').textContent = `임시 저장됨 (${new Date().toLocaleTimeString('ko-KR')})`;
    showToast('자기소개가 임시 저장되었습니다.', { type: 'success' });
  });
}

function initFileActions() {
  document.getElementById('export-json').addEventListener('click', () => exportProfileJSON(profileData));
  document.getElementById('import-json').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      profileData = await importProfileJSON(file);
      renderChips(); renderProjects(); renderSkillChart();
      showToast('프로필 JSON을 가져왔습니다.', { type: 'success' });
    } catch (err) { showToast(err.message, { type: 'error' }); }
    finally { e.target.value = ''; }
  });
}

// 모달 닫기 (dialog 네이티브 + backdrop 클릭)
dialog.querySelector('[data-modal-close]').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

(async function init() {
  profileData = await loadProfile('../tessera-js/data/profile.json');
  renderChips(); renderProjects(); renderSkillChart(); initEditForm(); initFileActions();
  document.getElementById('project-search').addEventListener('input', debounce(renderProjects, 200));
})();
