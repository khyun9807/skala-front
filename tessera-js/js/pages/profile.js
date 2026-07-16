import { initApp, renderToast } from "../app.js";
import { qs, qsa, createElement, renderEmptyState } from "../dom/selector.js";
import { animateNumber } from "../dom/animation.js";
import { createChart, renderLegend } from "../dom/canvas-charts.js";
import { trapFocus } from "../dom/accessibility.js";
import { observeIntersection } from "../dom/observers.js";
import { downloadText } from "../files/file-exporter.js";
import { formatDate } from "../utils/date.js";
import { debounce } from "../utils/debounce.js";
import { globalShortcuts } from "../events/shortcuts.js";
import {
  loadProfile,
  getProfileDraft,
  saveProfileDraft,
  exportProfileJSON,
  importProfileJSON,
  recordRecentProject,
  getRecentProjects,
  toggleFavoriteProject,
  getFavoriteProjects,
  filterProjectsBySkill,
  searchProjects,
  computeSkillFrequency,
  groupTimelineByYear,
} from "../features/profile.js";

const { lifecycle } = initApp({ pageName: "profile" });

let profileData = null;
let activeSkillFilter = null;

function renderHeader(profile) {
  const el = qs("#profile-header");
  el.textContent = "";
  el.appendChild(createElement("img", { src: profile.avatar, alt: `${profile.name} 프로필 사진`, class: "avatar", style: "width:72px;height:72px;" }));
  el.appendChild(
    createElement("div", {}, [createElement("h1", {}, [profile.name]), createElement("p", { class: "text-muted" }, [profile.title]), createElement("p", {}, [profile.bio])])
  );
}

function renderCounters(profile) {
  const el = qs("#profile-counters");
  el.textContent = "";
  const stats = [
    { label: "프로젝트", value: profile.projects.length },
    { label: "기술 스택", value: profile.skills.length },
    { label: "타임라인", value: profile.timeline.length },
  ];
  stats.forEach((stat) => {
    const numberEl = createElement("strong", { style: "font-size:1.8rem;" }, ["0"]);
    el.appendChild(createElement("div", {}, [numberEl, createElement("p", { class: "text-muted text-sm" }, [stat.label])]));
    animateNumber(numberEl, { from: 0, to: stat.value, duration: 800 });
  });
}

function renderSkillChips(profile) {
  const el = qs("#profile-skill-chips");
  el.textContent = "";
  profile.skills.forEach((skill) => {
    const chip = createElement("button", { class: "tag skill-chip", type: "button", "aria-pressed": "false" }, [skill]);
    chip.addEventListener("click", () => {
      activeSkillFilter = activeSkillFilter === skill ? null : skill;
      qsa(".skill-chip", el).forEach((c) => c.setAttribute("aria-pressed", String(c.textContent === activeSkillFilter)));
      renderProjects();
    });
    el.appendChild(chip);
  });
}

function renderSkillChart(profile) {
  const canvas = qs("#profile-skill-chart");
  const { labels, values } = computeSkillFrequency(profile.projects);
  createChart(canvas, { type: "bar", labels, values });
  renderLegend(qs("#profile-skill-legend"), labels);
}

function renderTimeline(profile) {
  const el = qs("#profile-timeline");
  el.textContent = "";
  const grouped = groupTimelineByYear(profile.timeline);
  [...grouped.entries()]
    .sort((a, b) => b[0] - a[0])
    .forEach(([, entries]) => {
      entries.forEach((entry) => {
        el.appendChild(
          createElement("div", { class: "timeline__item" }, [
            createElement("p", { class: "text-muted text-sm" }, [formatDate(entry.date)]),
            createElement("h3", {}, [entry.title]),
            createElement("p", {}, [entry.description]),
          ])
        );
      });
    });
}

function updateProjectMeta() {
  qs("#profile-favorite-count").textContent = String(getFavoriteProjects().length);
  qs("#profile-recent-count").textContent = String(getRecentProjects().length);
}

function openProjectModal(project) {
  recordRecentProject(project.id);
  updateProjectMeta();
  const root = qs("#profile-modal-root");
  root.textContent = "";

  function closeModal() {
    releaseFocus();
    root.textContent = "";
    document.removeEventListener("tessera:escape", closeModal);
  }

  const modal = createElement("div", { class: "modal-overlay", role: "dialog", "aria-modal": "true", "aria-label": project.title }, [
    createElement("div", { class: "modal" }, [
      createElement("div", { class: "modal__header" }, [
        createElement("h3", {}, [project.title]),
        createElement("button", { class: "btn btn--sm btn--ghost", type: "button", "aria-label": "닫기", onclick: closeModal }, ["✕"]),
      ]),
      createElement("p", {}, [project.description]),
      createElement(
        "p",
        { class: "row" },
        project.stack.map((skill) => createElement("span", { class: "tag" }, [skill]))
      ),
      createElement("p", { class: "text-sm text-muted" }, [`${formatDate(project.startDate)} ~ ${formatDate(project.endDate)}`]),
      createElement("a", { class: "btn btn--sm btn--primary", href: project.url }, ["프로젝트 열기"]),
    ]),
  ]);
  root.appendChild(modal);
  const releaseFocus = trapFocus(modal.querySelector(".modal"));
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("tessera:escape", closeModal);
}

function renderProjects() {
  const el = qs("#profile-projects-grid");
  const query = qs("#profile-project-search").value;
  let projects = profileData.projects;
  projects = filterProjectsBySkill(projects, activeSkillFilter);
  projects = searchProjects(projects, query);
  el.textContent = "";
  if (!projects.length) {
    renderEmptyState(el, { message: "조건에 맞는 프로젝트가 없습니다." });
    return;
  }
  const favorites = getFavoriteProjects();
  projects.forEach((project) => {
    const isFav = favorites.includes(project.id);
    const favoriteBtn = createElement("button", { class: "btn btn--sm", type: "button" }, [isFav ? "★ 즐겨찾기 해제" : "☆ 즐겨찾기"]);
    favoriteBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleFavoriteProject(project.id);
      renderProjects();
    });
    const card = createElement("article", { class: "card project-card", tabindex: "0" }, [
      createElement("h3", {}, [project.title]),
      createElement("p", { class: "text-sm text-muted" }, [project.description]),
      createElement(
        "div",
        { class: "row" },
        project.stack.map((skill) => createElement("span", { class: "tag" }, [skill]))
      ),
      favoriteBtn,
    ]);
    card.addEventListener("click", () => openProjectModal(project));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter") openProjectModal(project);
    });
    el.appendChild(card);
  });
  updateProjectMeta();
}

function initSectionNav() {
  const sections = qsa("section[id^='section-']");
  const links = qsa("[data-section-link]");
  let currentIndex = 0;

  observeIntersection(
    sections,
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = sections.indexOf(entry.target);
          if (idx !== -1) currentIndex = idx;
          links.forEach((link) => link.setAttribute("aria-selected", String(link.dataset.sectionLink === entry.target.id)));
        }
      });
    },
    { threshold: 0.4 }
  );

  links.forEach((link) =>
    link.addEventListener("click", (event) => {
      event.preventDefault();
      qs(`#${link.dataset.sectionLink}`).scrollIntoView({ behavior: "smooth" });
    })
  );

  function goToSection(index) {
    const clamped = Math.max(0, Math.min(sections.length - 1, index));
    sections[clamped].scrollIntoView({ behavior: "smooth" });
  }

  lifecycle.onCleanup(globalShortcuts.register("arrowdown", () => goToSection(currentIndex + 1), { description: "다음 섹션으로 이동" }));
  lifecycle.onCleanup(globalShortcuts.register("arrowup", () => goToSection(currentIndex - 1), { description: "이전 섹션으로 이동" }));
}

function initFileActions(profile) {
  qs("#profile-copy-email").addEventListener("click", async () => {
    await navigator.clipboard.writeText(profile.contact.email);
    renderToast({ message: "이메일 주소를 복사했습니다.", type: "success" });
  });

  qs("#profile-download-resume").addEventListener("click", () => {
    const lines = [
      `${profile.name} — ${profile.title}`,
      profile.bio,
      "",
      `기술 스택: ${profile.skills.join(", ")}`,
      "",
      "프로젝트:",
      ...profile.projects.map((project) => `- ${project.title}: ${project.description}`),
    ];
    downloadText(lines.join("\n"), "resume.txt");
  });

  qs("#profile-export-json").addEventListener("click", () => exportProfileJSON(profile));

  qs("#profile-import-json").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      profileData = await importProfileJSON(file);
      renderAll();
      renderToast({ message: "프로필 JSON을 가져왔습니다.", type: "success" });
    } catch (error) {
      renderToast({ message: error.message, type: "error" });
    } finally {
      event.target.value = "";
    }
  });
}

function initEditForm(profile) {
  const form = qs("#profile-edit-form");
  const draft = getProfileDraft(null);
  form.tagline.value = draft?.tagline ?? profile.tagline;
  form.bio.value = draft?.bio ?? profile.bio;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    saveProfileDraft({ tagline: form.tagline.value, bio: form.bio.value });
    qs("#profile-draft-status").textContent = `임시 저장됨 (${new Date().toLocaleTimeString("ko-KR")})`;
    renderToast({ message: "임시 저장되었습니다.", type: "success" });
  });
}

function renderAll() {
  renderHeader(profileData);
  renderCounters(profileData);
  renderSkillChips(profileData);
  renderSkillChart(profileData);
  renderTimeline(profileData);
  renderProjects();
}

async function init() {
  try {
    profileData = await loadProfile("../data/profile.json");
    renderAll();
    initFileActions(profileData);
    initEditForm(profileData);
    initSectionNav();
    qs("#profile-project-search").addEventListener("input", debounce(renderProjects, 200));
  } catch (error) {
    renderToast({ message: "프로필을 불러오지 못했습니다.", type: "error" });
  }
}

init();
