import { initApp } from "../app.js";
import { qs, createElement, renderEmptyState } from "../dom/selector.js";
import { observeIntersection } from "../dom/observers.js";
import { apiClient } from "../network/api-client.js";
import { debounce } from "../utils/debounce.js";
import { relativeTime } from "../utils/date.js";
import {
  seedPostsIfEmpty,
  getAllPosts,
  filterByTag,
  searchPosts,
  sortPosts,
  paginatePosts,
  getBookmarks,
  isBookmarked,
  toggleBookmark,
  getRecentlyViewed,
  computeReadingTime,
  processScheduledPublishing,
} from "../features/blog.js";

const { lifecycle } = initApp({ pageName: "blog" });

const PAGE_SIZE = 4;
let currentPage = 1;
let allPosts = [];

async function fetchJSON(path) {
  const { data } = await apiClient.get(path, { cache: { enabled: true, ttl: 5 * 60_000 } });
  return data;
}

function getFilteredSorted() {
  const query = qs("#blog-search").value;
  const tag = qs("#blog-tag-filter").value;
  const sortKey = qs("#blog-sort").value;
  let posts = allPosts.filter((post) => post.status === "published");
  posts = filterByTag(posts, tag);
  posts = searchPosts(posts, query);
  return sortPosts(posts, sortKey);
}

function renderPostCard(post) {
  const bookmarkBtn = createElement("button", { class: "btn btn--sm", type: "button" }, [isBookmarked(post.id) ? "★ 북마크 해제" : "☆ 북마크"]);
  bookmarkBtn.addEventListener("click", () => {
    toggleBookmark(post.id);
    bookmarkBtn.textContent = isBookmarked(post.id) ? "★ 북마크 해제" : "☆ 북마크";
    renderBookmarks();
  });
  return createElement("article", { class: "card" }, [
    createElement("h3", {}, [createElement("a", { href: `blog-detail.html?id=${post.id}` }, [post.title])]),
    createElement("p", { class: "text-sm text-muted" }, [`${post.category} · ${computeReadingTime(post.content)} · 조회 ${post.viewCount ?? 0}`]),
    createElement(
      "div",
      { class: "row" },
      (post.tags ?? []).map((tag) => createElement("span", { class: "tag" }, [tag]))
    ),
    createElement("p", { class: "text-sm" }, [`${post.content.replace(/[#*`]/g, "").slice(0, 80)}...`]),
    bookmarkBtn,
  ]);
}

function renderPagination(totalPages) {
  const nav = qs("#blog-pagination");
  nav.textContent = "";
  for (let i = 1; i <= totalPages; i += 1) {
    const btn = createElement("button", { class: `btn btn--sm ${i === currentPage ? "btn--primary" : ""}`, type: "button" }, [String(i)]);
    btn.addEventListener("click", () => {
      currentPage = i;
      renderList();
    });
    nav.appendChild(btn);
  }
}

function renderList() {
  const el = qs("#blog-list");
  const filtered = getFilteredSorted();
  const { items, totalPages } = paginatePosts(filtered, currentPage, PAGE_SIZE);
  el.textContent = "";
  if (!items.length) renderEmptyState(el, { message: "검색 결과가 없습니다." });
  else items.forEach((post) => el.appendChild(renderPostCard(post)));
  renderPagination(totalPages);
}

function renderTagOptions() {
  const select = qs("#blog-tag-filter");
  const tags = [...new Set(allPosts.flatMap((post) => post.tags ?? []))];
  tags.forEach((tag) => select.appendChild(createElement("option", { value: tag }, [tag])));
}

function renderBookmarks() {
  const el = qs("#blog-bookmarks");
  const bookmarks = getBookmarks();
  el.textContent = "";
  if (!bookmarks.length) {
    renderEmptyState(el, { message: "북마크한 글이 없습니다." });
    return;
  }
  bookmarks.forEach((id) => {
    const post = allPosts.find((p) => p.id === id);
    if (post) el.appendChild(createElement("li", {}, [createElement("a", { href: `blog-detail.html?id=${id}` }, [post.title])]));
  });
}

function renderRecent() {
  const el = qs("#blog-recent");
  const recent = getRecentlyViewed();
  el.textContent = "";
  if (!recent.length) {
    renderEmptyState(el, { message: "아직 본 글이 없습니다." });
    return;
  }
  recent.forEach((id) => {
    const post = allPosts.find((p) => p.id === id);
    if (!post) return;
    el.appendChild(
      createElement("li", {}, [createElement("a", { href: `blog-detail.html?id=${id}` }, [post.title]), createElement("span", { class: "text-muted" }, [` · ${relativeTime(post.updatedAt)}`])])
    );
  });
}

let infiniteIndex = 0;
let infinitePosts = [];

function loadMoreInfinite() {
  const listEl = qs("#blog-infinite-list");
  const sentinel = qs("#blog-infinite-sentinel");
  const chunk = infinitePosts.slice(infiniteIndex, infiniteIndex + 2);
  chunk.forEach((post) => {
    listEl.appendChild(createElement("p", {}, [createElement("a", { href: `blog-detail.html?id=${post.id}` }, [post.title])]));
  });
  infiniteIndex += chunk.length;
  if (infiniteIndex >= infinitePosts.length) sentinel.textContent = "모든 글을 불러왔습니다.";
}

function initInfiniteScroll() {
  infinitePosts = sortPosts(
    allPosts.filter((post) => post.status === "published"),
    "latest"
  );
  const sentinel = qs("#blog-infinite-sentinel");
  const observer = observeIntersection(
    sentinel,
    (entries) => entries.forEach((entry) => entry.isIntersecting && loadMoreInfinite()),
    { threshold: 0.9 }
  );
  lifecycle.onCleanup(() => observer.disconnect());
  loadMoreInfinite();
}

async function init() {
  await seedPostsIfEmpty(() => fetchJSON("../data/blog-posts.json"));
  await processScheduledPublishing();
  allPosts = await getAllPosts();
  renderTagOptions();
  renderList();
  renderBookmarks();
  renderRecent();
  initInfiniteScroll();

  qs("#blog-search").addEventListener(
    "input",
    debounce(() => {
      currentPage = 1;
      renderList();
    }, 250)
  );
  qs("#blog-sort").addEventListener("change", () => {
    currentPage = 1;
    renderList();
  });
  qs("#blog-tag-filter").addEventListener("change", () => {
    currentPage = 1;
    renderList();
  });
}

init();
