import { indexedDb } from "../storage/indexed-db.js";
import { localStore } from "../storage/local-storage.js";
import { downloadJSON } from "../files/file-exporter.js";
import { generateId } from "../utils/security.js";
import { sortBy } from "../utils/array.js";
import { ValidationError } from "../core/errors.js";
import { OBJECT_STORES } from "../config/constants.js";

const STORE = OBJECT_STORES.COMMENTS;
const RATE_LIMIT_KEY = "comment-last-posted-at";
const RATE_LIMIT_MS = 10_000;
const BANNED_WORDS = ["바보", "멍청이", "시발", "개새끼"];

export function getCommentsByPost(postId) {
  return indexedDb.getAllByIndex(STORE, "by_postId", postId);
}

export function containsBannedWords(text) {
  const lower = text.toLowerCase();
  return BANNED_WORDS.some((word) => lower.includes(word));
}

function assertCanPost(author) {
  const lastPostedAt = localStore.get(RATE_LIMIT_KEY, {})[author] ?? 0;
  const elapsed = Date.now() - lastPostedAt;
  if (elapsed < RATE_LIMIT_MS) {
    throw new ValidationError(`너무 빠르게 연속 작성하고 있습니다. ${Math.ceil((RATE_LIMIT_MS - elapsed) / 1000)}초 후 다시 시도해주세요.`);
  }
}

function markPosted(author) {
  const all = localStore.get(RATE_LIMIT_KEY, {});
  localStore.set(RATE_LIMIT_KEY, { ...all, [author]: Date.now() });
}

/**
 * 낙관적 업데이트 패턴: 호출자가 먼저 임시 댓글을 화면에 그리고, 이 함수가 실패하면
 * (reject) 호출자가 그 임시 댓글을 되돌려야 한다(features 계층은 DOM을 모르므로 롤백은 페이지 담당).
 */
export async function addComment({ postId, parentId = null, author, content }) {
  if (!content?.trim()) throw new ValidationError("댓글 내용을 입력해주세요.");
  if (containsBannedWords(content)) throw new ValidationError("금칙어가 포함되어 있습니다.");
  assertCanPost(author);

  const comment = {
    id: generateId("comment"),
    postId,
    parentId,
    author,
    content: content.trim(),
    likeCount: 0,
    reported: false,
    createdAt: new Date().toISOString(),
  };
  await indexedDb.put(STORE, comment);
  markPosted(author);
  return comment;
}

export async function editComment(id, content) {
  if (containsBannedWords(content)) throw new ValidationError("금칙어가 포함되어 있습니다.");
  const comment = await indexedDb.get(STORE, id);
  if (!comment) throw new Error(`comment not found: ${id}`);
  const updated = { ...comment, content: content.trim(), editedAt: new Date().toISOString() };
  await indexedDb.put(STORE, updated);
  return updated;
}

export async function deleteComment(id) {
  await indexedDb.delete(STORE, id);
}

export async function toggleCommentLike(id) {
  const comment = await indexedDb.get(STORE, id);
  const updated = { ...comment, likeCount: (comment.likeCount ?? 0) + 1 };
  await indexedDb.put(STORE, updated);
  return updated;
}

export async function reportComment(id) {
  const comment = await indexedDb.get(STORE, id);
  const updated = { ...comment, reported: true };
  await indexedDb.put(STORE, updated);
  return updated;
}

export function sortComments(comments, sortKey = "latest") {
  if (sortKey === "popular") return sortBy(comments, (comment) => comment.likeCount ?? 0, "desc");
  return sortBy(comments, (comment) => new Date(comment.createdAt).getTime(), "desc");
}

export function filterCommentsByAuthor(comments, author) {
  return author ? comments.filter((comment) => comment.author === author) : comments;
}

/** 평면 배열을 { comment, replies:[...] } 트리로 변환(Map으로 부모-자식 관계 구성) */
export function buildReplyTree(comments) {
  const byId = new Map(comments.map((comment) => [comment.id, { comment, replies: [] }]));
  const roots = [];
  for (const node of byId.values()) {
    if (node.comment.parentId && byId.has(node.comment.parentId)) {
      byId.get(node.comment.parentId).replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export function exportCommentsJSON(postId, comments) {
  downloadJSON({ postId, comments }, `comments-${postId}`);
}
