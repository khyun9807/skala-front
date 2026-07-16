/* ─────────────────────────────────────────────────────────────
   script/folio/blog.js — blog.html 배선
   TesseraJS 블로그 기능(IndexedDB)으로 글 목록·상세·조회수·좋아요·북마크를 구동.
   글 상세는 folio 모달로 표시, 카테고리는 aur-badge(aurora)로.
   ───────────────────────────────────────────────────────────── */
import './toast.js';
import { initPage } from './page.js';
import { showToast } from '../../tessera-js/js/features/notifications.js';
import { apiClient } from '../../tessera-js/js/network/api-client.js';
import * as blog from '../../tessera-js/js/features/blog.js';
import { OBJECT_STORES } from '../../tessera-js/js/config/constants.js';
import { reseedIfStale } from './reseed.js';

initPage();

const dialog = document.getElementById('post-modal');
const CAT = { frontend: '프론트엔드', travel: '여행', backend: '백엔드', devops: 'DevOps', design: '디자인', career: '커리어', database: '데이터베이스', project: '프로젝트', game: '게임' };

async function fetchJSON(path) {
  const { data } = await apiClient.get(path, { cache: { enabled: true, ttl: 5 * 60_000 } });
  return data;
}
const fmtDate = (d) => new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
const excerpt = (md = '') => md.replace(/[#>*`_[\]-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 110) + '…';
const meta = (p) => `${p.author} · ${fmtDate(p.publishedAt || p.createdAt)} · 조회 ${p.viewCount ?? 0} · ♡ ${p.likeCount ?? 0}`;

function renderList(posts) {
  const list = document.getElementById('blog-list');
  list.textContent = '';
  if (!posts.length) { const e = document.createElement('p'); e.style.opacity = '.5'; e.textContent = '글이 없습니다.'; list.appendChild(e); return; }
  posts.forEach((post) => {
    const card = document.createElement('article');
    card.className = 'folio-block folio-block--click';
    card.tabIndex = 0; card.dataset.cursor = '읽기';
    const badge = document.createElement('span'); badge.className = 'aur-badge'; badge.textContent = CAT[post.category] || post.category;
    const h = document.createElement('h3'); h.textContent = post.title;
    const m = document.createElement('span'); m.className = 'folio-block__meta'; m.textContent = meta(post);
    const p = document.createElement('p'); p.style.cssText = 'font-size:13px;opacity:.7;line-height:1.6'; p.textContent = excerpt(post.content);
    card.append(badge, h, m, p);
    card.addEventListener('click', () => openPost(post.id));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter') openPost(post.id); });
    list.appendChild(card);
  });
}

async function openPost(id) {
  await blog.incrementViewCount(id);
  const post = await blog.getPostById(id);
  if (!post) return;
  document.getElementById('post-cat').textContent = CAT[post.category] || post.category;
  document.getElementById('post-title').textContent = post.title;
  document.getElementById('post-meta').textContent = meta(post);
  document.getElementById('post-content').textContent = post.content;

  const likeBtn = document.getElementById('post-like');
  likeBtn.textContent = `♡ 좋아요 ${post.likeCount ?? 0}`;
  likeBtn.onclick = async () => {
    await blog.toggleLike(id);
    const p = await blog.getPostById(id);
    likeBtn.textContent = `♥ 좋아요 ${p.likeCount ?? 0}`;
    document.getElementById('post-meta').textContent = meta(p);
  };

  const bmBtn = document.getElementById('post-bookmark');
  const syncBm = () => { bmBtn.textContent = blog.isBookmarked(id) ? '🔖 북마크됨' : '🔖 북마크'; };
  syncBm();
  bmBtn.onclick = () => {
    blog.toggleBookmark(id);
    syncBm();
    showToast(blog.isBookmarked(id) ? '북마크에 저장했습니다.' : '북마크를 해제했습니다.', { type: 'success' });
  };

  dialog.showModal();
}

dialog.querySelector('[data-modal-close]').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

(async function init() {
  await reseedIfStale(OBJECT_STORES.BLOG_POSTS); // 시드 버전이 바뀌었으면 옛 데모 글을 비움
  await blog.seedPostsIfEmpty(() => fetchJSON('../tessera-js/data/blog-posts.json'));
  const posts = (await blog.getAllPosts())
    .filter((p) => (p.status ?? 'published') === 'published')
    .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
  renderList(posts);
})();
