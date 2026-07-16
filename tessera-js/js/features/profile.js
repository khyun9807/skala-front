import { apiClient } from "../network/api-client.js";
import { localStore } from "../storage/local-storage.js";
import { downloadJSON } from "../files/file-exporter.js";
import { readAsJSON } from "../files/file-reader.js";
import { groupBy } from "../utils/array.js";
import { toggleFavorite, getFavorites } from "./favorites.js";

const DRAFT_KEY = "profile-draft";
const RECENT_KEY = "profile-recent-projects";
const FAVORITE_CATEGORY = "project";
const MAX_RECENT = 5;

export async function loadProfile(url = "../data/profile.json") {
  const { data } = await apiClient.get(url, { cache: { enabled: true, ttl: 10 * 60_000, staleWhileRevalidate: 60_000 } });
  return data;
}

export function getProfileDraft(fallback) {
  return localStore.get(DRAFT_KEY, fallback);
}

export function saveProfileDraft(profile) {
  localStore.set(DRAFT_KEY, profile);
}

export function clearProfileDraft() {
  localStore.remove(DRAFT_KEY);
}

export function exportProfileJSON(profile) {
  downloadJSON(profile, "profile-backup");
}

export async function importProfileJSON(file) {
  return readAsJSON(file);
}

export function recordRecentProject(projectId) {
  const recent = localStore.get(RECENT_KEY, []);
  const next = [projectId, ...recent.filter((id) => id !== projectId)].slice(0, MAX_RECENT);
  localStore.set(RECENT_KEY, next);
  return next;
}

export function getRecentProjects() {
  return localStore.get(RECENT_KEY, []);
}

export function toggleFavoriteProject(projectId) {
  return toggleFavorite(FAVORITE_CATEGORY, projectId);
}

export function getFavoriteProjects() {
  return getFavorites(FAVORITE_CATEGORY);
}

export function filterProjectsBySkill(projects, skill) {
  if (!skill) return projects;
  return projects.filter((project) => project.stack?.includes(skill));
}

export function searchProjects(projects, query) {
  const q = query.trim().toLowerCase();
  if (!q) return projects;
  return projects.filter((project) => project.title.toLowerCase().includes(q) || project.description.toLowerCase().includes(q));
}

/** 프로젝트들이 사용한 기술 스택 등장 빈도(캔버스 차트용 { labels, values }) */
export function computeSkillFrequency(projects) {
  const counts = new Map();
  for (const project of projects) {
    for (const skill of project.stack ?? []) {
      counts.set(skill, (counts.get(skill) ?? 0) + 1);
    }
  }
  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  return { labels: sorted.map(([label]) => label), values: sorted.map(([, value]) => value) };
}

export function groupTimelineByYear(timeline) {
  return groupBy(timeline, (entry) => new Date(entry.date).getFullYear());
}
