/**
 * [v4] myProfile.v4.html 전용 배선. 프로젝트 그리드/필터/모달/차트, 자기소개 임시저장,
 * JSON import/export를 TesseraJS의 features/profile.js로 구현한다.
 */
import "./toast.js";
import { showToast } from "../../tessera-js/js/features/notifications.js";
import {
  loadProfile,
  searchProjects,
  filterProjectsBySkill,
  computeSkillFrequency,
  saveProfileDraft,
  getProfileDraft,
  exportProfileJSON,
  importProfileJSON,
  toggleFavoriteProject,
  getFavoriteProjects,
  recordRecentProject,
  getRecentProjects,
} from "../../tessera-js/js/features/profile.js";
import { createChart } from "../../tessera-js/js/dom/canvas-charts.js";
import { debounce } from "../../tessera-js/js/utils/debounce.js";

let profileData = null;
let activeSkill = null;
let chartHandle = null;

function renderChips() {
  const wrap = document.getElementById("v4-skill-chips");
  wrap.textContent = "";
  profileData.skills.forEach((skill) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "aur-chip v4-skill-chip";
    chip.textContent = skill;
    if (skill === activeSkill) chip.classList.add("is-active");
    chip.addEventListener("click", () => {
      activeSkill = activeSkill === skill ? null : skill;
      renderChips();
      renderProjects();
    });
    wrap.appendChild(chip);
  });
}

function updateMeta() {
  document.getElementById("v4-favorite-count").textContent = String(getFavoriteProjects().length);
  document.getElementById("v4-recent-count").textContent = String(getRecentProjects().length);
}

function openModal(project) {
  recordRecentProject(project.id);
  updateMeta();
  const dialog = document.getElementById("v4-project-modal");
  document.getElementById("v4-modal-title").textContent = project.title;
  document.getElementById("v4-modal-desc").textContent = project.description;
  document.getElementById("v4-modal-dates").textContent = `${project.startDate} ~ ${project.endDate}`;

  const stackWrap = document.getElementById("v4-modal-stack");
  stackWrap.textContent = "";
  project.stack.forEach((skill) => {
    const tag = document.createElement("span");
    tag.className = "aur-tag";
    tag.textContent = skill;
    stackWrap.appendChild(tag);
  });

  document.getElementById("v4-modal-open-link").href = project.url;

  const favBtn = document.getElementById("v4-modal-favorite");
  function refreshFavBtn() {
    favBtn.textContent = getFavoriteProjects().includes(project.id) ? "★ 즐겨찾기 해제" : "☆ 즐겨찾기";
  }
  refreshFavBtn();
  favBtn.onclick = () => {
    toggleFavoriteProject(project.id);
    refreshFavBtn();
    renderProjects();
  };

  dialog.showModal();
}

function renderProjects() {
  const grid = document.getElementById("v4-project-grid");
  const query = document.getElementById("v4-project-search").value;
  let projects = filterProjectsBySkill(profileData.projects, activeSkill);
  projects = searchProjects(projects, query);
  grid.textContent = "";

  if (!projects.length) {
    const empty = document.createElement("div");
    empty.className = "aur-empty";
    empty.textContent = "조건에 맞는 프로젝트가 없습니다.";
    grid.appendChild(empty);
    updateMeta();
    return;
  }

  const favorites = getFavoriteProjects();
  projects.forEach((project) => {
    const card = document.createElement("article");
    card.className = "aur-card aur-card--tilt";
    card.style.cursor = "pointer";
    card.tabIndex = 0;

    if (favorites.includes(project.id)) {
      const star = document.createElement("span");
      star.className = "aur-badge aur-badge--warning aur-mb-2";
      star.textContent = "★ 즐겨찾기";
      card.appendChild(star);
    }

    const title = document.createElement("h3");
    title.textContent = project.title;
    const desc = document.createElement("p");
    desc.className = "aur-text-muted";
    desc.style.fontSize = "var(--aur-text-sm)";
    desc.textContent = project.description;
    const stackWrap = document.createElement("div");
    stackWrap.className = "aur-flex aur-gap-2 aur-mt-2";
    stackWrap.style.flexWrap = "wrap";
    project.stack.forEach((skill) => {
      const tag = document.createElement("span");
      tag.className = "aur-tag";
      tag.textContent = skill;
      stackWrap.appendChild(tag);
    });

    card.append(title, desc, stackWrap);
    card.addEventListener("click", () => openModal(project));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter") openModal(project);
    });
    grid.appendChild(card);
  });
  updateMeta();
}

function renderSkillChart() {
  const canvas = document.getElementById("v4-skill-chart");
  const { labels, values } = computeSkillFrequency(profileData.projects);
  if (chartHandle) chartHandle.update({ labels, values });
  else chartHandle = createChart(canvas, { type: "bar", labels, values });
}

function initEditForm() {
  const form = document.getElementById("v4-profile-edit-form");
  const draft = getProfileDraft(null);
  document.getElementById("v4-tagline").value = draft?.tagline ?? profileData.tagline;
  document.getElementById("v4-bio").value = draft?.bio ?? profileData.bio;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    saveProfileDraft({ tagline: document.getElementById("v4-tagline").value, bio: document.getElementById("v4-bio").value });
    document.getElementById("v4-draft-status").textContent = `임시 저장됨 (${new Date().toLocaleTimeString("ko-KR")})`;
    showToast("자기소개가 임시 저장되었습니다.", { type: "success" });
  });
}

function initFileActions() {
  document.getElementById("v4-export-json").addEventListener("click", () => exportProfileJSON(profileData));
  document.getElementById("v4-import-json").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      profileData = await importProfileJSON(file);
      renderChips();
      renderProjects();
      renderSkillChart();
      showToast("프로필 JSON을 가져왔습니다.", { type: "success" });
    } catch (error) {
      showToast(error.message, { type: "error" });
    } finally {
      event.target.value = "";
    }
  });
}

async function init() {
  profileData = await loadProfile("../tessera-js/data/profile.json");
  renderChips();
  renderProjects();
  renderSkillChart();
  initEditForm();
  initFileActions();
  document.getElementById("v4-project-search").addEventListener("input", debounce(renderProjects, 200));
}

init();
