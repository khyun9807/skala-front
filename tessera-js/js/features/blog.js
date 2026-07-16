import { indexedDb } from "../storage/indexed-db.js";
import { localStore } from "../storage/local-storage.js";
import { createStore } from "../core/state-store.js";
import { eventBus } from "../core/event-bus.js";
import { escapeHtml } from "../utils/security.js";
import { slugify, countWords, normalizeSearchTerm } from "../utils/string.js";
import { formatReadingTime } from "../utils/formatter.js";
import { sortBy, paginate } from "../utils/array.js";
import { toggleFavorite, getFavorites, isFavorite } from "./favorites.js";
import { OBJECT_STORES, EVENTS } from "../config/constants.js";

const STORE = OBJECT_STORES.BLOG_POSTS;
const RECENT_KEY = "blog-recent";
const READING_POSITION_KEY = "blog-reading-position";
const MAX_RECENT = 10;

/** 최초 실행 시에만 data/blog-posts.json 시드를 IndexedDB에 채운다(Repository 패턴) */
export async function seedPostsIfEmpty(fetchSeed) {
  const count = await indexedDb.count(STORE);
  if (count > 0) return;
  const seed = await fetchSeed();
  await indexedDb.bulkPut(STORE, seed);
}

export function getAllPosts() {
  return indexedDb.getAll(STORE);
}

export function getPostById(id) {
  return indexedDb.get(STORE, id);
}

export async function upsertPost(post) {
  await indexedDb.put(STORE, post);
  eventBus.emit(EVENTS.BLOG_LOADED);
  return post;
}

/** 내용이 바뀌면 이전 버전을 revisions에 남기고 갱신한다(수정 이력) */
export async function updatePostContent(postId, patch) {
  const post = await getPostById(postId);
  if (!post) throw new Error(`post not found: ${postId}`);
  const revisions = [...(post.revisions ?? []), { content: post.content, title: post.title, savedAt: post.updatedAt ?? post.createdAt }];
  const updated = { ...post, ...patch, revisions, updatedAt: new Date().toISOString() };
  await indexedDb.put(STORE, updated);
  return updated;
}

export async function deletePost(id) {
  await indexedDb.delete(STORE, id);
}

export async function incrementViewCount(postId) {
  const post = await getPostById(postId);
  if (!post) return null;
  const updated = { ...post, viewCount: (post.viewCount ?? 0) + 1 };
  await indexedDb.put(STORE, updated);
  return updated;
}

export async function toggleLike(postId) {
  const likedIds = toggleFavorite("blog-like", postId);
  const isLiked = likedIds.includes(postId);
  const post = await getPostById(postId);
  const updated = { ...post, likeCount: Math.max(0, (post.likeCount ?? 0) + (isLiked ? 1 : -1)) };
  await indexedDb.put(STORE, updated);
  return { post: updated, isLiked };
}

export function toggleBookmark(postId) {
  const bookmarks = toggleFavorite("blog-bookmark", postId);
  eventBus.emit(EVENTS.BLOG_BOOKMARK_CHANGED, { postId });
  return bookmarks;
}

export function getBookmarks() {
  return getFavorites("blog-bookmark");
}

export function isBookmarked(postId) {
  return isFavorite("blog-bookmark", postId);
}

export function recordView(postId) {
  const recent = localStore.get(RECENT_KEY, []);
  localStore.set(RECENT_KEY, [postId, ...recent.filter((id) => id !== postId)].slice(0, MAX_RECENT));
}

export function getRecentlyViewed() {
  return localStore.get(RECENT_KEY, []);
}

export function saveReadingPosition(postId, progress) {
  const all = localStore.get(READING_POSITION_KEY, {});
  localStore.set(READING_POSITION_KEY, { ...all, [postId]: progress });
}

export function getReadingPosition(postId) {
  return localStore.get(READING_POSITION_KEY, {})[postId] ?? 0;
}

export function filterByTag(posts, tag) {
  return tag ? posts.filter((post) => post.tags?.includes(tag)) : posts;
}

export function filterByCategory(posts, category) {
  return category ? posts.filter((post) => post.category === category) : posts;
}

export function searchPosts(posts, query) {
  const q = normalizeSearchTerm(query);
  if (!q) return posts;
  return posts.filter((post) => post.title.toLowerCase().includes(q) || post.content.toLowerCase().includes(q));
}

export function sortPosts(posts, sortKey = "latest") {
  if (sortKey === "popular") return sortBy(posts, (post) => post.viewCount ?? 0, "desc");
  if (sortKey === "likes") return sortBy(posts, (post) => post.likeCount ?? 0, "desc");
  return sortBy(posts, (post) => new Date(post.publishedAt ?? post.createdAt).getTime(), "desc");
}

export function paginatePosts(posts, page, pageSize) {
  return paginate(posts, page, pageSize);
}

export function computeReadingTime(content) {
  return formatReadingTime(countWords(content));
}

/**
 * Markdown 서브셋(#~###, **bold**, *italic*, `code`, [text](url), - 목록)을 안전한 HTML로 변환한다.
 * 사용자 입력은 escapeHtml을 거친 뒤에만 태그로 감싸므로 스크립트 삽입이 불가능하다.
 * 반환값에 헤딩 기반 목차(toc)도 함께 담는다.
 */
export function parseMarkdownSubset(markdown = "") {
  const lines = markdown.split(/\r?\n/);
  const htmlParts = [];
  const toc = [];
  let listBuffer = [];
  const usedIds = new Set();

  function applyInline(escapedText) {
    return escapedText
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  }

  function flushList() {
    if (listBuffer.length > 0) {
      htmlParts.push(`<ul>${listBuffer.map((item) => `<li>${item}</li>`).join("")}</ul>`);
      listBuffer = [];
    }
  }

  function makeId(text) {
    let id = slugify(text) || "section";
    let suffix = 1;
    while (usedIds.has(id)) {
      id = `${slugify(text)}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(id);
    return id;
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      continue;
    }
    const headingMatch = /^(#{1,3})\s+(.*)$/.exec(line);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const rawText = headingMatch[2];
      const id = makeId(rawText);
      toc.push({ level, text: rawText, id });
      htmlParts.push(`<h${level} id="${id}">${applyInline(escapeHtml(rawText))}</h${level}>`);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      listBuffer.push(applyInline(escapeHtml(line.replace(/^[-*]\s+/, ""))));
      continue;
    }
    flushList();
    htmlParts.push(`<p>${applyInline(escapeHtml(line))}</p>`);
  }
  flushList();

  return { html: htmlParts.join("\n"), toc };
}

/** 태그/카테고리/제목 유사도/최근 조회/즐겨찾기를 조합한 연관 글 추천 */
export function findRelatedPosts(post, allPosts, { recentlyViewedIds = [], favoriteIds = [] } = {}) {
  const postWords = new Set(post.title.toLowerCase().split(/\s+/));
  return allPosts
    .filter((candidate) => candidate.id !== post.id)
    .map((candidate) => {
      let score = 0;
      const sharedTags = (candidate.tags ?? []).filter((tag) => post.tags?.includes(tag));
      score += sharedTags.length * 5;
      if (candidate.category === post.category) score += 3;
      const candidateWords = new Set(candidate.title.toLowerCase().split(/\s+/));
      const overlapWords = [...postWords].filter((word) => candidateWords.has(word));
      score += overlapWords.length * 2;
      if (recentlyViewedIds.includes(candidate.id)) score += 2;
      if (favoriteIds.includes(candidate.id)) score += 3;
      return { post: candidate, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((entry) => entry.post);
}

/** 초안 자동저장 + undo/redo를 core/state-store.js 재사용으로 구현(작성 중인 글 하나에 대응) */
export function createDraftSession(initial = { title: "", content: "", tags: [] }) {
  const store = createStore(initial, { persistKey: "blog-draft", storageAdapter: localStore });
  eventBus.emit(EVENTS.BLOG_DRAFT_SAVED);
  return store;
}

/** 예약 발행 mock: publishAt이 지난 draft/scheduled 글을 published로 전환 */
export async function processScheduledPublishing() {
  const posts = await getAllPosts();
  const now = Date.now();
  const due = posts.filter((post) => post.status === "scheduled" && post.publishAt && new Date(post.publishAt).getTime() <= now);
  for (const post of due) {
    await upsertPost({ ...post, status: "published", publishedAt: new Date().toISOString() });
  }
  return due.map((post) => post.id);
}
