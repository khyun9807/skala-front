import { initApp, renderToast } from "../app.js";
import { qs, createElement, renderEmptyState } from "../dom/selector.js";
import { observeIntersection } from "../dom/observers.js";
import { trackReadingProgress } from "../events/scroll.js";
import { globalShortcuts } from "../events/shortcuts.js";
import { apiClient } from "../network/api-client.js";
import { debounce } from "../utils/debounce.js";
import { relativeTime, formatDate } from "../utils/date.js";
import * as auth from "../features/auth.js";
import {
  seedPostsIfEmpty,
  getAllPosts,
  getPostById,
  incrementViewCount,
  toggleLike,
  toggleBookmark,
  isBookmarked,
  getBookmarks,
  recordView,
  getRecentlyViewed,
  saveReadingPosition,
  getReadingPosition,
  parseMarkdownSubset,
  findRelatedPosts,
  createDraftSession,
  computeReadingTime,
} from "../features/blog.js";
import { getCommentsByPost, addComment, sortComments, buildReplyTree, toggleCommentLike } from "../features/comments.js";
import { summarizeRuleBased } from "../services/summarizer-service.js";

const { lifecycle } = initApp({ pageName: "blog-detail" });

async function fetchJSON(path) {
  const { data } = await apiClient.get(path, { cache: { enabled: true, ttl: 5 * 60_000 } });
  return data;
}

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

function renderCommentNode(node, { onLike, onReply }) {
  const wrapper = createElement("div", { class: "comment" }, [
    createElement("p", { class: "text-sm text-muted" }, [`${node.comment.author} · ${relativeTime(node.comment.createdAt)}`]),
    createElement("p", {}, [node.comment.content]),
  ]);
  const likeBtn = createElement("button", { class: "btn btn--sm", type: "button" }, [`👍 ${node.comment.likeCount ?? 0}`]);
  likeBtn.addEventListener("click", () => onLike(node.comment.id));
  wrapper.appendChild(likeBtn);
  if (auth.isLoggedIn()) {
    const replyBtn = createElement("button", { class: "btn btn--sm", type: "button" }, ["답글"]);
    replyBtn.addEventListener("click", () => onReply(node.comment.id));
    wrapper.appendChild(replyBtn);
  }
  if (node.replies.length) {
    const repliesEl = createElement("div", { class: "comment__reply" });
    node.replies.forEach((child) => repliesEl.appendChild(renderCommentNode(child, { onLike, onReply })));
    wrapper.appendChild(repliesEl);
  }
  return wrapper;
}

async function initComments() {
  const listEl = qs("#comment-list");
  const form = qs("#comment-form");
  const input = qs("#comment-input");
  let replyingTo = null;

  async function render() {
    const comments = sortComments(await getCommentsByPost(postId), qs("#comment-sort").value);
    const tree = buildReplyTree(comments);
    listEl.textContent = "";
    if (!tree.length) {
      renderEmptyState(listEl, { message: "첫 댓글을 남겨보세요." });
      return;
    }
    tree.forEach((node) =>
      listEl.appendChild(
        renderCommentNode(node, {
          onLike: async (id) => {
            await toggleCommentLike(id);
            render();
          },
          onReply: (id) => {
            replyingTo = id;
            input.placeholder = "답글을 입력하세요";
            input.focus();
          },
        })
      )
    );
  }

  qs("#comment-sort").addEventListener("change", render);
  input.addEventListener("input", () => {
    qs("#comment-char-count").textContent = String(input.value.length);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const session = auth.getSession();
    if (!session) {
      renderToast({ message: "로그인 후 댓글을 작성할 수 있습니다.", type: "error" });
      return;
    }
    const content = input.value.trim();
    if (!content) return;
    const parentId = replyingTo;
    input.value = "";
    qs("#comment-char-count").textContent = "0";

    const tempNode = { comment: { id: `temp-${Date.now()}`, author: session.username, content, createdAt: new Date().toISOString(), likeCount: 0 }, replies: [] };
    const tempEl = renderCommentNode(tempNode, { onLike: () => {}, onReply: () => {} });
    tempEl.style.opacity = "0.6";
    listEl.prepend(tempEl);

    try {
      await addComment({ postId, parentId, author: session.username, content });
      replyingTo = null;
      input.placeholder = "댓글을 입력하세요 (로그인 필요)";
      await render();
    } catch (error) {
      tempEl.remove();
      renderToast({ message: error.message, type: "error" });
    }
  });

  await render();
}

async function initView(post, allPosts) {
  qs("#blog-detail-view").hidden = false;
  document.title = `${post.title} - TesseraJS`;
  qs("#detail-title").textContent = post.title;
  qs("#detail-meta").textContent = `${post.author} · ${formatDate(post.publishedAt ?? post.createdAt)} · ${computeReadingTime(post.content)} · 조회 ${post.viewCount ?? 0}`;

  const { html, toc } = parseMarkdownSubset(post.content);
  const contentEl = qs("#detail-content");
  contentEl.innerHTML = html;

  const tocEl = qs("#detail-toc");
  tocEl.textContent = "";
  toc.forEach((heading) => {
    tocEl.appendChild(
      createElement("a", { href: `#${heading.id}`, class: "toc__link", style: `padding-left:${(heading.level - 1) * 12}px; display:block;` }, [heading.text])
    );
  });

  const headings = Array.from(contentEl.querySelectorAll("h1[id], h2[id], h3[id]"));
  if (headings.length) {
    const headingObserver = observeIntersection(
      headings,
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            tocEl.querySelectorAll(".toc__link").forEach((link) => {
              link.dataset.active = String(link.getAttribute("href") === `#${entry.target.id}`);
            });
          }
        });
      },
      { rootMargin: "-10% 0px -70% 0px" }
    );
    lifecycle.onCleanup(() => headingObserver.disconnect());
  }

  const progressBar = qs("#reading-progress-bar");
  const offProgress = trackReadingProgress(contentEl, (ratio) => {
    progressBar.style.width = `${Math.round(ratio * 100)}%`;
    saveReadingPosition(post.id, ratio);
  });
  lifecycle.onCleanup(offProgress);

  const lastPosition = getReadingPosition(post.id);
  if (lastPosition > 0.05) {
    requestAnimationFrame(() => {
      const target = lastPosition * (document.documentElement.scrollHeight - window.innerHeight);
      window.scrollTo(0, target);
    });
  }

  const likeBtn = qs("#detail-like-btn");
  function updateLikeBtn() {
    likeBtn.textContent = `👍 좋아요 ${post.likeCount ?? 0}`;
  }
  updateLikeBtn();
  likeBtn.addEventListener("click", async () => {
    const result = await toggleLike(post.id);
    post.likeCount = result.post.likeCount;
    updateLikeBtn();
  });

  const bookmarkBtn = qs("#detail-bookmark-btn");
  function updateBookmarkBtn() {
    bookmarkBtn.textContent = isBookmarked(post.id) ? "★ 북마크 해제" : "☆ 북마크";
  }
  updateBookmarkBtn();
  bookmarkBtn.addEventListener("click", () => {
    toggleBookmark(post.id);
    updateBookmarkBtn();
  });

  qs("#detail-share-btn").addEventListener("click", async () => {
    await navigator.clipboard.writeText(window.location.href);
    renderToast({ message: "링크를 복사했습니다.", type: "success" });
  });
  qs("#detail-print-btn").addEventListener("click", () => window.print());

  qs("#detail-summarize-btn").addEventListener("click", () => {
    const summaryEl = qs("#detail-summary");
    if (!summaryEl.hidden) {
      summaryEl.hidden = true;
      return;
    }
    summaryEl.textContent = summarizeRuleBased(html, { sentenceCount: 3 });
    summaryEl.hidden = false;
  });

  const publishedPosts = allPosts.filter((candidate) => candidate.status === "published");
  const related = findRelatedPosts(post, publishedPosts, { recentlyViewedIds: getRecentlyViewed(), favoriteIds: getBookmarks() });
  const relatedEl = qs("#detail-related");
  relatedEl.textContent = "";
  if (!related.length) renderEmptyState(relatedEl, { message: "관련 글이 없습니다." });
  else related.forEach((rp) => relatedEl.appendChild(createElement("article", { class: "card" }, [createElement("a", { href: `blog-detail.html?id=${rp.id}` }, [rp.title])])));

  await initComments();

  recordView(post.id);
  await incrementViewCount(post.id);
}

function initEditor() {
  qs("#blog-detail-editor").hidden = false;
  const store = createDraftSession({ title: "", content: "" });
  const titleInput = qs("#editor-title");
  const contentInput = qs("#editor-content");
  const preview = qs("#editor-preview");
  const saveStatus = qs("#editor-save-status");

  function renderPreview() {
    const { html } = parseMarkdownSubset(contentInput.value);
    preview.innerHTML = html || "<p class='text-muted'>미리보기가 여기 표시됩니다.</p>";
  }

  const initial = store.getState();
  titleInput.value = initial.title;
  contentInput.value = initial.content;
  renderPreview();

  const persistDebounced = debounce(() => {
    store.setState({ title: titleInput.value, content: contentInput.value });
    saveStatus.textContent = `자동 저장됨 (${new Date().toLocaleTimeString("ko-KR")})`;
  }, 600);

  titleInput.addEventListener("input", () => {
    renderPreview();
    persistDebounced();
  });
  contentInput.addEventListener("input", () => {
    renderPreview();
    persistDebounced();
  });

  qs("#editor-undo").addEventListener("click", () => {
    if (store.undo()) {
      const s = store.getState();
      titleInput.value = s.title;
      contentInput.value = s.content;
      renderPreview();
    }
  });
  qs("#editor-redo").addEventListener("click", () => {
    if (store.redo()) {
      const s = store.getState();
      titleInput.value = s.title;
      contentInput.value = s.content;
      renderPreview();
    }
  });

  lifecycle.onCleanup(
    globalShortcuts.register(
      "ctrl+s",
      (event) => {
        event.preventDefault();
        persistDebounced.flush();
        saveStatus.textContent = `저장됨 (${new Date().toLocaleTimeString("ko-KR")})`;
        renderToast({ message: "초안이 저장되었습니다.", type: "success" });
      },
      { description: "블로그 초안 저장", allowInInputs: true }
    )
  );
}

async function init() {
  await seedPostsIfEmpty(() => fetchJSON("../data/blog-posts.json"));
  const allPosts = await getAllPosts();

  if (postId) {
    const post = allPosts.find((p) => p.id === postId) ?? (await getPostById(postId));
    if (!post) {
      qs("#blog-detail-view").hidden = false;
      qs("#detail-title").textContent = "글을 찾을 수 없습니다.";
      renderToast({ message: "요청한 글을 찾을 수 없습니다.", type: "error" });
      return;
    }
    await initView(post, allPosts);
  } else {
    initEditor();
  }
}

init();
